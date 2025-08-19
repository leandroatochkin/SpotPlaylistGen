import express from 'express'



const router = express.Router()

router.get("/", (req, res) => {//---/logout
  req.session.destroy(() => {
    res.redirect(FRONTEND_URI + "/?logged_out=1");
  });
});

export default router