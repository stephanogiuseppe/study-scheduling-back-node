import User from '../models/User'
import Notification from '../schemas/Notification'

class NotificationController {
  async index(req, res) {
    const user = await checkUserIsProvider(req.userId)

    if (!user) {
      return res
        .status(401)
        .json({ error: 'Only provider can load notifications' })
    }

    const notifications = await Notification.find({ user: req.userId })
      .sort({ createdAt: 'desc' })
      .limit(10)

    return res.json(notifications)
  }
}

async function checkUserIsProvider(id) {
  const isProvider = await User.findOne({
    where: { id, provider: true }
  })
  return isProvider
}

export default new NotificationController()
