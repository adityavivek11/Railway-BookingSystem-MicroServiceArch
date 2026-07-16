const { ConflictError, BadRequestError } = require("../utils/error")
const { generateAndStoreOtp, verifyOTP: verifyOtpToken } = require("../utils/otp")
const {sendOtpEmail, verifyOtpEmail} = require('../utils/email')
const bcrypt =  require('bcrypt')
const prisma = require('../config/prisma')

const sendOTP = async (firstName , lastName , email , password) =>{
    const existingUser = await prisma.user.findUnique({
        where : {email}
    })

    if(existingUser){
        throw new ConflictError("user already exists") ;
    }

    const hashedPassword = await bcrypt.hash(password , 12) ;
    const meta = { firstName,lastName,email,hashedPassword} ;
    const {otp, otpSessionId} = await generateAndStoreOtp(meta) ;
    await sendOtpEmail(email, otp) ;
    return {otpSessionId} ;
}


const verifyOTP = async function(otp , otpSessionId){
    const meta = await verifyOtpToken(otp , otpSessionId) ;
  if(!meta){
    throw new BadRequestError("Invalid OTP or OTP session expired") ;
  }

  const {firstName, lastName, email, hashedPassword} = meta ;
    const user = await prisma.user.create({
        data: {
            firstName,
            lastName,
            email,
            password: hashedPassword,
            emailVerified: true
        }
    });


    await verifyOtpEmail(meta) ;
    return user ;

}
module.exports = {sendOTP, verifyOTP}