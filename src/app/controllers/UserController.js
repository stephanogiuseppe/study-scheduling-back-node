import User from '../models/User'

class UserController {
  async store(req, res) {
    const userExists = await User.findOne({
      where: { email: req.body.email }
    })

    if (userExists) {
      return res.status(400).json({ error: 'User already exists' })
    }

    const { id, name, email, provider } = await User.create(req.body)

    return res.json({ id, name, email, provider })
  }

  async update(req, res) {
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
  }
}

export default new UserController()
