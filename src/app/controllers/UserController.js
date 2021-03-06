import * as Yup from 'yup'
import User from '../models/User'
import File from '../models/File'

class UserController {
  async store(req, res) {
    if (!(await checkValidationData(req.body))) {
      return res.status(400).json({ error: 'Validation fails' })
    }

    try {
      if (await checkUserAlreadyExists(req.body.email)) {
        return res.status(400).json({ error: 'User already exists' })
      }
      const { id, name, email, provider } = await User.create(req.body)

      return res.status(201).json({ id, name, email, provider })
    } catch (error) {
      /* istanbul ignore next */
      res.status(500).json({ error: 'Web server is down' })
    }
  }

  async update(req, res) {
    if (!(await checkValidationUpdateData(req.body))) {
      return res.status(400).json({ error: 'Validation fails' })
    }

    try {
      const { email, password_old } = req.body
      const user = await User.findByPk(req.userId)

      if (email !== user.email) {
        if (await checkUserAlreadyExists(email)) {
          return res.status(400).json({ error: 'E-mail already exists' })
        }
      }

      if (password_old && !(await user.checkPassword(password_old))) {
        return res.status(401).json({ error: 'Incorrect password' })
      }

      await user.update(req.body)

      const { id, name, avatar } = await User.findByPk(req.userId, {
        include: [
          {
            model: File,
            as: 'avatar',
            attributes: ['id', 'path', 'url']
          }
        ]
      })

      return res.json({ id, name, email, avatar })
    } catch (error) {
      /* istanbul ignore next */
      res.status(500).json({ error: 'Web server is down' })
    }
  }
}

async function checkValidationData(data) {
  const schema = Yup.object().shape({
    name: Yup.string().required(),
    email: Yup.string()
      .email()
      .required(),
    password: Yup.string()
      .required()
      .min(8)
  })

  const validData = await schema.isValid(data)
  return validData
}

async function checkUserAlreadyExists(email) {
  const userExists = await User.findOne({
    where: { email }
  })
  return userExists
}

async function checkValidationUpdateData(data) {
  const schema = Yup.object().shape({
    name: Yup.string(),
    email: Yup.string().email(),
    password_old: Yup.string().min(8),
    password: Yup.string()
      .min(8)
      .when('password_old', (password_old, field) =>
        password_old ? field.required() : field
      ),
    password_confirmation: Yup.string().when('password', (password, field) =>
      password ? field.required().oneOf([Yup.ref('password')]) : field
    )
  })

  const validData = await schema.isValid(data)
  return validData
}

export default new UserController()
