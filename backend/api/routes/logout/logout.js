import express from 'express'
import dotenv from 'dotenv'
dotenv.config();

const {
  FRONTEND_URI
} = process.env;


const router = express.Router()

router.get("/", (req, res) => {//---/logout
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({ success: true });
  });
});

export default router