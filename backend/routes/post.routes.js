import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { commentPost, createPost, deletePost, getAllPosts, getFollowingPosts, getLikedPosts, getUserPosts, likeUnlikePost } from "../controllers/post.controller.js";

const router = express.Router();

router.get("/user/:username", protectRoute, getUserPosts);
router.get("/followingPosts", protectRoute, getFollowingPosts);
router.get("/likedPosts", protectRoute, getLikedPosts);
router.get("/all", protectRoute, getAllPosts);
router.post("/create", protectRoute, createPost);
router.post("/like/:id", protectRoute, likeUnlikePost);
router.post("/comment/:id", protectRoute, commentPost);
router.delete("/delete/:id", protectRoute, deletePost);

export default router;