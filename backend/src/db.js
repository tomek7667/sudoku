import sqlite3 from "sqlite3";
import bcrypt from "bcrypt";
import { User } from "./domain/user.js";
import { Sudoku } from "./domain/sudoku.js";

export const db = new sqlite3.Database("db.sqlite");
const usersSeed = [{ name: "admin", password: "admin" }];
const shouldReset = false;

const dropTables = async () => {
	await new Promise((resolve, reject) => {
		db.run("DROP TABLE IF EXISTS users", () => {
			return resolve();
		});
	});
	await new Promise((resolve, reject) => {
		db.run("DROP TABLE IF EXISTS sudokus", () => {
			return resolve();
		});
	});
	await new Promise((resolve, reject) => {
		db.run("DROP TABLE IF EXISTS sudokus_users", () => {
			return resolve();
		});
	});
};

db.serialize(async () => {
	if (shouldReset) {
		await dropTables();
	}

	await new Promise((resolve, reject) => {
		db.run(
			"CREATE TABLE IF NOT EXISTS users (id UUID PRIMARY KEY, name TEXT, hash TEXT, created_at DATETIME)",
			() => {
				return resolve();
			}
		);
	});
	await new Promise((resolve, reject) => {
		db.run(
			"CREATE TABLE IF NOT EXISTS sudokus (id UUID PRIMARY KEY, board TEXT, created_at DATETIME, name TEXT)",
			() => {
				return resolve();
			}
		);
	});
	await new Promise((resolve, reject) => {
		db.run(
			"CREATE TABLE IF NOT EXISTS sudokus_users (user_id UUID, sudoku_id UUID, state TEXT, solved BOOLEAN DEFAULT 0)",
			() => {
				return resolve();
			}
		);
	});
	if (shouldReset) {
		await Promise.all(
			usersSeed.map(async ({ name, password }) => {
				const user = await User.create({ name, password });
				db.run(
					"INSERT INTO users (id, name, hash, created_at) VALUES (?, ?, ?, ?)",
					[user.id, user.name, user.hash, user.createdAt]
				);
			})
		);
	}
});

const getSolvedSudokusCount = async (userId) => {
	return new Promise((resolve, reject) => {
		db.get(
			"SELECT COUNT(*) AS count FROM sudokus_users WHERE user_id = ? AND solved = 1",
			[userId],
			async (err, row) => {
				if (err) {
					return reject(err);
				}
				return resolve(row.count);
			}
		);
	});
};

const serializeUser = async (obj) => {
	return new User({
		id: obj.id,
		name: obj.name,
		hash: obj.hash,
		created_at: new Date(obj.created_at),
		stars: await getSolvedSudokusCount(obj.id),
	});
};

export const authenticate = async (name, password) => {
	return new Promise((resolve, reject) => {
		db.get(
			"SELECT * FROM users WHERE name = ?",
			[name],
			async (err, row) => {
				if (err) {
					return reject(err);
				} else {
					if (!row) {
						return reject(new Error("User not found"));
					}
					const match = await bcrypt.compare(password, row.hash);
					if (match) {
						return resolve(await serializeUser(row));
					} else {
						return reject(new Error("Invalid password"));
					}
				}
			}
		);
	});
};

export const getUser = async (id) => {
	return new Promise((resolve, reject) => {
		db.get("SELECT * FROM users WHERE id = ?", [id], async (err, row) => {
			if (err) {
				return reject(err);
			}
			if (row) {
				return resolve(await serializeUser(row));
			} else {
				return reject(new Error("User not found"));
			}
		});
	});
};

export const saveUser = async (user) => {
	return new Promise((resolve, reject) => {
		const { id, name, hash, createdAt } = user;
		db.get("SELECT * FROM users WHERE id = ?", [id], async (err, row) => {
			if (err) {
				return reject(err);
			}
			if (row) {
				db.run(
					"UPDATE users SET name = ?, hash = ?, created_at = ? WHERE id = ?",
					[name, hash, createdAt, id],
					(err) => {
						if (err) {
							return reject(err);
						}
						return resolve(user);
					}
				);
			} else {
				db.run(
					"INSERT INTO users (id, name, hash, created_at) VALUES (?, ?, ?, ?)",
					[id, name, hash, createdAt],
					(err) => {
						if (err) {
							return reject(err);
						}
						return resolve(user);
					}
				);
			}
		});
	});
};

