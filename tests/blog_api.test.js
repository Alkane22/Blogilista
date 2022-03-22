const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blogs')

let token = ''
let username = ''
let userId = ''

test('cant add blog without token', async () => {
    const newBlog = {
        title: "NoToken",
        author: "Nobody",
        url: "Missing.io",
        user: userId,
        likes: 10
    }

    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(401)
        .expect('Content-Type', /application\/json/)
})

test('can login with predefined account', async () => {
    const userObj = {
        username: 'mluukkai',
        password: 'salainen'
    }

    const response = await api
        .post('/api/login/')
        .send(userObj)
        .expect(200)
        .expect('Content-Type', /application\/json/)

    expect(response.body.username).toEqual(userObj.username)

    token = response.body.token
    username = response.body.username
    userId = response.body.id
})


beforeEach(async () => {
    await Blog.deleteMany({})

    const blogObjs = helper.initialBlogs.map(b => new Blog(b))
    const promiseArray = blogObjs.map(b => b.save())

    await Promise.all(promiseArray)
})

test('a blog can be modified', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToMod = {
        title: "RandomModdedBlog",
        author: "Freya",
        url: "Ragnarok.com",
        likes: 11,
    }

    await api
        .put(`/api/blogs/${blogsAtStart[0].id}`)
        .send(blogToMod)
        .expect(201)

    const response = await api.get('/api/blogs')
    const contents = response.body.map(r => r.title)

    expect(contents).toContain(blogToMod.title)
})


test('a specific blog is within the returned blogs', async () => {
    const response = await api.get('/api/blogs')

    const contents = response.body.map(r => r.title)
    expect(contents).toContain(
        'TestBlog'
    )
})

test('a valid blog can be added ', async () => {
    const newBlog = {
        title: "ThemBlogs",
        author: "Maria",
        url: "Shady.gov",
        user: userId,
        likes: 9
    }

    await api
        .post('/api/blogs')
        .set('Authorization', 'bearer ' + token)
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')

    const contents = response.body.map(r => r.title)

    expect(response.body).toHaveLength(helper.initialBlogs.length + 1)
    expect(contents).toContain(
        'ThemBlogs'
    )
})

test('blog without likes works', async () => {
    const newblog = {
        title: "NobodyLikesMe",
        author: "Sadman",
        url: "Verysadge.io",
        user: userId
    }

    await api
        .post('/api/blogs')
        .set('Authorization', 'bearer ' + token)
        .send(newblog)
        .expect(201)

    const response = await api.get('/api/blogs')
    const contents = response.body.map(r => r.title)

    expect(contents).toContain('NobodyLikesMe')
})

test('blog without content is not added', async () => {
    const newblog = {
        title: "failure"
    }

    await api
        .post('/api/blogs')
        .set('Authorization', 'bearer ' + token)
        .send(newblog)
        .expect(400)

    const response = await api.get('/api/blogs')

    expect(response.body).toHaveLength(helper.initialBlogs.length)
})

test('blogs are returned as json', async () => {
    await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)
})

test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')

    expect(response.body).toHaveLength(helper.initialBlogs.length)
})


test('a blog without user can be deleted', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set('Authorization', 'bearer ' + token)
        .expect(204)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(
        helper.initialBlogs.length - 1
    )

    const contents = blogsAtEnd.map(r => r.title)

    expect(contents).not.toContain(blogToDelete.title)
})

test('trying to delete blog without permission is denied', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[1]

    await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set('Authorization', 'bearer ' + token)
        .expect(401)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(
        helper.initialBlogs.length
    )

    const contents = blogsAtEnd.map(r => r.title)

    expect(contents).toContain(blogToDelete.title)
})

afterAll(() => {
    mongoose.connection.close()
})