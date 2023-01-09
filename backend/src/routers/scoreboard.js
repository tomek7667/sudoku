import express from "express";
import { getEmptyBoard, Sudoku, deserializeBoard } from "../domain/sudoku.js";
import { getScoreboard } from "../db.js";

const router = express.Router();

router.get("/ping", (req, res) => {
	return res.send("pong");
});

router.get("/", async (req, res) => {
	const { offset = 0 } = req.query;
	const scoreboard = await getScoreboard(offset, 10);
	const deserializedScoreboard = scoreboard.map((user) => {
		return {
			username: user.name,
			score: user.stars,
		};
	});
	return res.json(deserializedScoreboard);
});

export { router as scoreboardRouter };
