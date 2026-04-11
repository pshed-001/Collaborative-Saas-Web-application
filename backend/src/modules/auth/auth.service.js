import prisma from "../../config/prima.js";
import { hashPassword, compareHash } from "../../utils/hash.js";
import jwt from "jsonwebtoken";

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
    const hashedPassword = await hashPassword(userInfo.password);
    // adding user to db
    const user = await prisma.user.create({
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

export async function loginUser(userInfo) {
  // querying db for matches
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: userInfo.userInput }, { username: userInfo.userInput }],
    },
  });

  if (!user) {
    const error = new Error("Invalid Credentials.");
    error.statusCode = 401;
    throw error;
  }
  // comparing password hashes
  const verifyUser = await compareHash(userInfo.password, user.password);
  if (!verifyUser) {
    const error = new Error("Invalid Credentials.");
    error.statusCode = 401;
    throw error;
  }
  // getting secret keys form env file.
  const JWT_ACCESS_SECRET_KEY = process.env.JWT_ACCESS_SECRET_KEY;
  const JWT_REFRESH_SECRET_KEY = process.env.JWT_REFRESH_SECRET_KEY;
  // generating token
  const accessToken = jwt.sign(
    {
      userId: user.id,
      username: user.username,
    },
    JWT_ACCESS_SECRET_KEY,
    { expiresIn: "0.25hr" },
  );
  const refreshToken = jwt.sign(
    {
      userId: user.id,
      username: user.username
    },
    JWT_REFRESH_SECRET_KEY,
    { expiresIn: "24hr" },
  );
  // console.log(accessToken, refreshToken)
  return { accessToken: accessToken, refreshToken: refreshToken };
}