const serializeSudoku = (obj) => {
	return new Sudoku({
		id: obj.id,
		board: JSON.parse(obj.board),
		createdAt: new Date(obj.created_at),
		name: obj.name,
	});
};

export const getSudoku = async (sudokuId) => {
	return new Promise((resolve, reject) => {
		db.get(
			"SELECT * FROM sudokus WHERE id = ?",
			[sudokuId],
			async (err, row) => {
				if (err) {
					return reject(err);
				}
				if (row) {
					return resolve(serializeSudoku(row));
				} else {
					return reject(new Error("Sudoku not found"));
				}
			}
		);
	});
};

export const getUserSudoku = async (userId, sudokuId) => {
	return new Promise((resolve, reject) => {
		db.get(
			"SELECT state FROM sudokus_users WHERE user_id = ? AND sudoku_id = ?",
			[userId, sudokuId],
			async (err, row) => {
				if (err) {
					return reject(err);
				}
				if (row) {
					return resolve(JSON.parse(row.state));
				} else {
					return reject(new Error("Sudoku not found"));
				}
			}
		);
	});
};

export const saveUserSudoku = async (userId, sudokuId, state, solved) => {
	return new Promise((resolve, reject) => {
		db.get(
			"SELECT * FROM sudokus_users WHERE user_id = ? AND sudoku_id = ?",
			[userId, sudokuId],
			async (err, row) => {
				if (err) {
					return reject(err);
				}
				if (row) {
					db.run(
						"UPDATE sudokus_users SET state = ?, solved = ? WHERE user_id = ? AND sudoku_id = ?",
						[state, solved, userId, sudokuId],
						(err) => {
							if (err) {
								return reject(err);
							}
							return resolve();
						}
					);
				} else {
					db.run(
						"INSERT INTO sudokus_users (user_id, sudoku_id, state) VALUES (?, ?, ?)",
						[userId, sudokuId, state],
						(err) => {
							if (err) {
								return reject(err);
							}
							return resolve();
						}
					);
				}
			}
		);
	});
};

export const saveSudoku = async (sudoku) => {
	return new Promise((resolve, reject) => {
		const { id, board, createdAt, name } = sudoku;
		db.get("SELECT * FROM sudokus WHERE id = ?", [id], async (err, row) => {
			if (err) {
				return reject(err);
			}
			if (row) {
				db.run(
					"UPDATE sudokus SET board = ?, created_at = ?, name = ? WHERE id = ?",
					[JSON.stringify(board), createdAt, name, id],
					(err) => {
						if (err) {
							return reject(err);
						}
						return resolve(sudoku);
					}
				);
			} else {
				db.run(
					"INSERT INTO sudokus (id, board, created_at, name) VALUES (?, ?, ?, ?)",
					[id, JSON.stringify(board), createdAt, name],
					(err) => {
						if (err) {
							return reject(err);
						}
						return resolve(sudoku);
					}
				);
			}
		});
	});
};

export const getSudokuByName = async (name, offset, limit) => {
	return new Promise((resolve, reject) => {
		db.all(
			"SELECT * FROM sudokus WHERE name LIKE ? LIMIT ? OFFSET ?",
			[`%${name}%`, limit, offset],
			async (err, rows) => {
				if (err) {
					return reject(err);
				}
				if (rows) {
					return resolve(rows.map(serializeSudoku));
				} else {
					return reject(new Error("Sudoku not found"));
				}
			}
		);
	});
};

export const getSolvedSudokusNames = async (userId, offset, limit) => {
	return new Promise((resolve, reject) => {
		db.all(
			"SELECT sudokus.* FROM sudokus_users JOIN sudokus ON sudokus.id = sudokus_users.sudoku_id WHERE sudokus_users.user_id = ? AND sudokus_users.solved = 1 LIMIT ? OFFSET ?",
			[userId, limit, offset],
			async (err, rows) => {
				if (err) {
					return reject(err);
				}
				return resolve(rows.map(serializeSudoku));
			}
		);
	});
};

export const getInProgressSudokusNames = async (userId, offset, limit) => {
	return new Promise((resolve, reject) => {
		db.all(
			"SELECT sudokus.* FROM sudokus_users JOIN sudokus ON sudokus.id = sudokus_users.sudoku_id WHERE sudokus_users.user_id = ? AND sudokus_users.solved = 0 LIMIT ? OFFSET ?",
			[userId, limit, offset],
			async (err, rows) => {
				if (err) {
					return reject(err);
				}
				return resolve(rows.map(serializeSudoku));
			}
		);
	});
};
