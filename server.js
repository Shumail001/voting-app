const express = require("express")

const app = express()
require("dotenv").config();
const userRoute = require("./routes/user")
const candidateRoute = require("./routes/candidateRoute")


const db = require("./database")

app.use(express.json())



app.use("/user",userRoute)
app.use("/candidate",candidateRoute)


app.listen(process.env.PORT, () => console.log(`Server is Listening on Port ${process.env.PORT}`))


