import { resend } from '../resend/config.js'
import { verificationTokenEmailTemplate, WELCOME_EMAIL_TEMPLATE } from './email-template.js'

export const sendVerificationEmail = async (email, verificationToken) => {
    try{
        const { data, error } = await resend.emails.send({
            from: "Acme <onboarding@resend.dev>",
            to: [email],
            subject: "verify your email address",
            html: verificationTokenEmailTemplate.replace("{verificationToken}", verificationToken),
        });
    }catch(error){
        console.log("There is an error while verifying email", error)
        throw new Error("Error sending verification email")
    }
}

export const sendWelcomeEmail = async(email, name) => {
    try{
        const { data, error } = await resend.emails.send({
            from: "Acme <onboarding@resend.dev>",
            to: [email],
            subject: "Welcome to the Business Card App",
            html: WELCOME_EMAIL_TEMPLATE.replace("{name}", name)
        });
    }catch(error){
        console.log("Error sending welcome email", error)
    }
}

export const sendPasswordResetEmail = async(email, resetURL) => {
    try{
        const { data, error } = await resend.emails.send({
            from: "Acme <onboarding@resend.dev>",
            to: [email],
            subject: "Reset Your Password",
            html: `Click <a href="${resetURL}">here</a> to reset your password.`
        });
    }catch(error){
        console.log("Error sending welcome email", error)
    }
}

export const sendResetSuccessEmail = async(email) => {
    try{
        const { data, error } = await resend.emails.send({
            from: "Acme <onboarding@resend.dev>",
            to: [email],
            subject: "password reset was successful",
            html: 'You have successfully reset your password'
        });
    }catch(error){
        console.log("Error sending welcome email", error)
    }
}