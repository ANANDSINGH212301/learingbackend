import { mongoose } from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        const connectionInsatnce = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`\n mongoDB connected Host : ${connectionInsatnce.connection.host}`);
    } catch (error) {
        console.log("mongoDB connected error :", error);
        process.exit(1);
    }
}

export default connectDB;