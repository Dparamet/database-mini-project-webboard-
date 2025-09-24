import { Router } from "express";
import bcrypt from "bcryptjs";
import { body, validationResult } from "express-validator";
import User from "../models/User.js";

const router = Router();

// Register
router.get("/register", (req,res)=> res.render("register"));
router.post("/register",
  body("username").trim().isLength({min:3}),
  body("email").isEmail(),
  body("password").isLength({min:6}),
  async (req,res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).render("register",{errors:errors.array()});
    const {username, email, password} = req.body;
    const passHash = await bcrypt.hash(password, 10);
    try {
      const user = await User.create({ username, email, passHash, displayName: username });
      req.session.user = { _id: user._id, username: user.username, role: user.role, displayName: user.displayName };
      res.redirect("/");
    } catch (e) {
      res.status(400).render("register",{errors:[{msg:"username หรือ email ซ้ำ"}]});
    }
  });

// Login
router.get("/login", (req,res)=> res.render("login"));
router.post("/login", async (req,res)=>{
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).render("login",{errors:[{msg:"อีเมลหรือรหัสผ่านไม่ถูกต้อง"}]});
  const ok = await bcrypt.compare(password, user.passHash);
  if (!ok) return res.status(401).render("login",{errors:[{msg:"อีเมลหรือรหัสผ่านไม่ถูกต้อง"}]});
  req.session.user = { _id:user._id, username:user.username, role:user.role, displayName:user.displayName };
  res.redirect(req.query.next || "/");
});

// Logout
router.post("/logout", (req,res)=>{
  req.session.destroy(()=> res.redirect("/"));
});

export default router;