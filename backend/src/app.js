import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { __express as pug } from "pug";
import { getUser } from "./db.js";
import { usersRouter } from "./routers/users.js";
import { sudokusRouter } from "./routers/sudoku.js";
import { scoreboardRouter } from "./routers/scoreboard.js";
dotenv.config();

const port = 3000;
const app = express();
app.use(cookieParser());
export const Sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

app.engine("pug", pug);

app.set("view engine", "pug");
app.set("views", "templates");
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const serializeUser = async (req, res, next) => {
	try {
		const { token } = req.cookies;
		const id = jwt.verify(token, process.env.JWT_SECRET);
		req.user = await getUser(id);
		return next();
	} catch (e) {
		return next();
	}
};

app.use(serializeUser);

app.use("/api/v1/users", usersRouter);
app.use("/api/v1/sudokus", sudokusRouter);
app.use("/api/v1/scoreboard", scoreboardRouter);

app.get("/login", (req, res) => {
	const { user } = req;
	if (user) {
		return res.redirect("/");
	} else {
		return res.render("login");
	}
});

app.get("/profile", (req, res) => {
	const { user } = req;
	if (user) {
		return res.render("user", { user: user.toJSON() });
	} else {
		return res.redirect("/login");
	}
});

app.get("/logout", (req, res) => {
	res.clearCookie("token");
	return res.redirect("/");
});

app.get("/error", (req, res) => {
	const { user } = req;
	return res.render("error", {
		message: req.query.message,
		user: user?.toJSON(),
	});
});

app.get("/browse", (req, res) => {
	const { user } = req;
	return res.render("sudokus", { user: user?.toJSON() });
});

app.get("/solved", (req, res) => {
	const { user } = req;
	if (!user) return res.redirect("/login");
	return res.render("solved", { user: user?.toJSON() });
});

app.get("/in-progress", (req, res) => {
	const { user } = req;
	if (!user) return res.redirect("/login");
	return res.render("in-progress", { user: user?.toJSON() });
});

app.get("/scores", (req, res) => {
	const { user } = req;
	return res.render("scores", { user: user?.toJSON() });
});

app.get("/", (req, res) => {
	const { user } = req;
	return res.render("index", { user: user?.toJSON() });
});

app.listen(port, "0.0.0.0", () => {
	console.log(`Example app listening at http://localhost:${port}`);
});
