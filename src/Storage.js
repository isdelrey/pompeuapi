import Mongoose from 'mongoose'
var Storage = {};

Mongoose.connect(process.env.DATABASE_URL, {
    useMongoClient: true
})
Mongoose.Promise = global.Promise

Storage.User = Mongoose.model('User', {
    username: String,
    name: String,
    subscribed: Boolean,
    chat_id: Number,
    official_id: String,
    birthdate: String,
    subscribed: Boolean,
    schedule: {
        raw: Array,
        image: String
    }
})

export default Storage