import { registerUser } from "./auth.service";


export const register = async (req, res, next) => {
  try {
    const newUsers = await registerUser(req.body);
    // returning new user credentials
    return res.status(201).json(newUsers);
  } catch (err) {
    //middleware handles error
    next(err);
  }
};
