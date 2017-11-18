import Errors from './Errors'

var ATTEMPTS = 3
var attempt = (fn) => {
    return new Promise(async (resolve, reject) => {
        let err 
        for(let i = 0; i <= ATTEMPTS; i++) {
            let initial = new Date().getTime()
            console.log("- Attempt " + i)
            try {
                let result = await fn()
                resolve(result)
                console.log("+ took " + ((new Date().getTime() - initial) / 1000) + "s")
                break
            }
            catch(got) {
                err = got
                console.log("✕ " + JSON.stringify(err))
                if(!(got.why == Errors.TIMEOUT || got.why == Errors.INTERNAL))
                    break
            }
        }
        if(typeof err != "undefined")
            reject(err)
    })
}
export default class {
    constructor(Squirrel, official_id, birthdate) {
        this.Squirrel = Squirrel
        this.official_id = official_id
        this.birthdate = birthdate
    }
    schedule(...args) {
        return attempt(async () => {
            await this.Squirrel.page('login', this.official_id, this.birthdate)
            await this.Squirrel.page('menu')
            const image = await this.Squirrel.page('imageschedule')
            const raw = await this.Squirrel.page('rawschedule')
            return {
                image: image,
                raw: raw
            }
        })
    }
    check(...args) {
        return attempt(async () => {
            await this.Squirrel.page('login', this.official_id, this.birthdate)
            return this.Squirrel.page('name')
        })
    }
    name(...args) {
        return attempt(async () => {
            await this.Squirrel.page('login', this.official_id, this.birthdate)
            return this.Squirrel.page('name')
        })
    }
}