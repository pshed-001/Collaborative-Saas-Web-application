import bcrypt from 'bcrypt';
import crypto from "crypto"

const saltRound = Number(process.env.SALT_ROUND) || 12;

export const hashPassword = async(plainPassword) => {
   return await bcrypt.hash(plainPassword,saltRound)
}

export const compareHash = async (plainPassword, hashedPassword)  => {
    return await bcrypt.compare(plainPassword,hashedPassword  )
}

export function hashUserIdentity(user) {
    // SHA-256 is lightning-fast, secure for this use case, and synchronous
    // using this for redis key generation
    return crypto
        .createHash('sha256')
        .update(user)
        .digest('hex')
}

/*
const password = await hashPassword("shedrack");
const comparePassword = "shedrack"
const isAuthorised = await compareHash(comparePassword, password);
console.log(!isAuthorised ? "Not authorised." : "Welcome.")
*/