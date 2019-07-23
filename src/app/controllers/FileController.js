import File from '../models/File'

class FileController {
  async store(req, res) {
    const { originalName: name, filename: path } = req.file

    try {
      const file = await File.create({ name, path })
      return res.status(201).json(file)
    } catch (error) {
      res.status(500).json({ error: 'Web server is down' })
    }
  }
}

export default new FileController()
