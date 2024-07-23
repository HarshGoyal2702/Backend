import express from "express"
import { deleteUser, forgotPassword, getAllUsers, getSingleUser, getUserDetail, loginUser, logout, registerUser, resetPassword, updatePassword, updateProfile, updateUserRole } from "../controllers/user.controller";
import { authentication, authorization } from "../middlewares/auth";
const router = express.Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").get(logout);
router.route("/password/forgot").post(forgotPassword);
router.route("/password/reset/:token").put(resetPassword);
router.route("/me").get(authentication, getUserDetail);
router.route("/me/update").put(authentication, updateProfile);
router.route("/password/update").put(authentication, updatePassword);

// Admin User Routes
router.route("/admin/users").get(authentication, authorization, getAllUsers);
router.route("/admin/user/:id").get(authentication, authorization, getSingleUser).put(authentication, authorization, updateUserRole).delete(authentication, authorization, deleteUser);

export default router;