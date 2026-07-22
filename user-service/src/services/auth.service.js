const { ConflictError, BadRequestError, ForbiddenError } = require("../utils/error")
const { generateAndStoreOtp, verifyOTP: verifyOtpToken } = require("../utils/otp")
const {sendOtpEmail, verifyOtpEmail} = require('../utils/email')
const bcrypt =  require('bcrypt')
const prisma = require('../config/prisma')
const jwt = require("jsonwebtoken")
const {config} = require("../config")
const RedisClient = require('../config/redis')
const redis = RedisClient.getInstance()
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require("../utils/auth")
const { default: Redis } = require("ioredis")

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


const login = async(email, password, deviceId)=>{
    const existingUser = await prisma.user.findUnique({
        where:{
            email
        }
    })

    if(!existingUser){
        throw new BadRequestError("Email Not Found") ;
    }

    const doesPasswordMatch = await bcrypt.compare(password, existingUser.password) ;
    if(!doesPasswordMatch){
        throw new BadRequestError("Incorrect Password") ;
    }

    const accessToken = generateAccessToken(existingUser.id) ;
    const refreshToken = generateRefreshToken(existingUser.id) ;

    const { jti } = jwt.decode(refreshToken) ;
    await redis.set(`refresh:${existingUser}:${deviceId}`,jti, 'EX', config.REFRESH_TOKEN_EXP_SEC) ;
    const {password: _password, ...safeUser} = existingUser ;
    await redis.set(`user:${existingUser.id}`, JSON.stringify(safeUser), 'EX', config.REDIS_USER_TTL) ;

    return {accessToken, refreshToken, loggedInUser: safeUser} ;
}

const rotateRefreshToken = async (refreshToken, deviceId) => {
    const payload = verifyRefreshToken(refreshToken) ;
    const {id: userId , jti} = payload ;
    const storedJti = await redis.get(`refresh:${userId}:${deviceId}`) ;
    if(!storedJti){
        throw new ForbiddenError("SessionExpired" , " Login Again")
    }

    if(storedJti !== jti){
        await redis.del(`refresh:${userId}:${deviceId}`) ;
        throw new ForbiddenError("Refresh token reused","LOGIN AGAIN")
    }

    const newAccessToken = generateAccessToken(payload.id) ;
    const newRefreshToken = generateRefreshToken(payload.id) ;
    const {jti: newJti} = jwt.decode(newRefreshToken);
    await redis.set(`refresh:${payload.id}:${deviceId}`, newJti, 'EX', config.REFRESH_TOKEN_EXP_SEC);
    return {newAccessToken, newRefreshToken};
}





module.exports = {sendOTP, verifyOTP, login} ;