import roomModel from "../models/room.js";
import userModel from "../models/user.js";

const createRoom = async (req, res) => {
  try {
    const { roomId, userName } = req.body;
    const roomFound = await roomModel.findById({ _id: roomId }); // check room Id present
    // find the user with their name
    const userFound = await userModel.findOne({ name: userName });
    console.log(userFound)
    if (roomFound) { // if present
      const updated = await roomModel.updateOne({ _id: roomId }, { $inc: { noOfUser: 1 } , $push : {usersId : userFound._id} }); // increment the no of participants
      console.log(updated)
      if (updated) {
        return res.status(201).json({ msg: "user added in the room", success: true });
      }
    }

    if (roomFound === null) { // if not found
      const newRoom = new roomModel({ _id: roomId, adminId: userFound.id,noOfUser:1,usersId : [userFound.id] });
      await newRoom.save(); 

      if (newRoom) {
        return res.status(201).json({ msg: "room created successfuuly ", admin: true, success: true });
      }
    }
    return res.status(401).json({ msg: "Enter the correct name", success: false });
  } catch (error) {
    return res.status(501).json({ msg: "Some Error occured", error });
  }
}

export default createRoom;