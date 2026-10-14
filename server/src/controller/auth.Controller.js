import bcrypt from "bcryptjs";
import User from "../models/user.Model.js";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, phoneNumber } = req.body;

    // validation
    if (!name || !email || !password || !confirmPassword) {
      return res
        .status(400)
        .json({ message: "please enter all required fields" });
    }

    if (name.length < 3) {
      return res.status(400).json({ message: "name must be more than 2 characters" });
    }
    
    const isExist = await User.findOne({ email: email });
    if (isExist) {
      return res.status(400).json({ message: "email already exists!" }); 
    }

    if (password != confirmPassword) {
      return res.status(400).json({ message: "passwords do not match" });
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "password should contain letters in lower case and uppercase, numbers, special characters, and be at least 8 characters long",
      });
    }

    const hashed_password = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name: name,
      email: email,
      hashed_password: hashed_password,
      phoneNumber: phoneNumber,
      role: "user",
    });
    
    return res.status(201).json({ message: "created account successfully! please login!", newUser });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "internal server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // validation
    if (!email || !password) {
      return res.status(400).json({ message: "Please enter your email and your password to login!" });
    }

    // check if the email exist.
    const userIsExist = await User.findOne({ email });
    if (!userIsExist) {
      return res.status(404).json({ message: "You dont have an account! please register" });
    }

    // if the user registered.
    const isMatch = await bcrypt.compare(password, userIsExist.hashed_password);
    if (!isMatch) {
      return res.status(400).json({ message: "email or password is not correct!" }); 
    }

    const tokens = jwt.sign(
      {
        id: userIsExist._id, 
        name: userIsExist.name,
        email: userIsExist.email,
        role: userIsExist.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "20m",
      }
    );

    return res.status(200).json({
      message: "logged in successfully!", 
      user: {
        id: userIsExist._id, 
        name: userIsExist.name,
        email: userIsExist.email,
        role: userIsExist.role,
      },
      tokens,
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "internal server error" });
  }
};