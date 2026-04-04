import prisma from "../../config/prima";
import { hashPassword } from "../../utils/hash";

// async function
export async function registerUser(userInfo) {
  const checkExistingUser = await prisma.user.findUnique({
    where: { email: userInfo.email },
  });
  // checking if user already exists
  if (checkExistingUser) {
    // return error message 
    const error = new Error("User exists already.");
    error.statusCode = 400;
    throw error;
  } else {
    // hashing user password
    const hashedPassword = hashPassword(userInfo.password);
    // adding user to db
    const user = prisma.user.create({
      data: {
        firstname: userInfo.firstname,
        lastname: userInfo.lastname,
        username: userInfo.username,
        email: userInfo.email,
        password: hashedPassword,
      },
    });
    // return message of success
    return {
      id: user.id,
      username: user.username,
      status: "User created successfully.",
    };
  }
}
