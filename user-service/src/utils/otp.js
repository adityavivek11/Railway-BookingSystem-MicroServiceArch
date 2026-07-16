const { TooManyRequestsError } = require("./error")
const otpGenerator = require('otp-generator') 
const crypto = require('crypto')
const { config } = require('../config')
const RedisClient = require('../config/redis')
const redis = RedisClient.getInstance()
const RATE_MAX = parseInt(config.OTP_RATE_MAX_PER_HOUR || '5',10) 
const OTP_TTL = parseInt(config.OTP_TTL || '300', 10)
const HMAC_SECRET = config.HMAC_SECRET


function hmacFor(email, otp){
    return crypto.createHmac('sha256',HMAC_SECRET).update(email + ":" + otp).digest('hex') ;
}


async function generateAndStoreOtp(meta){
    // user can generate 5 otps in an hour ;
    const rateKey = `otp:rate:${meta.email}` ;
    const sentCount = parseInt(await redis.get(rateKey) || '0' , 10) ;


    if(sentCount >= RATE_MAX){
        throw new TooManyRequestsError(
            "Too many OTP requests. Try again later.",
            "OTP_RATE_LIMIT"
        )
    }
    
    const otp = otpGenerator.generate(6,{
        upperCaseAlphabets:false,
        lowerCaseAlphabets:false,
        specialChars: false
    })

    const otpSessionId = crypto.randomUUID() ;
    const hashed = hmacFor(meta.email, otp) ;
    await redis.set(`otp:session:${otpSessionId}`, JSON.stringify({
        hashedOtp: hashed,
        meta
    }),'EX',OTP_TTL) ;

    await redis.incr(rateKey) ;
    await redis.expire(rateKey,3600);

    return {otp, otpSessionId} ;
}

module.exports = {generateAndStoreOtp}