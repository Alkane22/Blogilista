const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)

test('can login with predefined account', async () => {
    const userObj = {
        username: 'mluukkai',
        password: 'salainen'
    }

    const response  = await api
        .post('/api/login/')
        .send(userObj)
        .expect(200)
        .expect('Content-Type', /application\/json/)

    expect(response.body.username).toEqual(userObj.username)
})