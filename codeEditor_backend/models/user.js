import mongoose from "mongoose";

const user = new mongoose.Schema({
  name :{
    type:String,
    required:true
  },
  email : {
    type : String,
    required: true 
  },
  password:{
    type: String,
    required: true
  },
  isVerified:{
    type: Boolean ,
    default : false
  }
},{
  timestamps:true //to get createdAt and UpdatedAt time record
})

const userModel = mongoose.model("user",user);
export default userModel;