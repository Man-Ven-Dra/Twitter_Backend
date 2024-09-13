import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import { v2 as cloudinary } from "cloudinary";

export const createPost = async (req, res) => {
    try {
        const {text} = req.body;
        let {img} = req.body;
        const user = await User.findById(req.user._id);
        if(!user){
            return res.status(400).json({
                success: false,
                message: "User not found!"
            })
        }
        if(!text && !img){
            return res.status(400).json({
                success: false,
                message: "Post must have some text or an image!"
            })
        }

        if(img){
			const uploadedResponse = await cloudinary.uploader.upload(img);
			img = uploadedResponse.secure_url;
		}

        const newPost = new Post({
            user: req.user._id,
            text,
            img,
        })
        await newPost.save();

        user.posts.push(newPost._id);
        await user.save();

        res.status(200).json({
            success: true,
            message: "Post Created Successfully!",
            newPost
        })
    } catch(error){
        return res.status(400).json({
            success: false,
            message: "Post creation Failed!",
            error: error.message,
        })
    }
}

export const deletePost = async (req, res) => {
    try{
        const postId = req.params.id;
        const post = await Post.findById(postId);
        if(!post){
            return res.status(400).json({
                success: false,
                message: "Post not Found!"
            })
        }
        if(post.user.toString() !== req.user._id.toString()){
            return res.status(400).json({
                success: false,
                message: "You are not authorized to delete this Post!"
            })
        }
        if(post.img){
			const imgId = post.img.split("/").pop().split(".")[0];
			await cloudinary.uploader.destroy(imgId);
		}

        await Post.findByIdAndDelete(postId);

        res.status(200).json({
            success:true,
            message: "Post Deleted Successfully!"
        })
    } catch(error){
        return res.status(400).json({
            success: false,
            message: "Post deletion Failed!",
            error: error.message,
        })
    }
}

export const commentPost = async (req, res) => {
    try{
        const {text} = req.body;
        const postId = req.params.id;
        const userId = req.user._id;
        const post = await Post.findById(postId);

        if(!post){
            return res.status(400).json({
                success: false,
                message: "Post not Found!"
            })
        }
        if(!text){
            return res.status(400).json({
                success: false,
                message: "Cannot post empty comment!"
            })
        }

        const comment = {
            user: userId,
            text,
        }
        post.comments.push(comment);
        await post.save();

        res.status(200).json({
            success: true,
            message: "Comment added Successfully!"
        })

    } catch(error){
        return res.status(400).json({
            success: false,
            message: "Failed to Comment on Post!",
            error: error.message,
        })
    }
}

export const likeUnlikePost = async (req, res) => {
    try{
        const postId = req.params.id;
        const userId = req.user._id;

        const post = await Post.findById(postId);
        if(!post){
            res.status(400).json({
                success: false,
                message: "Post not Found!"
            })
        }
        const user = await User.findById(userId);
        if(!user){
            res.status(400).json({
                success: false,
                message: "User not Found!"
            })
        }

        const userLiked = post.likes.includes(userId);

        if(!userLiked){
            post.likes.push(userId);
            user.likedPosts.push(postId);
            await post.save();
            await user.save();

            const notification = new Notification({
				from: userId,
				to: post.user,
				type: "like",
			});
			await notification.save();

            res.status(200).json({
                success: true,
                message: "Post Liked!"
            })
        }
        else{
            post.likes.pull(userId);
            user.likedPosts.pull(postId);
            await post.save();
            await user.save();

            res.status(200).json({
                success: true,
                message: "Post Unliked!"
            })
        }

    } catch(error) {
        return res.status(400).json({
            success: false,
            message: "Failed to like/unlike Post!",
            error: error.message
        })
    }
}

export const getAllPosts = async (req, res) => {
    try{
        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .populate({
                path: "user",
                select: "-password",
            })
            .populate({
                path: "comments.user",
                select: "-password",
            });

        if (posts.length === 0) {
            return res.status(200).json([]);
        }
    res.status(200).json({
        success: true,
        message: "All Posts Fetched!",
        posts
    });

    } catch(error){
        return res.status(400).json({
            success: false,
            message: "Failed to fetch all Posts!",
            error: error.message
        })
    }
}

export const getLikedPosts = async (req, res) => {
    try{
        const userId = req.user._id;
        const user = await User.findById(userId);
        if(!user){
            return res.status(400).json({
                success: false,
                message: "User not found!"
            })
        }

        const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.user",
				select: "-password",
			});

        res.status(200).json({
            success: true,
            message: "All liked posts fetched Successfully!",
            likedPosts
        })
    } catch(error){
        return res.status(400).json({
            success: false,
            message: "Failed to fetch Liked Posts!",
            error: error.message
        })
    }
}

export const getFollowingPosts = async (req, res) => {
    try{
        const userId = req.user._id;
		const user = await User.findById(userId);
		if (!user) {
            return res.status(404).json({
                success: false, 
                error: "User not found" 
            });
        }

        const following = user.following;
        const followingPosts = await Post.find({ user: { $in: following } })
			.sort({ createdAt: -1 })
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.user",
				select: "-password",
			});

        res.status(200).json({
            success: true,
            message: "All Following Posts Fetched!",
            followingPosts,
        })
    } catch(error){
        return res.status(400).json({
            success: false,
            message: "Failed to fetch Following Posts!",
            error: error.message
        })
    }
}

export const getUserPosts = async (req, res) => {
    try{
        const { username } = req.params;
        const user = await User.findOne({ username });
        if(!user){
            return res.status(400).json({
                success: false,
                message: "User not Found!"
            })
        }

        const posts = await Post.find({ user: user._id })
			.sort({ createdAt: -1 })
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.user",
				select: "-password",
			});

        res.status(200).json({
            success: true,
            message: "All User Posts fetched Successfully!",
            posts
        })    
    } catch(error){
        return res.status(400).json({
            success: false,
            message: "Failed to fetch all User Posts!",
            error: error.message
        })
    }
}