const logger = require('./logger')
const jwt = require('jsonwebtoken')
const req = require('express/lib/request')

const requestLogger = (request, response, next) => {
  logger.info('Method:', request.method)
  logger.info('Path:  ', request.path)
  logger.info('Body:  ', request.body)
  logger.info('---')
  next()
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  logger.error(error.message)
  logger.info(error.name)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  } else if (error.name === 'BSONTypeError') {
    return response.status(400).json({ error: 'malformatted id' })
  } else if (error.name === 'TypeError') {
    return response.status(400).json({ error: error.message })
  } else if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({
      error: 'invalid token'
    })
  } else if (error.name === 'TokenExpiredError') {
    return response.status(401).json({
      error: 'token expired'
    })
  }

  next(error)
}

const tokenExtractor = (req, res, next) => {
  const authorization = req.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    req.token = authorization.substring(7)
  } else {
    req.token = null
  }
  next()
}

const userExtractor = (req, res, next) => {
  const decodeToken = jwt.verify(req.token, process.env.SECRET)
  if (!req.token || !decodeToken.id) {
    return res.status(401).json({
      error: 'token missing or invalid'
    })
  }
  req.user = decodeToken
  next()
}


module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  tokenExtractor,
  userExtractor
}