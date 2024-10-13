const mongoose = require("mongoose")


const mongoURl = process.env.MONGO_URL

mongoose.connect(mongoURl)


const db = mongoose.connection

db.on("connected", () => {
    console.log("MongoDB is Connected!");
})

db.on("error", () => {
    console.log("MongoDB Connection Error!")
})

db.on("disconnected", () => {
    console.log("Disconnect MongoDB!")
})


module.exports = db