import sqlite3 from "sqlite3";
import bcrypt from "bcrypt";
import { User } from "./domain/user.js";

export const db = new sqlite3.Database("db.sqlite");
const saltRounds = 0xd;
const usersSeed = [{ name: "admin", password: "admin" }];

db.serialize(async () => {
	db.run("DROP TABLE IF EXISTS users");
	db.run(
		"CREATE TABLE IF NOT EXISTS users (id UUID PRIMARY KEY, name TEXT, hash TEXT, created_at DATETIME)"
	);
	await Promise.all(
		usersSeed.map(async ({ name, password }) => {
			const user = await User.create({ name, password });
			db.run(
				"INSERT INTO users (id, name, hash, created_at) VALUES (?, ?, ?, ?)",
				[user.id, user.name, user.hash, user.createdAt]
			);
		})
	);
});

export const login = async (name, password) => {
	return new Promise((resolve, reject) => {
		db.get(
			"SELECT * FROM users WHERE name = ?",
			[name],
			async (err, row) => {
				if (err) {
					reject(err);
				} else {
					console.log("row", row);
					const match = await bcrypt.compare(password, row.hash);
					if (match) {
						return resolve(serialize(row));
					} else {
						return reject("Invalid password");
					}
				}
			}
		);
	});
};

const serialize = (obj) => {
	return new User({
		id: obj.id,
		name: obj.name,
		hash: obj.hash,
		created_at: new Date(obj.created_at),
	});
};
