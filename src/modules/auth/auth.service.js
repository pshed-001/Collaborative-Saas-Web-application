import prisma from "../../config/prisma.js";
import { hashPassword, compareHash } from "../../utils/hash.js";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { AppError } from "../../middleware/apperror.js";

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

  return { accessToken, refreshToken };
};

// registering new user after collecting their credentials
export async function registerUser(userInfo) {
  const checkExistingUser = await prisma.user.findUnique({
    where: { email: userInfo.email },
  });
  // checking if user already exists
  if (checkExistingUser) {
    // return error message
    throw new AppError("User already exist", 409)
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
      error: false,
      data: {
        payload: {
          id: user.id,
          username: user.username,
        },
        meta: {
          timestamp: new Date().toISOString()
        }
      },
      message: "User created successfully.",
      statusCode: 201
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
    throw new AppError("Invalid credentials", 401)
  }
  // comparing password hashes
  const verifyUser = await compareHash(userInfo.password, user.password);
  if (!verifyUser) {
    throw new AppError("Invalid credentials", 401)
  }
  // getting secret keys form env file.
  const ACCESS_KEY = process.env.JWT_ACCESS_SECRET_KEY;
  const REFRESH_KEY = process.env.JWT_REFRESH_SECRET_KEY;

  const result = generateToken(ACCESS_KEY, REFRESH_KEY, user);
  
  return {
    id: user.id, username: user.username, accessToken: result.accessToken, 
    refreshToken: result.refreshToken, error: false, 
    message: "Successfully logged in", statusCode: 200

  }
}
// verifying refresh token to generate new access token from /auth/refresh
export async function generateAccessToken(token) {
  if (!token) {
    throw new AppError("Unauthorised. Kindly login.", 401)
  }

  // getting keys for token
  const ACCESS_KEY = process.env.JWT_ACCESS_SECRET_KEY;
  const REFRESH_KEY = process.env.JWT_REFRESH_SECRET_KEY;

  try {
    const decoded = jwt.verify(token, REFRESH_KEY);
    const accessToken = jwt.sign(
      { id: decoded.id, username: decoded.username },
      ACCESS_KEY,
      { expiresIn: "15m" },
    );
    // returns access token

    // refresh token rotatrion
    const refreshToken = jwt.sign(
      { id: decoded.id, username: decoded.username },
      REFRESH_KEY, { expiresIn: "3d" }
    )
    // console.log(accessToken)
    return {
      id: decoded.id,
      username: decoded.username,
      accessToken, refreshToken,
      error: false,
      message: "Successfully generated token",
      statusCode: 200,
    }
  } catch (err) {
    // catching expired token error
    if (err.name === "TokenExpiredError") {
      throw new AppError("Expired token", 403)

      // catching invalid token error
    } if (err.name === "JsonWebTokenError") {
      throw new AppError("Access denied", 401)

      // catching all other errors apart from the ones above
    }
    throw err;

  }
}

// logout user
export async function logout(request, response) {
  const refresh = request.cookies.refreshToken;
  if (!refresh) {
    throw new AppError("Kindly login first", 401)
  }
  response.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/auth"
  });
  return {
    error: false,
    data: {
      payload: null,
      meta: {
        timestamp: new Date().toISOString()
      }
    },
    message: "Successfully logged out",
    statusCode: 200
  };
}

// update table records
export async function update() {
  try {
    const updateRecord = await prisma.user.update({
      where: {
        username: "dev2",
      },
      data: {
        username: "dev2@itgel",
      },
    });
    return updateRecord.username
  } catch (err) {
    throw err
  }
}

// add session mgmt and standard cookie rotation