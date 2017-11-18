import Server from './API/Server'
import Feed from './Feed'
let server = new Server()
server.start()
setInterval(() => {
    Feed()
}, 86400000)