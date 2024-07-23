import User from "../models/user.model";
import ErrorHandler from "../utils/errorHandler";
import catchAsyncError from "../middlewares/catchAsyncError"
import sendToken from "../utils/sendToken";
import sendEmail from "../utils/sendEmail";
import crypto from "crypto"

// AUTHENTICATION ROUTES
// Register User 
export const registerUser = catchAsyncError(async (req, res, next) => {
    const { name, email, password } = req.body;
    const user = await User.create({
        name, email, password
    });
    sendToken(user, 201, res);
});
// User Login 
export const loginUser = catchAsyncError(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) return next(new ErrorHandler("Please enter email and password", 400));
    const user = await User.findOne({ email }).select("+password");
    if (!user) return next(new ErrorHandler("Invalid email or password", 401));
    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) return next(new ErrorHandler("Invalid email or password", 401));
    sendToken(user, 200, res);
});
// Logout
export const logout = catchAsyncError(async (req, res, next) => {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })
    res.status(200).json({
        success: true,
        message: "Logged out successfully"
    })
});
// Forgot password
export const forgotPassword = catchAsyncError(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return next(new ErrorHandler("User not found", 404));
    //get reset password token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });
    // const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`;
    console.log(process.env.FRONTEND_URL);
    const resetPasswordUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;
    console.log(resetPasswordUrl);
    const message = `Your reset Pasword token for  TECHNO-POWER Personal account is : \n\n${resetPasswordUrl}\nIf you have not requested this email then , please ignore it`;
    try {
        await sendEmail({
            email: user.email,
            subject: `MyShop Password Recovery`,
            message
        });
        res.status(200).json({
            success: true,
            message: `Email sent to ${user.email} successfully`
        });
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new ErrorHandler(error.message, 500));
    }
});
//Reset password
export const resetPassword = catchAsyncError(async (req, res, next) => {
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const user = await User.findOne({ resetPasswordToken, resetPasswordExpire: { $gt: Date.now() } });
    if (!user) return next(new ErrorHandler("Reset password token is invalid or has been expired", 400));
    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler("password dont match with confirm password", 400));
    }
    user.password = req.body.password;
    user.resetPasswordExpire = undefined;
    user.resetPasswordToken = undefined;
    await user.save();
    sendToken(user, 200, res);
})
// USER PERSONAL ROUTES
// Get User Detail
// export const getUserDetail = catchAsyncError(async (req, res, next) => {
//     const user = await User.findById(req.user.id);
//     res.status(200).json({
//         success: true,
//         user
//     })
// })

// Update user password
// export const updatePassword = catchAsyncError(async (req, res, next) => {
//     const user = await User.findById(req.user.id).select("+password");
//     const isPasswordMatched = await user.comparePassword(req.body.oldPassword);
//     if (!isPasswordMatched)
//         return next(new ErrorHandler("Old password is incorrect", 401));
//     if (req.body.newPassword !== req.body.confirmPassword)
//         return next(new ErrorHandler("password dont match with confirm password", 401));
//     user.password = req.body.newPassword;
//     await user.save();
//     sendToken(user, 200, res);
// })

//update user profile
// export const updateProfile = catchAsyncError(async (req, res, next) => {
//     const newUserData = {
//         name: req.body.name,
//         email: req.body.email,
//     }

//     const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
//         new: true,
//         runValidators: true,
//         useFindAndModify: true,
//     });
//     res.status(200).json({
//         success: true,
//         message: "Profile updated successfully",
//         user
//     })
// })

// ADMIN ROTUES
// Get all users (admin)
// export const getAllUsers = catchAsyncError(async (req, res, next) => {
//     const users = await User.find();
//     res.status(200).json({
//         success: true,
//         users
//     })
// })

// Get single user (admin)
// export const getSingleUser = catchAsyncError(async (req, res, next) => {
//     const user = await User.findById(req.params.id);
//     if (!user) return next(new ErrorHandler(`User doesn't exist with Id: ${req.body.id}`));
//     res.status(200).json({
//         success: true,
//         user
//     })
// })

// Update role of users
// export const updateUserRole = catchAsyncError(async (req, res, next) => {
//     const newUserData = {
//         role: req.body.role
//     }
//     const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
//         new: true,
//         runValidators: true,
//         useFindAndModify: true,
//     });
//     res.status(200).json({
//         success: true,
//         message: "Profile updated successfully",
//         user
//     })
// })

// Delete user --admin
// export const deleteUser = catchAsyncError(async (req, res, next) => {
//     const user = await User.findById(req.params.id);
//     if (!user) return next(new ErrorHandler(`User doesn't exist with Id : ${req.params.id}`));
//     await user.deleteOne();
//     res.status(200).json({
//         success: true,
//         message: "User deleted successfully"
//     })
// })