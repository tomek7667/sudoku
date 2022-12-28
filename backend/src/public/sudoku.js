let boardElements = [];

const refreshSudoku = (ms) => {
	document.cookie = "sudokuId = ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
	setTimeout(() => {
		window.location.reload();
	}, ms);
};

const removeHighlight = () => {
	document
		.querySelectorAll(".highlightCell")
		.forEach((cell) => cell.classList.remove("highlightCell"));
};

const checkSudoku = async () => {
	const board = boardElements.map((row) => {
		return row.map((cell) => {
			return isNaN(parseInt(cell.value)) ? 0 : parseInt(cell.value);
		});
	});
	const response = await fetch("/api/v1/sudokus", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			cookie: document.cookie,
		},
		body: JSON.stringify({ board }),
	});
	const checkResponse = await response.json();
	const result = document.getElementById("checkResult");
	if (checkResponse.success) {
		result.classList.remove("lose");
		result.classList.add("win");
		result.innerText = "Congratulations! You solved the sudoku!";
		displayFireworks();
	} else {
		removeHighlight();
		result.classList.remove("win");
		result.classList.add("lose");
		result.innerText =
			"Sorry, you didn't solve the sudoku correctly. Cells with wrong values were highlighted.";
		checkResponse.wrong.map(({ i, j, value }) => {
			if (value !== 0) {
				const cell = document.getElementById(
					"cellInput-" + i + "-" + j
				);
				cell.classList.add("highlightCell");
			}
		});
	}
};

const saveSudokuState = async () => {
	const board = boardElements.map((row) => {
		return row.map((cell) => {
			return isNaN(parseInt(cell.value)) ? 0 : parseInt(cell.value);
		});
	});
	const response = await fetch("/api/v1/sudokus", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			cookie: document.cookie,
		},
		body: JSON.stringify({ board }),
	});
	if (response.status === 200) {
		document.getElementById("checkResult").innerText =
			"Sudoku state saved successfully!";
	}
};

window.addEventListener("DOMContentLoaded", async () => {
	const sudokuBox = document.getElementById("sudokuBox");
	const refreshButton = document.getElementById("refreshButton");

	const response = await fetch("/api/v1/sudokus");
	const fetchedSudoku = await response.json();
	if (fetchedSudoku.success) {
		const { name, board } = fetchedSudoku.data.sudoku;
		const { state } = fetchedSudoku.data;
		document.getElementById(
			"sudokuName"
		).innerText = `Sudoku name: ${name}`;
		let i = 0;
		board.forEach((row) => {
			boardElements.push([]);
			const rowDiv = document.createElement("div");
			rowDiv.classList.add("row");
			let j = 0;
			row.forEach((cell) => {
				const cellInput = document.createElement("input");
				cellInput.id = "cellInput-" + i + "-" + j;
				cellInput.classList.add("cell");
				// cellInput.min = 1;
				// cellInput.max = 9;
				cellInput.type = "tel";
				cellInput.disabled = cell !== 0;
				if (cell !== 0) cellInput.classList.add("preDefinedCell");
				cellInput.value = cell !== 0 ? cell : "";
				rowDiv.appendChild(cellInput);
				boardElements[i] = [...boardElements[i], cellInput];
				j++;
			});
			i++;
			sudokuBox.appendChild(rowDiv);
		});
		state.forEach(({ i, j, value }) => {
			if (value !== 0 && boardElements[i][j].value === "") {
				boardElements[i][j].value = value;
			}
		});
	} else {
		document.getElementById(
			"sudokuName"
		).innerText = `An error ocurred: ${fetchedSudoku.message} - Refreshing in 5 seconds...`;
		refreshSudoku(5000);
	}

	refreshButton.addEventListener("click", () => {
		refreshSudoku(0);
	});

	solveButton = document.getElementById("solveButton");

	solveButton.addEventListener("click", () => {
		checkSudoku();
	});
});
