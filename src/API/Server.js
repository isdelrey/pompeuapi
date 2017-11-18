import Restify from 'restify'
import Routes from './Routes'
import fs from 'fs'
export default class {
    constructor() {
        let https_options = {
            key: fs.readFileSync('/etc/letsencrypt/live/vultr.ivosequeros.com/privkey.pem'),
            certificate: fs.readFileSync('/etc/letsencrypt/live/vultr.ivosequeros.com/fullchain.pem')
        };
        this.server = Restify.createServer(https_options)
        this.server.use(Restify.plugins.queryParser())
        this.server.use(Restify.plugins.bodyParser())
        Routes(this.server)
    }
    start() {
        this.server.listen(443, () => {
            console.log('%s listening at %s', this.server.name, this.server.url)
          });
    }
}