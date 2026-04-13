import {
  verifyRefreshToken,
  loginUser,
  registerUser,
  logout,
} from "./auth.service.js";
import jwt from "jsonwebtoken";
export const register = async (req, res, next) => {
  try {
    const newUsers = await registerUser(req.body);
    // returning new user credentials
    // console.log(newUsers)
    return res.status(201).json(newUsers);
  } catch (err) {
    //middleware handles error
    next(err);
  }
};
export const login = async (req, res, next) => {
  try {
    const loggedIn = await loginUser(req.body);
    res.cookie("refreshToken", loggedIn.refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
      path: "/auth",
    });
    const getExpire = jwt.decode(loggedIn.accessToken).exp;
    const date = new Date();
    const expireDate = new Date(getExpire * 1000);

    res.setHeader("Authorization", `Bearer ${loggedIn.accessToken}`);
    res.status(201).json({
      status: "successful",
      message: "User logged in successfully.",
      currentTime: date.toString(),
      expiresIn: expireDate.toString(),
    });
    return res;
  } catch (err) {
    // middleware handles error
    next(err);
  }
};

export const accessTokenGenerator = async (req, res, next) => {
  try {
    const cookie = req.cookies.refreshToken;
    const accessToken = await verifyRefreshToken(cookie);
    res.setHeader("Authorization", `Bearer ${accessToken.accessToken}`);
    res.status(201).json({
      status: "Successful",
      message: "Access token regenerated successfully.",
    });
  } catch (err) {
    next(err);
  }
};

export const loggedOut = async (req, res, next) => {
  try {
    const logoutUser = await logout(req, res);
    return res.status(200).json({ logoutUser });
  } catch (err) {
    console.log(err)
    next(err);
  }
};
