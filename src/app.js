import express from 'express'
import routes from './routes'

class App {
  constructor() {
    this.server = express()
    this.middlewares()
    this.routes()
    const var_doida = 3
    console.log(var_doida)
  }

  middlewares() {
    this.server.use(express.json())
  }

  routes() {
    this.server.use(routes)
  }
}

export default new App().server
