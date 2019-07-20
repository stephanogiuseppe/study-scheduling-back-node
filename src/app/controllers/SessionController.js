import * as Yup from 'yup'
import jwt from 'jsonwebtoken'

import User from '../models/User'
import authConfig from '../../config/auth'

class SessionController {
  async store(req, res) {
    const schema = Yup.object().shape({
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string().required()
    })

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' })
    }

    let user = null
    const { email, password } = req.body

    try {
      user = await User.findOne({ where: { email } })
    } catch (error) {
      res.status(500).json({ error: 'Web server is down' })
    }

    if (!user) {
      return res.status(400).json({ error: 'User not found' })
    }

    if (!(await user.checkPassword(password))) {
      return res.status(401).json({ error: 'Incorrect password' })
    }

    const { id, name } = user

    return res.json({
      user: { id, name, email },
      token: jwt.sign({ id }, authConfig.secret, {
        expiresIn: authConfig.expiresIn
      })
    })
  }
}

export default new SessionController()
