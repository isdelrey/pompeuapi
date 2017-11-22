import Fetch from '../Fetching/Fetch'
import Squirrel from '../Fetching/Squirrel'
import Feed from '../Feed'
import Errors from '../Fetching/Errors'
import Storage from '../Storage'

export default (server) => {
    // Root
    server.get('/', (req, res, next) => {
        res.send(200)
        next()
    })
    // New User
    server.put('/users/:username', (req, res, next) => {
        let body = req.body || {}
        body.username = req.params.username
        Storage.User.find({
            username: body.username
        }).then((users) => {
            if(users.length)
                res.send(904)
                next()
                return
        })
        new Storage.User(body)
        .save()
        .then(() => {
            res.send(200)
        })
        next()
    })
    // Update User
    server.post('/users/:username', (req, res, next) => {
        Storage.User.update({
            username: req.params.username
        },req.body)
        .then((user) => {
            res.send(200)
        })
        .catch((err) => {
            res.send(500, err)
        })
        next()
    })
    // Get User
    server.get('/users/:username', (req, res, next) => {
        let _ = req.query._
        delete req.query._
        Storage.User.findOne({
            username: req.params.username
        })
        .select(_)
        .then((user) => {
            if(user == null)
                res.send(404)
            else
                res.send(200, user)
        })
        .catch((err) => {
            res.send(500, err)
        })
        next()
    })
    // Get Users
    server.get('/users', (req, res, next) => {
        let _ = req.query._
        delete req.query._
        Storage.User.find(req.query)
        .select(_)
        .then((user) => {
            if(user == null)
                res.send(404)
            else
                res.send(200, user)
        })
        .catch((err) => {
            res.send(500, err)
        })
        next()
    })
    // Test Login
    server.put('/users/:username/schedule/test', async (req, res, next) => {
        res.keepAlive = true
        try {
            let squirrel = new Squirrel()
            await squirrel.init()
            let fetch = new Fetch(squirrel, req.body.official_id, req.body.birthdate)
            fetch.check().then((name) => {
                res.send(200, {
                    name: name
                })
                squirrel.purge();
                next()
            }).catch((err) => {
                if(err.details.why == Errors.LOGIN_FAILS)
                    res.send(403)
                else {
                    console.log("✕ " + JSON.stringify(err))
                    res.send(500)
                }
                squirrel.purge().catch(null)
                next()
            })
        }
        catch(err) {
            res.send(500, err)
        }
    })
    server.get('/users/:username/schedule/feed', async (req, res, next) => {
        try {
            Feed.single(req.params.username)
            res.send(200)
        }
        catch(err) {
            console.log(err)
        }
    })
    server.get('/users/:username/schedule/today', async (req, res, next) => {
        let response = []
        let day_start = new Date().getTime()
        day_start -= day_start % 86400000
        day_start -= 3600000
        let day_end = day_start + 86400000
        Storage.User.findOne({
            username: req.params.username
        })
        .select("schedule.raw")
        .then((user) => {
            if(user == null)
                res.send(404)
            else {
                for(let entry of user.schedule.raw) {
                    if(entry.start >= day_start && entry.end <= day_end) {
                        let start = new Date(entry.start)
                        let end = new Date(entry.end)
                        entry.start = start.getHours() + ":" + start.getMinutes()
                        entry.end = end.getHours() + ":" + end.getMinutes()
                        response.push(entry)
                    }
                }
            }
            res.send(200, response)
        })
        .catch((err) => {
            console.log(err)
            res.send(500, err)
        })
        next()
    })
    server.get('/users/:username/schedule/tomorrow', async (req, res, next) => {
        let response = []
        let day_start = new Date().getTime() + 86400000
        day_start -= day_start % 86400000
        day_start -= 3600000
        let day_end = day_start + 86400000
        Storage.User.findOne({
            username: req.params.username
        })
        .select("schedule.raw")
        .then((user) => {
            if(user == null)
                res.send(404)
            else {
                for(let entry of user.schedule.raw) {
                    if(entry.start >= day_start && entry.end <= day_end) {
                        let start = new Date(entry.start)
                        let end = new Date(entry.end)
                        entry.start = start.getHours() + ":" + start.getMinutes()
                        entry.end = end.getHours() + ":" + end.getMinutes()
                        response.push(entry)
                    }
                }
            }
            res.send(200, response)
        })
        .catch((err) => {
            console.log(err)
            res.send(500, err)
        })
        next()
    })
    server.get('/users/:username/schedule/next', async (req, res, next) => {
        let response = []
        let now = new Date().getTime()
        let day_end = new Date().getTime()
        day_end -= day_end % 86400000
        day_end += 82800000
        Storage.User.findOne({
            username: req.params.username
        })
        .select("schedule.raw")
        .then((user) => {
            if(user == null)
                res.send(404)
            else {
                for(let entry of user.schedule.raw) {
                    if(entry.start >= now && entry.end <= day_end) {
                        let start = new Date(entry.start)
                        let end = new Date(entry.end)
                        entry.start = start.getHours() + ":" + start.getMinutes()
                        entry.end = end.getHours() + ":" + end.getMinutes()
                        response.push(entry)
                    }
                }
            }
            res.send(200, response)
        })
        .catch((err) => {
            console.log(err)
            res.send(500, err)
        })
        next()
    })
    server.get('/users/:username/schedule/now', async (req, res, next) => {
        let response = []
        let now = new Date().getTime()
        Storage.User.findOne({
            username: req.params.username
        })
        .select("schedule.raw")
        .then((user) => {
            if(user == null)
                res.send(404)
            else {
                for(let entry of user.schedule.raw) {
                    if(entry.start <= now && entry.end >= now) {
                        let start = new Date(entry.start)
                        let end = new Date(entry.end)
                        entry.start = start.getHours() + ":" + start.getMinutes()
                        entry.end = end.getHours() + ":" + end.getMinutes()
                        response.push(entry)
                    }
                }
            }
            res.send(200, response)
        })
        .catch((err) => {
            console.log(err)
            res.send(500, err)
        })
        next()
    })
    server.get('/schedule/now', async (req, res, next) => {
        let response = []
        let now = process.env.STATE == "true" ? new Date().getTime() : parseInt(req.query.now),
            in5min = now + 300000
        console.log("STATE: " + process.env.STATE)
        console.log("now: " + now)
        Storage.User.find(null)
        .select("username schedule.raw")
        .then((users) => {
            if(users.length == 0)
                res.send(404)
            else {
                for(let user of users) {
                    console.log(user.username)
                    let piece = {
                        username: user.username,
                        schedule: []
                    }
                    for(let entry of user.schedule.raw) {
                        console.log(entry.start + "<=" + in5min)
                        console.log(entry.start + " > " + now)
                        console.log(".")
                        if(entry.start <= in5min && entry.start > now) {
                            let start = new Date(entry.start)
                            let end = new Date(entry.end)
                            entry.start = start.getHours() + ":" + start.getMinutes()
                            entry.end = end.getHours() + ":" + end.getMinutes()
                            piece.schedule.push(entry)
                        }
                    }
                    if(piece.schedule.length > 0)
                        response.push(piece)
                }
                res.send(200, response)
            }
        })
        .catch((err) => {
            console.log(err)
            res.send(500, err)
        })
        next()
    })
}