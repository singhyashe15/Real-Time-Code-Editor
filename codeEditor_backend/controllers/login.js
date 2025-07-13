import userModel from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const Login = async (req, res) => {
  try {
    const user_details = req.body;
   
    const isFound = await userModel.findOne({ email: user_details.email });

    if (isFound) {
      const hashedPassword = isFound.password;
      const isMatch = bcrypt.compare(user_details.password, hashedPassword);

      if (isMatch) {
        const profile = {
          name: isFound.name,
          id: isFound._id
        }
        const jwt_token = process.env.JWT_TOKEN;
        const token = jwt.sign(profile, jwt_token, { expiresIn: '2d' })

        const cookieOptions = {
            http : true,
            secure : true,
            sameSite : 'None'
        }

        return res.cookie('token',token,cookieOptions).status(200).json({
            message : "Login successfully",
            token : token,
            profile: profile,
            maxAge: 2 * 24 * 60 * 60 * 1000,
            success :true
        })
      }
      return res.status(401).json({ msg: "Password not Found", success: false });
    }
    return res.status(401).json({ msg: "Email not Found", success: false });
  } catch (error) {
    return res.status(501).json({ error });
  }
}

export default Login;