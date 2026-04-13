import prisma from "../../config/prima.js";
import { hashPassword, compareHash } from "../../utils/hash.js";
import jwt from "jsonwebtoken";
import "dotenv/config";

const generateToken = (ACCESS_KEY, REFRESH_KEY, userInfo) => {
  const accessToken = jwt.sign(
    {
      id: userInfo.id,
      username: userInfo.username,
    },
    ACCESS_KEY,
    { expiresIn: "15m" },
  );
  const refreshToken = jwt.sign(
    {
      id: userInfo.id,
      username: userInfo.username,
    },
    REFRESH_KEY,
    { expiresIn: "3d" },
  );

  return {
    accessToken: accessToken,
    refreshToken: refreshToken,
  };
};

// registering new user after collecting their credentials
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

// Authenticating new user after providing credentials
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
  const ACCESS_KEY = process.env.JWT_ACCESS_SECRET_KEY;
  const REFRESH_KEY = process.env.JWT_REFRESH_SECRET_KEY;

  return generateToken(ACCESS_KEY, REFRESH_KEY, user);
}

// verifying refresh token to generate new access token from /auth/refresh
export async function verifyRefreshToken(refreshToken) {
  if (!refreshToken) {
    const error = new Error("No refresh token provided.");
    error.statusCode = 401;
    throw error;
  }

  // getting keys for token
  const ACCESS_KEY = process.env.JWT_ACCESS_SECRET_KEY;
  const REFRESH_KEY = process.env.JWT_REFRESH_SECRET_KEY;

  try {
    const decoded = jwt.verify(refreshToken, REFRESH_KEY);
    const accessToken = jwt.sign(
      { id: decoded.id, username: decoded.username },
      ACCESS_KEY,
      { expiresIn: "15m" },
    );
    // returns access tokne
    return { accessToken: accessToken };
  } catch (err) {
    // catching expired token error
    if (err.name === "TokenExpiredError") {
      const error = new Error("Access denied : Expired token . ");
      error.statusCode = 401;
      throw error;
      // catching invalid token error
    } else if (err.name === "JsonWebTokenError") {
      const error = new Error("Access denied : Invalid token . ");
      error.statusCode = 401;
      throw error;
      // catching all other errors apart from the ones above
    } else {
      const error = new Error("Something unexpected happened . ");
      error.statusCode = 500;
      throw error;
    }
  }
}

// logout user
export async function logout(request, response) {
  const refresh = request.cookies.refreshToken;
  if (!refresh) {
    const error = new Error("Cookie not present . ");
    error.statusCode = 401;
    throw error;
  }
  response.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/auth"
  });
  return { status: "successful", message: "Logged out successfully." };
}
