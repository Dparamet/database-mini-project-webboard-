import { Router } from "express";
import { body, validationResult } from "express-validator";
import sanitizeHtml from "sanitize-html";
import Thread from "../models/Thread.js";
import Reply from "../models/Reply.js";
import { mustAuth } from "../middleware/auth.js";

const router = Router();

// หน้าแรก + ค้นหา + หน้า feed
router.get("/", async (req,res)=>{
  const q = (req.query.q || "").trim();
  const filter = q ? { $or: [{ title: new RegExp(q,"i") }, { tags: new RegExp(q,"i") }] } : {};
  const threads = await Thread.find(filter).populate("author","username displayName").sort({createdAt:-1}).limit(30);
  res.render("index",{ threads, q });
});

// แบบฟอร์มสร้างกระทู้
router.get("/thread/new", mustAuth, (req,res)=> res.render("thread_new"));

// สร้างกระทู้
router.post("/thread",
  mustAuth,
  body("title").trim().isLength({min:3}),
  body("body").trim().isLength({min:3}),
  async (req,res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).render("thread_new",{errors: errors.array()});
    const { title, body:raw, tags } = req.body;
    const body = sanitizeHtml(raw, { allowedTags: sanitizeHtml.defaults.allowedTags.concat([ 'img' ]) });
    const t = await Thread.create({
      author: req.session.user._id,
      title,
      body,
      tags: (tags||"").split(",").map(s=>s.trim()).filter(Boolean)
    });
    res.redirect(`/thread/${t._id}`);
  });

// ดูกระทู้ + โพสต์ตอบ
router.get("/thread/:id", async (req,res)=>{
  const t = await Thread.findById(req.params.id).populate("author","username displayName");
  if (!t) return res.status(404).send("Not found");
  t.views += 1; await t.save();
  const replies = await Reply.find({ thread: t._id }).populate("author","username displayName").sort({createdAt:1});
  res.render("thread_show",{ t, replies });
});

router.post("/thread/:id/reply", mustAuth, body("body").trim().isLength({min:1}), async (req,res)=>{
  const t = await Thread.findById(req.params.id);
  if (!t) return res.status(404).send("Not found");
  const clean = sanitizeHtml(req.body.body);
  await Reply.create({ thread: t._id, author: req.session.user._id, body: clean });
  res.redirect(`/thread/${t._id}#end`);
});

export default router;