import dotenv from 'dotenv';
import connectDB from "./db/db.js";

dotenv.config();
console.log(process.env);


import express from "express"
const app = express();


/*
; (async () => {
    try {
        await Mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error", (error) => {
            console.log("Not Connected", error)
            throw error;
        })
        app.listen(process.env.PORT,()=>{
            console.log(`App is listening on port ${process.env.PORT}`)
        })
    } catch (error) {
        console.error("Alert", error);
        throw error;
    }
})()
*/


connectDB();


