const asyncHandler = require("../utils/asyncHandler");
const { BadRequestError } = require("../utils/error");
const { config } = require('../config') ;
const authService = require('../services/auth.service') ;
const { getDeviceFingerprint } = require("../utils/deviceFingerprint");

exports.sendOTP  = asyncHandler(async(req,res) =>{
    const { firstName , lastName , email , password , confirmPassword } = req.body ;
    if(!firstName || ! lastName || !email || !password || !confirmPassword){
        throw new BadRequestError("All Fields are mandatory") ;
    }

    if(password !== confirmPassword){
        throw new BadRequestError("Password Mismatch") ;
    }

    const {otpSessionId} = await authService.sendOTP(firstName, lastName , email , password) ;
    
    res.cookie("otp_session", otpSessionId , {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: config.OTP_TTL * 1000
    }).status(200).json({
        success: true,
        message: "OTP sent successfully"
    })
})



exports.verifyOTP = asyncHandler(async(req,res) =>{
    const {otp} = req.body ;
    const otpSessionId = req.cookies.otp_session ;

    if(!otp || !otpSessionId) {
        throw new BadRequestError(" OTP or OTPSession is missing")
    }

    const user = await authService.verifyOTP(otp, otpSessionId) ;
    return res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: user
    })

})


exports.login = asyncHandler(async(req,res) =>{
    const {email, password} = req.body ;
    if(!email || !password){
        throw new BadRequestError("Email and Password are required") 
    }

    const deviceId = getDeviceFingerprint(req) ;
    const {accessToken, refreshToken, loggedInUser} = await authService.login(email, password, deviceId) ;
    res.cookie("accessToken", accessToken , {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: config.ACCESS_TOKEN_EXP_SEC * 1000
    })

    res.cookie("refreshToken", refreshToken , {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: config.REFRESH_TOKEN_EXP_SEC * 1000
    })

    res.status(200).json({
        success: true,
        message: "Logged in successfully",
        loggedInUser
    })
})