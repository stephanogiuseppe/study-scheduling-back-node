import request from 'supertest'

import app from '../../src/app'
import truncate from '../utils/truncate'

describe('User', () => {
  beforeEach(async () => truncate())

  describe('Store functions', () => {
    it('Should be register an user', async () => {
      const res = await request(app)
        .post('/users')
        .send({
          name: 'Ste',
          email: 'ste@email.com',
          password: 'strongPass'
        })

      expect(res.body).toHaveProperty('id')
    })

    it('Should not register an user when json object is wrong', async () => {
      const res = await request(app)
        .post('/users')
        .send({ nome: 'Ste', email: 'ste@email.com', password: 'strongPass' })

      expect(res.status).toBe(400)
    })

    it('Should not register an user with duplicated email', async () => {
      await request(app)
        .post('/users')
        .send({ name: 'Ste', email: 'ste@email.com', password: 'strongPass' })

      const res = await request(app)
        .post('/users')
        .send({ name: 'Giu', email: 'ste@email.com', password: 'strongPass' })

      expect(res.status).toBe(400)
    })
  })

  describe('Update functions', () => {
    it('Should be update an user', async () => {
      await request(app)
        .post('/users')
        .send({ name: 'Ste', email: 'ste@email.com', password: 'weakPassword' })

      const resCredentials = await request(app)
        .post('/auth')
        .send({ email: 'ste@email.com', password: 'weakPassword' })

      const credentials = JSON.parse(resCredentials.text)

      const res = await request(app)
        .put('/users')
        .set('Authorization', `Bearer ${credentials.token}`)
        .send({
          name: 'Ste',
          email: 'ste@gmail.com',
          password: 'strongPass',
          password_old: 'weakPassword',
          password_confirmation: 'strongPass'
        })

      expect(res.body).toHaveProperty('id')
    })

    it('Should not update an user when json object is wrong', async () => {
      await request(app)
        .post('/users')
        .send({ name: 'Ste', email: 'ste@email.com', password: 'weakPassword' })

      const resCredentials = await request(app)
        .post('/auth')
        .send({ email: 'ste@email.com', password: 'weakPassword' })

      const credentials = JSON.parse(resCredentials.text)

      const res = await request(app)
        .put('/users')
        .set('Authorization', `Bearer ${credentials.token}`)
        .send({
          name_new: 'Ste',
          email_new: 'ste@gmail.com',
          password_current: 'strongPass',
          password_old: 'weakPassword',
          password_confirmation: 'strongPass'
        })

      expect(res.status).toBe(400)
    })

    it('Should not update an user with email duplicated', async () => {
      await request(app)
        .post('/users')
        .send({ name: 'Test', email: 'test@mail.com', password: 'password1' })

      await request(app)
        .post('/users')
        .send({ name: 'Ste', email: 'ste@email.com', password: 'weakPassword' })

      const resCredentials = await request(app)
        .post('/auth')
        .send({ email: 'ste@email.com', password: 'weakPassword' })

      const credentials = JSON.parse(resCredentials.text)

      const res = await request(app)
        .put('/users')
        .set('Authorization', `Bearer ${credentials.token}`)
        .send({
          name: 'Ste',
          email: 'test@mail.com',
          password: 'strongPassword',
          password_old: 'weakPassword',
          password_confirmation: 'strongPassword'
        })

      expect(res.status).toBe(400)
    })

    it('Should not update an user with incorrect password', async () => {
      await request(app)
        .post('/users')
        .send({ name: 'Ste', email: 'ste@email.com', password: 'weakPassword' })

      const resCredentials = await request(app)
        .post('/auth')
        .send({ email: 'ste@email.com', password: 'weakPassword' })

      const credentials = JSON.parse(resCredentials.text)

      const res = await request(app)
        .put('/users')
        .set('Authorization', `Bearer ${credentials.token}`)
        .send({
          name: 'Ste',
          email: 'ste@gmail.com',
          password: 'strongPass',
          password_old: 'password',
          password_confirmation: 'strongPass'
        })

      expect(res.status).toBe(401)
    })
  })
})
