import express from "express";
import jwt from "jsonwebtoken";
import { saveUser, authenticate } from "../db.js";
import { User } from "../domain/user.js";

const router = express.Router();

router.get("/ping", (req, res) => {
	return res.send("pong");
});

router.post("/authenticate", async (req, res) => {
	const { username, password } = req.body;
	try {
		const user = await authenticate(username, password);
		const token = jwt.sign(user.id, process.env.JWT_SECRET);
		res.cookie("token", token);
		return res.redirect("/");
	} catch (e) {
		if (username && password && e.message === "User not found") {
			const user = await User.create({ name: username, password });
			await saveUser(user);
			res.cookie("token", jwt.sign(user.id, process.env.JWT_SECRET));
			return res.redirect("/");
		}
		return res.redirect("/error?message=" + encodeURI(e.message));
	}
});

router.put("/profile", async (req, res) => {
	const { user } = req;
	await user.update(req.body);
	await saveUser(user);
	return res.redirect("/profile");
});

export { router as usersRouter };
