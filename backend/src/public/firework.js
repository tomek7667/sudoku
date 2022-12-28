var c = document.getElementById("fireworkBox");

const Sleep = (milliseconds) => {
	return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

function displayFireworks() {
	var myConfetti = confetti.create(c, {
		resize: true,
		useWorker: true,
	});
	var end = Date.now() + 3 * 1000;
	(async function frame() {
		myConfetti({
			particleCount: 100,
			startVelocity: 30,
			spread: 360,
			origin: {
				x: Math.random(),
				// since they fall down, start a bit higher than random
				y: Math.random() - 0.2,
			},
		});

		// keep going until we are out of time
		if (Date.now() < end) {
			await Sleep(400);
			requestAnimationFrame(frame);
		}
	})();
}
