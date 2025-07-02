import userModel from "../models/user.js";
import bcrypt from "bcryptjs";

const Register = async(req,res) =>{
  try {
    const user_details = req.body;
    
    const isFound = await userModel.findOne({email : user_details.email});

    if(isFound){
      return res.status(402).json({msg : "Email already registered" , success: false});
    }
    // hashing the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(user_details.password,salt);
    
    
    const isInserted = new userModel({name : user_details.name , email : user_details.email , password : hashedPassword});;
    await isInserted.save();
    console.log(isInserted)
    if(isInserted){
      return res.status(201).json({msg: "User registred successfully" , success: true});
    }

    return res.status(401).json({msg : "Error found" , success: false});
  } catch (error) {
    return res.status(501).json({error});
  }
}

export default Register;