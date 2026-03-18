import { app } from "./app.js";
import dotenv from 'dotenv';
import connectDB from "./db/db.js";
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({
    path: path.resolve(__dirname, '../.env')
})

connectDB()
.then(() => {
app.listen(process.env.PORT || 8000, () => {
    console.log(`Server is running at port : ${process.env.PORT}`);
})
})

.catch((err) => {
    console.log(`MONGODB connection failed !!!`, err);
})
