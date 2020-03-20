import User from '../models/User'
import Notification from '../schemas/Notification'

class NotificationController {
  async index(req, res) {
    try {
      const user = await checkUserIsProvider(req.userId)

      if (!user) {
        return res
          .status(401)
          .json({ error: 'Only provider can load notifications' })
      }

      const notifications = await Notification.find({ User: req.userId })
        .sort({ createdAt: 'desc' })
        .limit(10)

      return res.json(notifications)
    } catch (error) {
      return res.status(500).json({ error: 'Web server error' })
    }
  }

  async update(req, res) {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    )

    return res.json(notification)
  }
}

async function checkUserIsProvider(id) {
  const isProvider = await User.findOne({
    where: { id, provider: true }
  })
  return isProvider
}

export default new NotificationController()
