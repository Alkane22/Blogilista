const Blog = require('../models/blogs')

const initialBlogs = [
    {
        title: "TestBlog",
        author: "Smith",
        url: "lol.com",
        likes: 4
    },
    {
        title: "RandomBlog",
        author: "John",
        url: "wtf.io",
        likes: 8
    },
]

const nonExistingId = async () => {
    const note = new Blog({
        title: "ToBeRemoved",
        author: "Hidden",
        url: "FBI.gov",
        likes: 11
    })
    await note.save()
    await note.remove()

    return note._id.toString()
}

const blogsInDb = async () => {
    const blogs = await Blog.find({})
    return blogs.map(blog => blog.toJSON())
}

module.exports = {
    initialBlogs, nonExistingId, blogsInDb
}