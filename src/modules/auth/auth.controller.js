import {
  generateAccessToken,
  loginUser,
  registerUser,
  logout,
  update
} from "./auth.service.js";


export const updateUser = async (req, res, next) => {
  try {
    const up = await update()
    console.log(up)
    return res.status(201).json({
      message: "successful",
      newUsername: up
    })
  } catch (err) {
    next(err)
  }
}

export const register = async (req, res, next) => {
  try {
    const newUsers = await registerUser(req.body);
    // returning new user credentials
    // console.log(newUsers)
    return res.status(200).json(newUsers);
  } catch (err) {
    //middleware handles error
    next(err);
  }
};
export const login = async (req, res, next) => {
  try {
    const result = await loginUser(req.body);
    const refreshToken = result.refreshToken
    // const accessToken = result.accessToken
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: true,
      maxAge: 24 * 60 * 60 * 1000 * 3,
      path: "/auth",
    });
    // const getExpire = jwt.decode(accessToken).exp;


    res.setHeader("Authorization", `Bearer ${result.accessToken}`);
    res.status(200).json({
      success: result.success,
      data: {
        payload: {
          id: result.id,
          username: result.username
        },
        meta: {
          timestamp: new Date().toISOString()
        }
      },
      message: result.message,
      // expiresIn: getExpire.toString(),
    });
  } catch (err) {
    // middleware handles error
    next(err);
  }
};

export const accessTokenGenerator = async (req, res, next) => {
  try {
    const result = await generateAccessToken(req.cookies.refreshToken);
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly : true,
      sameSite : "strict",
      secure : true,
      path : "/auth",
      maxAge : 1000 * 60 *60 * 24 * 3
    })
    res.setHeader("Authorization", `Bearer ${result.accessToken}`);
    res.status(200).json({
      success: result.success,
      data: {
        payload: {
          id: result.id,
          username: result.username
        },
        meta: {
          timestamp: new Date().toISOString()
        }
      },
      message: result.message,
      // expiresIn: getExpire.toString(),
    });
  } catch (err) {
    next(err);
  }
};

export const loggedOut = async (req, res, next) => {
  try {
    const result = await logout(req, res);
    return res.status(200).json(result);
  } catch (err) {
    //console.log(err)
    next(err);
  }
};
