import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if(!token) {
            return res.status(400).json({
                error: "User not Authorized!"
            })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if(!decoded) {
            return res.status(400).json({
                error: "Invalid Token"
            })
        }

        const user = await User.findById(decoded.userId).select("-password");
        if(!user){
            return res.status(400).json({
                error: "User not Found"
            })
        }

        req.user = user;
        next();
    } catch(error){
        res.status(400).json({
            success: false,
            message: "Error in protectRoute",
            error: error.message
        })
    }
}