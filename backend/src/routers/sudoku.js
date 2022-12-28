import express from "express";
import { getEmptyBoard, Sudoku, deserializeBoard } from "../domain/sudoku.js";
import {
	getSudoku,
	getUserSudoku,
	saveSudoku,
	saveUserSudoku,
	getSudokuByName,
	getSolvedSudokusNames,
	getInProgressSudokusNames,
} from "../db.js";

const router = express.Router();

router.get("/ping", (req, res) => {
	return res.send("pong");
});

router.get("/", async (req, res) => {
	try {
		const { user } = req;
		const { sudokuId } = req.cookies;
		let sudoku;
		let state = undefined;
		if (user && sudokuId) {
			sudoku = await getSudoku(sudokuId);
			try {
				state = await getUserSudoku(user.id, sudokuId);
			} catch (e) {
				await saveUserSudoku(
					user.id,
					sudoku.id,
					JSON.stringify(sudoku.board),
					sudoku.isCorrectOrIndex(sudoku.board).success
				);
				state = await getUserSudoku(user.id, sudokuId);
			}
		} else if (!user && sudokuId) {
			sudoku = await getSudoku(sudokuId);
		} else {
			const newSudoku = await Sudoku.create();
			await saveSudoku(newSudoku);
			if (user) {
				await saveUserSudoku(
					user.id,
					newSudoku.id,
					JSON.stringify(newSudoku.board),
					newSudoku.isCorrectOrIndex(newSudoku.board).success
				);
				sudoku = await getSudoku(newSudoku.id);
				state = await getUserSudoku(user.id, newSudoku.id);
			} else {
				sudoku = await getSudoku(newSudoku.id);
			}
			res.cookie("sudokuId", sudoku.id);
		}
		return res.json({
			success: true,
			data: {
				sudoku: sudoku.toJSON(),
				state: deserializeBoard(state),
			},
		});
	} catch (e) {
		return res.send({ success: false, message: e.message });
	}
});

router.get("/search", async (req, res) => {
	const { q, offset } = req.query;
	try {
		const sudokus = await getSudokuByName(q, offset, 25);
		const deserializedSudokus = sudokus.map((sudoku) => {
			return {
				name: sudoku.name,
				id: sudoku.id,
			};
		});
		return res.json({ success: true, data: deserializedSudokus });
	} catch (e) {
		return res.json({ success: false, message: e.message });
	}
});

router.get("/solved", async (req, res) => {
	try {
		const { user } = req;
		const { offset } = req.query;
		if (!user) {
			throw new Error("You must be logged in to do that");
		}
		const sudokus = await getSolvedSudokusNames(user.id, offset, 25);
		const deserializedSudokus = sudokus.map((sudoku) => {
			return {
				name: sudoku.name,
				id: sudoku.id,
			};
		});
		return res.json({ success: true, data: deserializedSudokus });
	} catch (e) {
		return res.json({ success: false, message: e.message });
	}
});

router.get("/in-progress", async (req, res) => {
	try {
		const { user } = req;
		const { offset } = req.query;
		if (!user) {
			throw new Error("You must be logged in to do that");
		}
		const sudokus = await getInProgressSudokusNames(user.id, offset, 25);
		const deserializedSudokus = sudokus.map((sudoku) => {
			return {
				name: sudoku.name,
				id: sudoku.id,
			};
		});
		return res.json({ success: true, data: deserializedSudokus });
	} catch (e) {
		return res.json({ success: false, message: e.message });
	}
});

router.post("/", async (req, res) => {
	try {
		const { user } = req;
		const { sudokuId } = req.cookies;
		const { board } = req.body;
		if (!user) {
			const sudoku = await getSudoku(sudokuId);
			const { success, wrong } = sudoku.isCorrectOrIndex(board);
			return res.json({ success, wrong });
		} else {
			const sudoku = await getSudoku(sudokuId);
			const { success, wrong } = sudoku.isCorrectOrIndex(board);
			await saveUserSudoku(
				user.id,
				sudokuId,
				JSON.stringify(board),
				success
			);
			return res.json({ success, wrong });
		}
	} catch (e) {
		return res.json({ success: false, message: e.message });
	}
});

export { router as sudokusRouter };
