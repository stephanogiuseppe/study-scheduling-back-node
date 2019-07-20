import * as Yup from 'yup'
import User from '../models/User'
class UserController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string()
        .required()
        .min(8)
    })

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' })
    }

    try {
      const userExists = await User.findOne({
        where: { email: req.body.email }
      })

      if (userExists) {
        return res.status(400).json({ error: 'User already exists' })
      }
      const { id, name, email, provider } = await User.create(req.body)

      return res.json({ id, name, email, provider })
    } catch (error) {
      res.status(500).json({ error: 'Web server is down' })
    }
  }

  async update(req, res) {
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

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' })
    }

    try {
      const { email, password_old } = req.body
      const user = await User.findByPk(req.userId)

      if (email !== user.email) {
        const userExists = await User.findOne({
          where: { email: req.body.email }
        })

        if (userExists) {
          return res.status(400).json({ error: 'E-mail already exists' })
        }
      }

      if (password_old && !(await user.checkPassword(password_old))) {
        return res.status(401).json({ error: 'Incorrect password' })
      }

      const { id, name, provider } = await user.update(req.body)

      return res.json({ id, name, email, provider })
    } catch (error) {
      res.status(500).json({ error: 'Web server is down' })
    }
  }
}

export default new UserController()
