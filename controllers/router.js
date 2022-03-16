const bRouter = require('express').Router()
const mongoose = require('mongoose')
const logger = require('../utils/logger')
const blog = require('../models/blogs')

bRouter.get('/', async (request, response) => {
    const blogs = await blog.find({})
    response.json(blogs)
})

bRouter.post('/', async (req, res) => {
    const body = req.body

    const newBlog = new blog({
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes || 0
    })

    const savedBlog = await newBlog.save()
    res.status(201).json(savedBlog)
})

bRouter.delete('/:id', async (req, res) => {
    await blog.deleteOne({'_id': mongoose.Types.ObjectId(req.params.id)})
    res.status(204).end()
})

bRouter.get('/:id', async (req, res) => {
    const reqBlog = await blog.findById(req.params.id)
    if (reqBlog){
        res.json(reqBlog)
    } else {
        res.status(404).end()
    }
})

module.exports = bRouter