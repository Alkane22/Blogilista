const bcrypt = require('bcrypt')
const User = require('../models/user')

const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')

const app = require('../app')
const api = supertest(app)

describe('when there is initially one user at db', () => {
    beforeEach(async () => {
        await User.deleteMany({})

        const passwordHash = await bcrypt.hash('sekret', 10)

        const user = new User({ username: 'root', passwordHash })

        await user.save()
    })


    test('creation succeeds with a fresh username', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'mluukkai',
            name: 'Matti Luukkainen',
            password: 'salainen',
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

        const usernames = usersAtEnd.map(u => u.username)
        expect(usernames).toContain(newUser.username)
    })

    
    test('creation fails with proper statuscode and message if username already taken', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'root',
            name: 'Superuser',
            password: 'salainen',
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        expect(result.body.error).toContain('username must be unique')

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length)
    })

    test('creation fails with proper statuscode and message if password is too short', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'boot',
            name: 'Superuser',
            password: 'ab',
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        expect(result.body.error).toContain('password is too short')

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length)
    })
    /*
    test('blog can be added to user and id matches', async () => {
        const users = await helper.usersInDb()

        const newBlog = {
            title: "TestBlog",
            author: "Testman",
            url: "test.com",
            likes: 10,
            userId: users[0].id
        }

        const result = await api
            .post("/api/blogs")
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        expect(result.body.user).toContain(users[0].id)

        const updatedUsers = await helper.usersInDb()

        expect(updatedUsers[0].blogs[0]).toContain(mongoose.Types.ObjectId(result.body.id))

        const deleted = await api
            .delete(`/api/blogs/${result.id}`)
            .expect(204)
    })
    */
})