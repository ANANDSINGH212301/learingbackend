import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";

const app = express();


app.use(cors({                        // This is to tackle cross origin error   
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));


app.use(express.json({               // configuration for  form (when form will submit it will reach server through this.)
    limit:"16kb"                 
}))

app.use(express.urlencoded({        // This configuration is to read data through url
    extended: true,
    limit: "16kb"
}))

app.use(express.static("public"))   // this is use to configure and use public file in  backend and browser
app.use(cookieParser())            // this is use to perform CRUD operation on cookies in browser

//routes import 
import userRouter from "./routes/user.routes.js"

//routes declaration
app.use("/api/v1/users",userRouter)

export {app};
