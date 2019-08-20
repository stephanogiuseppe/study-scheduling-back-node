import * as Yup from 'yup'
import { startOfHour, parseISO, isAfter } from 'date-fns'

import User from '../models/User'
import Appointment from '../models/Appointment'
import File from '../models/File'

class AppointmentController {
  async index(req, res) {
    const { page = 1, itensPerPage = 20 } = req.query
    const appointments = await Appointment.findAll({
      where: { user_id: req.userId, canceled_at: null },
      order: ['date'],
      attributes: ['id', 'date'],
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

    try {
      if (!(await checkUserIsProvider(provider_id))) {
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

      return res.status(201).json(appointment)
    } catch (error) {
      return res.status(500).json({ error: 'Web server is down' })
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

export default new AppointmentController()
