import Fetch from './Fetching/Fetch'
import Squirrel from './Fetching/Squirrel'
import Storage from './Storage'

let forSingle = async (squirrel, user) => {
    console.log("◦ User: " + user.name)
    let fetch = new Fetch(squirrel, user.official_id, user.birthdate)
    let result = await fetch.schedule().catch((err) => {
        console.log("✕ " + JSON.stringify(err))
    })
    Storage.User.update({
        _id: user._id
    }, { $set: {
        schedule: {
            raw: result.raw,
            image: result.image
        }
    }})
    .then(() => {
        console.log("+ Saved")
    })
    .catch((err) => {
        console.log("✕ Could not save to database: " + JSON.stringify(err))
    })
    console.log("● User: " + user.name)
}

const Feed = {
    all: async () => {
        try {
            console.log("◦ Feeding")
            let squirrel = new Squirrel()
            await squirrel.init()
            const _users = await Storage.User.find({
                subscribed: true
            });
            console.log(_users.length + " subscribed User/s")
            if(_users.length > 0)
                await (async (users) => {
                    for(let user of users)
                        await forSingle(squirrel, user)
                })(_users)
            squirrel.purge()
            console.log("● Feeding")
        }
        catch(err) {

        }
    },
    single: async (username) => {
        console.log("◦ Feeding Single: " + username)
        let squirrel = new Squirrel()
        await squirrel.init()
        const user = await Storage.User.findOne({
            username: username
        });
        if(user != null)
            await forSingle(squirrel, user)
        else
            console.log("✕ username does not exist")
        squirrel.purge()
        console.log("● Feeding Single: " + username)
    }
}

export default Feed