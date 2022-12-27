import express from "express";
import { Sudoku } from "../domain/sudoku.js";
import { getSudoku, getUserSudoku, saveSudoku, saveUserSudoku } from "../db.js";

const router = express.Router();

router.get("/ping", (req, res) => {
	return res.send("pong");
});

router.get("/", async (req, res) => {
	try {
		const { user } = req;
		const { sudokuId } = req.cookies;
		let sudoku;
		let state;
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
			sudoku.applyState(state);
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
				sudoku.applyState(state);
			} else {
				sudoku = await getSudoku(newSudoku.id);
			}
			res.cookie("sudokuId", sudoku.id);
		}
		return res.json({ success: true, data: sudoku.toJSON() });
	} catch (e) {
		return res.send({ success: false, message: e.message });
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
