import bcrypt from "bcrypt";
import { randomUUID } from "crypto";
const saltRounds = 0xd;

export class User {
	constructor({ id, name, hash, created_at }) {
		this.id = id;
		this.name = name;
		this.hash = hash;
		this.createdAt = created_at;
	}

	static async create({ name, password }) {
		const hash = await bcrypt.hash(password, saltRounds);
		const id = randomUUID();
		return new User({ id, name, hash, created_at: new Date() });
	}

	toJSON() {
		return {
			id: this.id,
			name: this.name,
			createdAt: this.createdAt,
		};
	}
}
