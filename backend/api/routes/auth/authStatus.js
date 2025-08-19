import express from 'express'



const router = express.Router()

router.get("/", (req, res) => {//----/auth-status
  const isAuthenticated = !!(req.session && req.session.access_token);
  const user = req.session?.spotify_user;
  res.json({ 
    authenticated: isAuthenticated,
    user: user ? { id: user.id, display_name: user.display_name } : null
  });
});

export default router