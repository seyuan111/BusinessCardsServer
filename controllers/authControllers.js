import { User } from '../models/userModal.js'
import bcrypt from 'bcryptjs'
import crypto from 'crypto';
import { generateVerificationToken } from '../utils/generateVerificationToken.js';
import { generateJWTToken } from '../utils/generateJWTToken.js'
import { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail, sendResetSuccessEmail } from '../resend/email.js';

export const signup = async (req,res) => {
    const { name, email, password } = req.body;
    try{
        if(!name || !password || !email){
            return res.status(400).json({ message: "please fill out all fields"})
        }
        const userAlreadyExists = await User.findOne({ email })
        if(userAlreadyExists){
            return res.status(400).json({ message: "user already exists"})
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const verificationToken = generateVerificationToken()

        const user = new User({
            name,
            email,
            password: hashedPassword,
            verificationToken: verificationToken,
            verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000
        })

        await user.save()

        generateJWTToken(res, user._id)
        
        await sendVerificationEmail(user.email, verificationToken)

        res.status(201).json({ 
            success: true,
            message: "user successfully created",
            user: {
                ...user._doc,
                password: undefined
            }
        })
    }catch(error){
        res.status(400).json({success: false, message: error.message})
    }
}

export const login = async (req,res) => {
    const { email, password } = req.body
    try{
        const user = await User.findOne({ email })
        if(!user){
            return res.status(400).json({ success: false, message: "invalid email"})
        }
        const isPasswordValid = await bcrypt.compare(password, user.password)
        if(!isPasswordValid){
            return res.status(400).json({ success: false, message: "password is incorrect"})
        }
        const isVerified = user.isVerified
        if(!isVerified){
            return res.status(400).json({ success: false, message: "please verify your email"})
        }

        generateJWTToken(res, user._id)

        res.status(200).json({ success: true, message: "user logged in successfully"})
    }catch(error){
        res.status(400).json({ success: false, message: error.message})
    }
}

export const logout = async (req,res) => {
    res.clearCookie("token")
    res.status(200).json({ success: true, message: "user logged out successfully"})
}

export const verifyEmail = async(req,res) => {
    const {code} = req.body
    try{
        const user = await User.findOne({
            verificationToken: code,
            verificationTokenExpiresAt: { $gt: Date.now()}
        })
        if(!user){
            return res.status(400).json({ message: "invalid or expired verification code"})
        }
        user.isVerified = true
        user.verificationToken = undefined
        user.verificationTokenExpiresAt = undefined
        await user.save()

        await sendWelcomeEmail(user.email, user.name)

        res.status(200).json({ success: true, message: "email verified successfully"})
    }catch(error){
        console.log("error while verifying email", error)
        res.status(400).json({ success: false, message: "there was an error while verifying email"})
    }
}

export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try{
        const user = await User.findOne({ email })
        if(!user){
            return res.status(400).json({ success: false, message: "user not found"})
        }
        const resetPasswordToken = crypto.randomBytes(32).toString("hex")
        const resetPasswordExpiresAt = Date.now() + 24 * 60 * 60 * 1000

        user.resetPasswordToken = resetPasswordToken
        user.resetPasswordExpiresAt = resetPasswordExpiresAt

        await user.save()
        await sendPasswordResetEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetPasswordToken}`)
        res.status(200).json({ success: true, message: "check email to reset password."})
    }catch(error){
        res.status(400).json({ success: false, message: error.message});
    }
}

export const resetPassword = async (req,res) => {
    try{
        const { token } = req.params;
        const { password } = req.body;
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpiresAt: { $gt: Date.now()}
        })

        if(!user){
            return res.status(400).json({ success: false, message: "invalid or expired reset token"})
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiresAt = undefined;
        await user.save()

        await sendResetSuccessEmail(user.email)
        res.status(200).json({ success: true, message: "password reset successfully"})
    }catch(error){
        res.status(400).json({ success: false, message: error.message})
    }
}

export const checkAuth = async(req,res) => {
    try{
        const user = await User.findById(req.userId)
        if(!user){
            return res.status(404).json({ success: false, message: "user not found"})
        }

        res.status(200).json({ success: true, user: {...user._doc, password: undefined}})
    }catch(error){
        return res.status(400).json({ success: false, message: error.message})
    }
}