import express from "express";
import Register from "../controllers/register.js";
import Login from "../controllers/login.js";
import verifyToken from "../middlewares/verifyToken.js";
import createRoom from "../controllers/createRoom.js";
import fetchParticipant from "../controllers/getParticipant.js";
import deleteParticipant from "../controllers/deleteParticipant.js";

const authRouter = express.Router();

authRouter.post('/register',Register);

authRouter.post('/login',Login);

authRouter.post('/create-room',verifyToken,createRoom);

authRouter.get('/fetchParticipant',fetchParticipant);

authRouter.put('/deleteParticipant',deleteParticipant);

export default authRouter;