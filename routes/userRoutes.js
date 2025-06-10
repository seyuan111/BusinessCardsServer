import express from "express"
import {verifyToken} from '../middleware/verifyToken.js'
import {signup, login, logout, verifyEmail, forgotPassword, resetPassword, checkAuth} from '../controllers/authControllers.js'

const router = express.Router()

router.post('/signup', signup)

router.post('/login', login)

router.post('/logout', logout)

router.post('/verify-email', verifyEmail)

router.post('/forgot-password', forgotPassword)

router.post('/reset-password/:token', resetPassword)

router.get('/check-auth', verifyToken, checkAuth)

export default router