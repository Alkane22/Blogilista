const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        minlength: 4
    },
    name: {
        type: String
    },
    passwordHash: {
        type: String,
        required: true
    },
    blogs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'blog'
        }
    ]
})

userSchema.set('toJSON', {
    transform: (document, retObj) => {
        retObj.id = retObj._id.toString()
        delete retObj._id
        delete retObj._v
        delete retObj.passwordHash
    }
})

const User = mongoose.model('User', userSchema)

module.exports = User