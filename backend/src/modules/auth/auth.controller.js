import { registerUser } from "./auth.service.js";
import { loginUser } from "./auth.service.js"

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
export const login= async (req, res, next) =>{
  try{
    const loggedIn = await loginUser(req.body);
     res.cookie("refreshToken", loggedIn.refreshToken, {httpOnly : true, sameSite : "strict", secure : true, maxAge : 24 * 60 * 60 * 1000, path : "/auth"})
     res.setHeader("Authorization", `Bearer ${loggedIn.accessToken}`)
     res.status(201).json({"status" : "successful", "message" : "User logged in successfully."})
     return res
  }catch(err){
    // middleware handles error
    next(err)
  }
}
