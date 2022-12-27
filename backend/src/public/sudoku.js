let boardElements = [];

const refreshSudoku = (ms) => {
	document.cookie = "sudokuId = ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
	setTimeout(() => {
		window.location.reload();
	}, ms);
};

const removeHighlight = () => {
	const cells = document.getElementsByClassName("highlightCell");
	for (let i = 0; i < cells.length; i++) {
		cells[i].classList.remove("highlightCell");
	}
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

	if (checkResponse.success) {
		document.getElementById("checkResult").innerText =
			"Congratulations! You solved the sudoku!";
	} else {
		removeHighlight();
		checkResponse.wrong.map(({ i, j }) => {
			const cell = document.getElementById("cellInput-" + i + "-" + j);
			cell.classList.add("highlightCell");
		});
		document.getElementById("checkResult").innerText =
			"Sorry, you didn't solve the sudoku correctly. Wrong cells were highlighted.";
	}
};

window.addEventListener("DOMContentLoaded", async () => {
	const sudokuBox = document.getElementById("sudokuBox");
	const refreshButton = document.getElementById("refreshButton");

	const response = await fetch("/api/v1/sudokus");
	const fetchedSudoku = await response.json();
	if (fetchedSudoku.success) {
		const { name, board } = fetchedSudoku.data;
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
				cellInput.min = 1;
				cellInput.max = 9;
				cellInput.value = cell === 0 ? "" : cell;
				rowDiv.appendChild(cellInput);

				boardElements[i] = [...boardElements[i], cellInput];
				j++;
			});
			i++;
			sudokuBox.appendChild(rowDiv);
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
