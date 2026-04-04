import bcrypt from 'bcrypt';
const saltRound = Number(process.env.SALT_ROUND) || 15;

export const hashPassword = async(plainPassword) => {
   return await bcrypt.hash(plainPassword,saltRound)
}

export const compareHash = async (plainPassword, hashedPassword)  => {
    return await bcrypt.compare(plainPassword,hashedPassword  )
}

/*
const password = await hashPassword("shedrack");
const comparePassword = "shedrack"
const isAuthorised = await compareHash(comparePassword, password);
console.log(!isAuthorised ? "Not authorised." : "Welcome.")
*/