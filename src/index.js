import { app } from "./app.js";

import dotenv from 'dotenv';

// dotenv.config({
//     path: './.env'
// })

// ()
// .then(() => {
// app.listen(process.env.PORT || 8000, () => {
//     console.log(`Server is running at port : ${process.env.PORT}`);
// })
// })
// .catch((err) => {
//     console.log(`MONGODB connection failed !!!`, err);
// })

app.listen(process.env.PORT || 8000, () => {
    console.log(`Server is running at port: ${process.env.PORT}`);
})