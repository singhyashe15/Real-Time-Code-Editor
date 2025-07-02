import roomModel from "../models/room.js";

const deleteParticipant = async (req,res) => {
  try {
    const {roomId ,id} = req.query;
    
    const isDelete = await roomModel.updateOne({_id : roomId} ,  { $pull: { usersId: id } });
    if(isDelete){
      return res.status(201).json({success : true})
    }
    return res.status(401).json({success : false});
  } catch (error) {
    return res.status(501).json(error)
  }
}

export default deleteParticipant;