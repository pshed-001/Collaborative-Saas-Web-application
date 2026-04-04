import { registerUser } from "./auth.service.js";


export const register = async (req, res, next) => {
  try {
    const newUsers = await registerUser(req.body);
    // returning new user credentials
    console.log(newUsers)
    return res.status(201).json(newUsers);
  } catch (err) {
    //middleware handles error
    next(err);
  }
};
