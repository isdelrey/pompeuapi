import Restify from 'restify'
import Routes from './Routes'
import fs from 'fs'
export default class {
    constructor() {
        this.server = Restify.createServer()
        this.server.use(Restify.plugins.queryParser())
        this.server.use(Restify.plugins.bodyParser())
        this.server.use(function (req, res, next) {
            if(req.query.token == process.env.TOKEN)
                return next();
            else
                res.send(403)
        });
        Routes(this.server)
    }
    start() {
        this.server.listen(8080, () => {
            console.log('%s listening at %s', this.server.name, this.server.url)
          });
    }
}