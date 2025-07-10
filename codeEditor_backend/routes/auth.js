import express from "express";
import Register from "../controllers/register.js";
import Login from "../controllers/login.js";
import verifyToken from "../middlewares/verifyToken.js";
import createRoom from "../controllers/createRoom.js";

const authRouter = express.Router();

authRouter.post('/register',Register);

authRouter.post('/login',Login);

authRouter.post('/create-room',verifyToken,createRoom);

export default authRouter;