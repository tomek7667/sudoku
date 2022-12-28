const list = document.getElementById("sudokus");
let offset = 0;

const Sleep = (milliseconds) => {
	return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

const clearList = () => {
	while (list.firstChild) {
		list.removeChild(list.firstChild);
	}
	offset = 0;
};

const addToSudokuList = (sudoku) => {
	const sudokuElement = document.createElement("li");
	sudokuElement.classList.add("sudoku-list-item");
	sudokuElement.innerText = sudoku.name;
	list.appendChild(sudokuElement);
	sudokuElement.addEventListener("click", () => {
		document.cookie = `sudokuId=${sudoku.id}`;
		window.location.href = "/";
	});
};

const fetchSudokus = async (query = "") => {
	const response = await fetch(
		`/api/v1/sudokus/search?q=${decodeURI(query)}&offset=${offset}`
	);
	const fetchedSudokus = await response.json();
	if (fetchedSudokus.success) {
		fetchedSudokus.data.forEach((sudoku) => {
			addToSudokuList(sudoku);
		});
		offset += fetchedSudokus.data.length;
	}
};

const waitTime = 300;
let shouldFetch = true;

window.addEventListener("DOMContentLoaded", () => {
	fetchSudokus();
	const searchInput = document.getElementById("search");
	searchInput.addEventListener("input", async (e) => {
		if (e.target.value === "") {
			shouldFetch = true;
			return;
		}
		if (shouldFetch) {
			shouldFetch = false;
			await Sleep(waitTime);
			shouldFetch = true;
			clearList();
			await fetchSudokus(e.target.value);
		}
	});

	const loadMoreButton = document.getElementById("loadMore");
	loadMoreButton.addEventListener("click", async () => {
		const value = searchInput.value;
		await fetchSudokus(value);
	});
});
