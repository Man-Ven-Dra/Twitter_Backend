import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
    try{
        const {fullname, username, email, password} = req.body;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return res.status(400).json({ error: "Invalid email format" });
		}

        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({
                success: false,
                message: "Email already exists."
            });
        }

        if(password.length < 5) {
            return res.status(400).json({
                error: "Password length should be more than 5"
            })
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullname,
            username,
            email,
            password: hashedPassword
        });
        await newUser.save();

        res.status(200).json({
            success: true,
            message: 'Account Created Successfully',
            _id: newUser._id,
				fullName: newUser.fullName,
				username: newUser.username,
				email: newUser.email,
				followers: newUser.followers,
				following: newUser.following,
				profileImg: newUser.profileImg,
				coverImg: newUser.coverImg,
        })

    } catch(error) {
        res.status(400).json({
            success: false,
            message: "Signup Failed!",
            error: error.message
        })
    }
}

export const login = async (req, res) => {
    try {
        const {email, password} = req.body;
        if( !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Enter both Email & Password'
            })
        }

        const existingUser = await User.findOne({email});
        if(!existingUser) {
            return res.status(400).json({
                success: false,
                message: "User does not Exit!"
            })
        }

        const comparePassword = bcrypt.compare(password, existingUser.password)
        if(!comparePassword){
            return res.status(400).json({
                success: false,
                message: "Password does not match"
            })
        }

        const payload = {
            userId: existingUser._id,
            email: existingUser.email,
            username: existingUser.username
        }

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '3d'
        })

        const options = {
            expires: new Date( Date.now() + 3 * 24 * 60 * 60 * 1000),
            httpOnly: true,
        }
        res.cookie('token', token, options).status(200).json({
            success:true,
            token,
            existingUser,
            message: 'User Logged In.'
        })
    } catch(error) {
        res.status(400).json({
            success: false,
            message: "Login Failed!",
            error: error.message
        })
    }
}

export const logout = async (req, res) => {
    try {
        res.cookie("token", "", {maxAge:0});
        res.status(200).json({message: "User Logged out Successfully!"})
    } catch(error){
        res.status(400).json({
            success: false,
            message: "Logout Failed!",
            error: error.message
        })
    }
}

export const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        res.status(200).json(user)
    } catch(error) {
        res.status(400).json({
            success: false,
            message: "Failed to fetch User!",
            error: error.message
        })
    }
}