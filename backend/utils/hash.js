import bcrypt from 'bcrypt';
const saltRound = 10;

export const hashPassword = async(plainPassword,saltRound) => {
    await bcrypt.hash(plainPassword,saltRound)
}

export const compareHash = async (plainPassword, originalPassword)  => {
    await bcrypt.compare(plainPassword,originalPassword  )
}