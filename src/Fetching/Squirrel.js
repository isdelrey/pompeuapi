/*
    --------------------
    Squirrel
    --------------------
    Squirrel takes care of the dirty stuff: crawling the pages & retrieving information
    It issues promises to all tasks given and returns relevant data on resolution

    It takes care of retrying and issues a promise rejection when data cannot be retrieved
*/
import HeadlessChrome from 'simple-headless-chrome'
import Pages from './Pages'
import Errors from './Pages'

/* Exportable crawler class */
export default class {
    constructor() {
        this.browser = new HeadlessChrome({
            headless: true,
            launchChrome: false,
            chrome: {
              host: process.env.CHROME_HOST,
              port: process.env.CHROME_PORT,
              remote: true,
            },
            browserlog: true
        })
    }
    async init() {
        return this.browser.init()
            .then(() => {
                return this.browser.newTab({ privateTab: false })
            })
            .then ((tab) => {
                this.tab = tab
                return Promise.resolve()
            })
    }
    purge() {
        this.tab.close()
        this.browser.close()
    }
    page(name,...args) {
        console.log("◦ Page: " + name)
        if(args.length > 0)
            console.log("Args: " + args)
        return new Promise(async (ok, error) => {
            if(!Pages.hasOwnProperty(name)) {
                error({
                    why: Errors.INTERNAL,
                    details: 'Page is not in Pages Array'
                })
                return;
            }
            try {
                ok(await Pages[name]({ browser: this.browser, tab: this.tab }, ...args))
                console.log("● Page: " + name)
            }
            catch(details) {
                error({
                    why: Errors.INTERNAL,
                    details: details
                })
            }
        })
    }
}