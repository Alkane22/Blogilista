const bRouter = require('express').Router()
const mongoose = require('mongoose')
const logger = require('../utils/logger')
const blog = require('../models/blogs')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const { userExtractor } = require('../utils/middleware')

bRouter.get('/', async (request, response) => {
    const blogs = await blog.find({})
        .populate('user', { username: 1, name: 1, id: 1 })
    response.json(blogs)
})

bRouter.post('/', userExtractor, async (req, res) => {
    const body = req.body
    const user = await User.findById(req.user.id)
    /*
    const decodeToken = jwt.verify(req.token, process.env.SECRET)
    if (!req.token || !decodeToken.id) {
        return res.status(401).json({
            error: 'token missing or invalid'
        })
    }

    console.log(req.user)
    const user = await User.findById(decodeToken.id)
    */
    const newBlog = new blog({
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes || 0,
        user: user._id
    })

    const savedBlog = await newBlog.save()

    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()

    res.status(201).json(savedBlog)
})

bRouter.delete('/:id', async (req, res) => {
    const decodeToken = jwt.verify(req.token, process.env.SECRET)
    if (!req.token || !decodeToken.id) {
        return res.status(401).json({
            error: 'token missing or invalid'
        })
    }

    const blogObj = await blog.findById(req.params.id)

    if (blogObj.user.toString() === decodeToken.id.toString()) {
        await blog.deleteOne({ '_id': mongoose.Types.ObjectId(req.params.id) })
        res.status(204).end()
    } else {
        resizeTo.status(401).json({
            error: 'missing rights for delete'
        })
    }
})

bRouter.get('/:id', async (req, res) => {
    const reqBlog = await blog.findById(req.params.id)
    if (reqBlog) {
        res.json(reqBlog)
    } else {
        res.status(404).end()
    }
})

bRouter.put('/:id', async (req, res) => {
    const { title, author, url, likes } = req.body

    const upBlog = await blog.findByIdAndUpdate(
        req.params.id,
        { title, author, url, likes },
        { new: true, runValidators: true, context: 'query' }
    )

    res.status(201).json(upBlog)
})
module.exports = bRouter