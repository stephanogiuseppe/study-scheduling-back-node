import request from 'supertest'

import app from '../../src/app'
import truncate from '../utils/truncate'

describe('Appointment', () => {
  beforeEach(async () => truncate())

  describe('Store functions', () => {
    it('Should be register an appointment', async () => {
      const provider = await request(app)
        .post('/users')
        .send({
          name: 'Provider',
          email: 'provider@email.com',
          password: 'password1',
          provider: true
        })

      await request(app)
        .post('/users')
        .send({ name: 'Ste', email: 'ste@email.com', password: 'weakPassword' })

      const resCredentials = await request(app)
        .post('/auth')
        .send({ email: 'ste@email.com', password: 'weakPassword' })

      const credentials = JSON.parse(resCredentials.text)

      const res = await request(app)
        .post('/appointments')
        .set('Authorization', `Bearer ${credentials.token}`)
        .send({
          provider_id: provider.body.id,
          date: '2019-09-01T18:00:00-03:00'
        })

      expect(res.body).toHaveProperty('date')
    })

    it('Should not be register an appointment with past date', async () => {
      await request(app)
        .post('/users')
        .send({ name: 'Ste', email: 'ste@email.com', password: 'weakPassword' })

      const resCredentials = await request(app)
        .post('/auth')
        .send({ email: 'ste@email.com', password: 'weakPassword' })

      const provider = await request(app)
        .post('/users')
        .send({
          name: 'Provider',
          email: 'provider@email.com',
          password: 'password1',
          provider: true
        })

      const credentials = JSON.parse(resCredentials.text)

      const res = await request(app)
        .post('/appointments')
        .set('Authorization', `Bearer ${credentials.token}`)
        .send({
          provider_id: provider.body.id,
          date: '2019-06-01T18:00:00-03:00'
        })

      expect(res.status).toBe(400)
    })

    it('Should not be register an appointment with same date', async () => {
      await request(app)
        .post('/users')
        .send({ name: 'Ste', email: 'ste@email.com', password: 'weakPassword' })

      const resCredentials = await request(app)
        .post('/auth')
        .send({ email: 'ste@email.com', password: 'weakPassword' })

      const provider = await request(app)
        .post('/users')
        .send({
          name: 'Provider',
          email: 'provider@email.com',
          password: 'password1',
          provider: true
        })

      const credentials = JSON.parse(resCredentials.text)
      const nextYear = new Date().getFullYear()

      await request(app)
        .post('/appointments')
        .set('Authorization', `Bearer ${credentials.token}`)
        .send({
          provider_id: provider.body.id,
          date: `${nextYear}-06-01T18:00:00-03:00`
        })

      const res = await request(app)
        .post('/appointments')
        .set('Authorization', `Bearer ${credentials.token}`)
        .send({
          provider_id: provider.body.id,
          date: `${nextYear}-06-01T18:00:00-03:00`
        })

      expect(res.status).toBe(400)
    })
  })
})
