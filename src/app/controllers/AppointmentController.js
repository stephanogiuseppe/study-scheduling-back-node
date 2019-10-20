import * as Yup from 'yup'
import en from 'date-fns/locale/en-US'
import {
  startOfHour,
  parseISO,
  isAfter,
  format,
  subHours,
  isBefore
} from 'date-fns'

import User from '../models/User'
import Appointment from '../models/Appointment'
import File from '../models/File'
import Notification from '../schemas/Notification'
import CancellationMail from './../jobs/CancellationMail'
import Queue from './../../lib/Queue'

class AppointmentController {
  async index(req, res) {
    const { page = 1, itensPerPage = 20 } = req.query
    const appointments = await Appointment.findAll({
      where: { user_id: req.userId, canceled_at: null },
      order: ['date'],
      attributes: ['id', 'date', 'past', 'cancelable'],
      limit: 20,
      offset: (page - 1) * itensPerPage,
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'name'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'path', 'url']
            }
          ]
        }
      ]
    })

    return res.json(appointments)
  }

  async store(req, res) {
    if (!(await checkValidationData(req.body))) {
      return res.status(400).json({ error: 'Validation fails' })
    }

    const { provider_id, date } = req.body

    const user = await checkUserIsProvider(provider_id)

    if (provider_id === user.id) {
      return res
        .status(401)
        .json({ error: 'You can not create appointments with same provider' })
    }

    try {
      if (!user) {
        return res
          .status(401)
          .json({ error: 'You can only create appointments with providers' })
      }

      if (!checkStartHourIsValid(date)) {
        return res.status(400).json({ error: 'Past date not permited' })
      }

      if (!(await checkAvailableAppointment(provider_id, date))) {
        return res.status(400).json({ error: 'Appointment is not available' })
      }

      const appointment = await Appointment.create({
        user_id: req.userId,
        provider_id,
        date
      })

      await Notification.create({
        content: `New appointment for ${user.name} in ${formatDateToPT(date)}`,
        user: provider_id
      })

      return res.status(201).json(appointment)
    } catch (error) {
      return res.status(500).json({ error: 'Web server error' })
    }
  }

  async delete(req, res) {
    try {
      const appointment = await Appointment.findByPk(req.params.id, {
        include: [
          {
            model: User,
            as: 'provider',
            attributes: ['name', 'email']
          },
          {
            model: User,
            as: 'user',
            attributes: ['name']
          }
        ]
      })

      if (appointment.user_id !== req.userId) {
        return res.status(401).json({
          error: "You don't have permission to cancel  this appointment"
        })
      }

      const dateWithSub = subHours(appointment.date, 2)

      if (isBefore(dateWithSub, new Date())) {
        return res.status(401).json({
          error: 'You can only cancel appointments 2 hours in advance'
        })
      }

      appointment.canceled_at = new Date()

      await appointment.save()

      await Queue.add(CancellationMail.key, { appointment })

      return res.json(appointment)
    } catch (error) {
      return res.status(500).json({ error: 'Web server error' })
    }
  }
}

async function checkValidationData(data) {
  const schema = Yup.object().shape({
    provider_id: Yup.number().required(),
    date: Yup.date().required()
  })

  const validData = await schema.isValid(data)
  return validData
}

async function checkUserIsProvider(id) {
  const isProvider = await User.findOne({
    where: { id, provider: true }
  })
  return isProvider
}

function checkStartHourIsValid(date) {
  const hourStart = startOfHour(parseISO(date))
  return isAfter(hourStart, new Date())
}

async function checkAvailableAppointment(providerId, date) {
  const hourStart = startOfHour(parseISO(date))
  const isNotAvailable = await Appointment.findOne({
    where: { provider_id: providerId, canceled_at: null, date: hourStart }
  })
  return !isNotAvailable
}

function formatDateToPT(date) {
  const formatedDate = startOfHour(parseISO(date))
  return format(formatedDate, "dd'/'MMMM 'at' H:mm", { locale: en })
}

export default new AppointmentController()
