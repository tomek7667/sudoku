import { randomUUID } from "crypto";
import S from "sudoku";
import gen from "random-seed";
const shuffleRounds = 0xffff;

const puzzleToBoard = (puzzle) => {
	const board = [];
	for (let i = 0; i < 9; i++) {
		board.push(puzzle.slice(i * 9, (i + 1) * 9));
		board[i] = board[i].map((cell) => (cell === null ? 0 : cell + 1));
	}
	return board;
};

const boardToPuzzle = (board) => {
	const puzzle = [];
	for (let i = 0; i < 9; i++) {
		puzzle.push(...board[i].map((cell) => (cell === 0 ? null : cell - 1)));
	}
	return puzzle;
};

function generateSudokuBoard() {
	console.log("Generating Sudoku board...");
	const puzzle = S.makepuzzle();
	// const solved = S.solvepuzzle(puzzle);
	const board = puzzleToBoard(puzzle);
	return board;
}

function isValid(board, row, col, num) {
	// Check if the number is already in the row
	for (let i = 0; i < 9; i++) {
		if (board[row][i] === num) {
			return false;
		}
	}

	// Check if the number is already in the column
	for (let i = 0; i < 9; i++) {
		if (board[i][col] === num) {
			return false;
		}
	}

	// Check if the number is already in the 3x3 box
	let boxRow = Math.floor(row / 3) * 3;
	let boxCol = Math.floor(col / 3) * 3;
	for (let i = 0; i < 3; i++) {
		for (let j = 0; j < 3; j++) {
			if (board[boxRow + i][boxCol + j] === num) {
				return false;
			}
		}
	}

	// If the number is not in the row, column, or box, it is valid
	return true;
}

const nameParts = [
	"la",
	"we",
	"ri",
	"re",
	"mi",
	"fa",
	"so",
	"por",
	"koo",
	"le",
	"ko",
	"ma",
	"ha",
	"ho",
	"dra",
	"po",
	"bo",
	"za",
	"ru",
	"ta",
	"na",
	"da",
	"pa",
	"sa",
	"ka",
	"ba",
	"le",
	"lo",
	"mo",
];

const generateName = (id) => {
	let name = "";
	let rand = gen.create(id);
	for (let i = 0; i < 5; i++) {
		name += nameParts[Math.floor(rand.random() * nameParts.length)];
	}
	return name;
};

export class Sudoku {
	constructor({ id, board, createdAt, name }) {
		this.id = id;
		this.board = board;
		this.createdAt = createdAt;
		this.name = name;
		this.solution = puzzleToBoard(S.solvepuzzle(boardToPuzzle(board)));
	}

	static async create() {
		const id = randomUUID();
		const name = generateName(id);
		return new Sudoku({
			id,
			board: generateSudokuBoard(),
			createdAt: new Date(),
			name,
		});
	}

	toJSON() {
		return {
			id: this.id,
			board: this.board,
			createdAt: this.createdAt.toLocaleString(),
			name: this.name,
		};
	}

	isCorrectOrIndex(trial) {
		let wrong = [];
		let success = true;
		for (let i = 0; i < 9; i++) {
			for (let j = 0; j < 9; j++) {
				if (trial[i][j] !== this.solution[i][j]) {
					wrong.push({ i, j });
					success = false;
				}
			}
		}
		return { success, wrong };
	}

	isComplete() {
		return this.board.every((row) => row.every((cell) => cell !== 0));
	}

	applyState(board) {
		this.board = board;
	}
}
