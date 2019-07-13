import { Router } from 'express'

const routes = new Router()

routes.get('/', (req, res) => {
  return res.json({ name: 'OK' })
})

export default routes
