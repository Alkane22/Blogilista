const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const logger = require('./utils/logger')
require('express-async-errors')
const {PORT, MONGODB_URI} = require('./utils/config')
const blog = require('./controllers/router')
const middleware = require('./utils/middleware')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')

const morgan = require('morgan')

mongoose.connect(MONGODB_URI)
.then(() => {logger.info('Connected')})
.catch((error) => {logger.error('Error:', error.message)})

morgan.token('body', (req) => JSON.stringify(req.body))

app.use(cors())
app.use(express.static('build'))
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))


app.use(middleware.tokenExtractor)

app.use('/api/blogs', blog)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)

app.use(middleware.errorHandler)
module.exports = app