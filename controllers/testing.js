const router = require('express').Router()
const User = require('../models/user')
const Blog = require('../models/blogs')

router.post('/reset', async (req, res) => {
    await Blog.deleteMany({})
    await User.deleteMany({})

    res.status(204).end()
})

module.exports = router
