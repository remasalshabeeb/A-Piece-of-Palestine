import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
        minlength: 3,
        maxlength: 100,
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        lowercase: true,
        trim: true,
        maxlength: 254,
        unique: true
    },
    hashed_password: {
        type: String,
        required: [true, "Password is required"],
        select: false,
      },
    phoneNumber: {
        type: String,
        trim: true,
        default: "",
    },
    profileImage: {
      type: String,
      default: "",
      trim: true,
    },
    
    role: {
        type: String,
        enum: ["admin", "contentManager", "user"],
        default: "user",
        required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      required: true,
    },
}, 
    {
     timestamps: true
     })

const User = mongoose.model("User", userSchema);

export default User;
