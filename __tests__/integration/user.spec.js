import request from 'supertest'

import app from '../../src/app'

describe('User', () => {
  it('It should be register a user', async () => {
    const res = await request(app)
      .post('/users')
      .send({
        name: 'Ste',
        email: 'ste@email.com',
        password: 'strongPass'
      })

    expect(res.body).toHaveProperty('id')
  })
})
