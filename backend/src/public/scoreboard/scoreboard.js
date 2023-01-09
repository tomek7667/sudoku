let offset = 0;
const scoreboard = document.getElementById("scoreboard");

const getScoreboard = async () => {
	const response = await fetch(`/api/v1/scoreboard?offset=${offset}`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	});
	const data = await response.json();
	return data;
};

const updateScoreboard = async () => {
	const scoreboardData = await getScoreboard();
	scoreboardData.map(({ username, score }) => {
		const row = document.createElement("tr");
		const placeCell = document.createElement("td");
		const usernameCell = document.createElement("td");
		const scoreCell = document.createElement("td");
		placeCell.innerText = offset + 1;
		usernameCell.innerText = username;
		scoreCell.innerText = score;
		row.appendChild(placeCell);
		row.appendChild(usernameCell);
		row.appendChild(scoreCell);
		scoreboard.appendChild(row);
		offset++;
	});
};

updateScoreboard();

document.getElementById("loadMore").addEventListener("click", updateScoreboard);
