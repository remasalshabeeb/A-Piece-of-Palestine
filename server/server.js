import express from "express";
import { connectDb} from "./src/config/db.js";
import dotenv from "dotenv";
//dotenv
dotenv.config();



const app= express();
connectDb();


app.get("/H", (req,res)=>{
     res.send("the server is helthy and work well A Picec Of Palestain");

});

const port= process.env.PORT;

app.listen(port ,()=> {
    console.log("server is working");
});