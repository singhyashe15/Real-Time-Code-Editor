import sendEmail from "../middlewares/verifyEmail.js";
import userModel from "../models/user.js";
import bcrypt from "bcryptjs";

const Register = async (req, res) => {
  try {
    const user_details = req.body;

    const isFound = await userModel.findOne({ email: user_details.email });

    if (isFound) {
      return res.status(402).json({ msg: "Email already registered", success: false });
    }
    // hashing the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(user_details.password, salt);

    const email_res = await sendEmail(user_details.name, user_details.email);
    if (email_res.success === true) {
      const isInserted = new userModel({ name: user_details.name, email: user_details.email, password: hashedPassword });;
      await isInserted.save();
      if (isInserted) {
        return res.status(201).json({ msg: "User registred successfully", success: true });
      }
    }else{
      return res.status(401).json({ msg: "Incorrect email", success: false });
    }

    return res.status(401).json({ msg: "Some error occured , Try again after sometime", success: false });
  } catch (error) {
    return res.status(501).json({ error });
  }
}

export default Register;