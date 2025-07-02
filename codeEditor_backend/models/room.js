import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  _id : {
    type: String,
    requied : true
  },
  adminId:{
    type:mongoose.Schema.ObjectId,
    ref : 'user'
  },
  noOfUser : {
    type : Number,
    default : 0
  },
  usersId : [
    {
      type : mongoose.Schema.ObjectId,
      ref: 'user'
    }
  ],
  savedCode : {
    type : String,
    default : null
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 60 * 24 * 2, // after 2 days
  },
},{
  timestamps:true
})

const roomModel = mongoose.model("room", roomSchema);
export default roomModel;