import mongoose from "mongoose";
import { DB_NAME } from "../constants";


const connectDB = async () => {
    const connectionInstance = await mongoose.connect(`${"mongodb://127.0.0.1:27017"}/${DB_NAME}`)
    console.log(`\n MONGODB connected !! DB Host : ${connectionInstance.connection.host}`);
}