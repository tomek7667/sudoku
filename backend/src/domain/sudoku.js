import { randomUUID } from "crypto";
import S from "sudoku";
import gen from "random-seed";
const shuffleRounds = 0xffff;

const puzzleToBoard = (puzzle) => {
	const board = [];
	for (let i = 0; i < 9; i++) {
		const row = [];
		for (let j = 0; j < 9; j++) {
			const cell = puzzle[i * 9 + j];
			row.push(cell === null ? 0 : cell + 1);
		}
		board.push(row);
	}
	return board;
};

const boardToPuzzle = (board) => {
	const puzzle = [];
	for (let i = 0; i < 9; i++) {
		for (let j = 0; j < 9; j++) {
			const cell = board[i][j];
			puzzle.push(cell === 0 ? null : cell - 1);
		}
	}
	return puzzle;
};

function generateSudokuBoard() {
	const puzzle = S.makepuzzle();
	const board = puzzleToBoard(puzzle);
	return board;
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

export const getEmptyBoard = () => {
	const board = [];
	for (let i = 0; i < 9 ** 2; i++) {
		board.push({ i: Math.floor(i / 9), j: i % 9, value: 0 });
	}
	return board;
};

export const deserializeBoard = (board) => {
	if (!board || board.length !== 9) {
		return getEmptyBoard();
	}
	const newBoard = [];
	for (let i = 0; i < 9; i++) {
		for (let j = 0; j < 9; j++) {
			newBoard.push({ i, j, value: board[i][j] });
		}
	}
	return newBoard;
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
					wrong.push({ i, j, value: trial[i][j] });
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
