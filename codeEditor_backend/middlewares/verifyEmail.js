import { createTransport } from "nodemailer";
import dotenv from "dotenv"
dotenv.config();
const Transporter = createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, //email address
    pass: process.env.EMAIL_PASS// password
  },
  port: 587,
  secure: false,
  tls: {
    rejectUnauthorized: false, // Helps prevent SSL issues
  },
})
const sendEmail = async (name, email) => {
  const frontend_url = process.env.FRONTEND_URL;
  try {
    const info = Transporter.sendMail({
      from: process.env.EMAIL_USER, // sender address
      to: email, // list of receivers
      subject: "Welcome to my Code Editor",
      html: ` <h2>🎉 Welcome ${name}!</h2>
              <p>Thanks for joining here — your account was created and you can now signed in.</p>
              <p>Please click below for Login</p>
              <a href="${frontend_url}/login" 
                style="display: inline-block; padding: 10px 20px; font-size: 16px; 
                color: #fff; background-color: #4CAF50; text-decoration: none; 
                border-radius: 5px; font-weight: bold;">
              Login Here
              </a>`
    });
    return { info, success: true };
  } catch (error) {
    return { success: false, error: err };
  }

}
export default sendEmail;