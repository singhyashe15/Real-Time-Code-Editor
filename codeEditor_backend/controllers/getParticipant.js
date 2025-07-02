import roomModel from "../models/room.js";

const fetchParticipant = async (req,res) => {
  try {
    const {roomId} = req.query;

    const totalMembers = await roomModel.findById({_id : roomId}).populate('usersId', 'name _id');

    if(totalMembers){
      return res.status(201).json({member: totalMembers.usersId ,adminId : totalMembers.adminId, success : true})
    }
  } catch (error) {
    return res.status(501).json({error})
  }
};

export default fetchParticipant;