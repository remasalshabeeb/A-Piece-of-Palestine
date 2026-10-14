import express from "express";
import { connectDb} from "./src/config/db.js";
import dotenv from "dotenv";
//import Category from "./src/models/category.Model.js";
import CategoriesRoutes from "./src/routes/category.Routes.js";
import authRoutes from "./src/routes/auth.Routes.js"
import userRoutes from "./src/routes/user.Routes.js";
//dotenv
dotenv.config();



const app= express();
app.use(express.json());
connectDb();


app.get("/H", (req,res)=>{
     res.send("the server is helthy and work well A Picec Of Palestain");

});

app.use('/api', CategoriesRoutes);
app.use('/api', authRoutes);
app.use('/api', userRoutes);



const port= process.env.PORT;

app.listen(port ,()=> {
    console.log("server is working");
});