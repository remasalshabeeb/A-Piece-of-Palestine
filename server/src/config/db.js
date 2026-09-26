import mongoose from "mongoose";


export const connectDb=async() => {
    try{
        await mongoose.connect(process.env.MONGODB_URL)
        console.log("Mongo is connected")

    } catch (error) {
        console.log("Mongo is Not connected",error);
        process.exit(1)
    }
}

