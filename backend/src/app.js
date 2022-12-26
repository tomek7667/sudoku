import express from "express";
import { __express as pug } from "pug";
import { db, login } from "./db.js";
import { usersRouter } from "./routers/users.js";
import jwt from "jsonwebtoken";

const port = 3000;
const app = express();
export const Sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

app.engine("pug", pug);

app.set("view engine", "pug");
app.set("views", "templates");
app.use(express.static("public"));
app.use(express.json());

app.use("/api/users", usersRouter);

const authorization = (req, res, next) => {
	try {
		const auth = req.headers.authorization;
		if (!auth) {
			throw new Error("No authorization header");
		}
		const [type, token] = auth.split(" ");
		if (type !== "Bearer") {
			throw new Error("Invalid authorization type");
		}
		req.token = token;
		next();
	} catch (e) {
		res.status(401).send(e.message);
	}
};

app.get("/*", (req, res) => {
	res.render("index");
});

app.listen(port, async () => {
	console.log(`Example app listening at http://localhost:${port}`);
});
