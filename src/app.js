import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import methodOverride from "method-override";
import session from "express-session";
import MongoStore from "connect-mongo";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import threadRoutes from "./routes/threads.js";
import { injectUser } from "./middleware/auth.js";
import expressLayouts from "express-ejs-layouts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

await mongoose.connect(process.env.MONGODB_URI, { dbName: "webboard" });

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(morgan("dev"));
app.set("view engine", "ejs");
app.use(expressLayouts);        
app.set("layout", "layout"); 
app.use(session({
  secret: process.env.SESSION_SECRET || "dev-secret",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI, dbName: "webboard", collectionName: "sessions" }),
  cookie: { maxAge: 1000*60*60*24*7 }
}));
app.use(injectUser);

// Routes
app.use(authRoutes);
app.use(threadRoutes);

// 404
app.use((req,res)=> res.status(404).send("Not found"));
app.listen(PORT, ()=> console.log("Webboard running on http://localhost:"+PORT));