window.addEventListener("DOMContentLoaded", () => {
	const profileForm = document.getElementById("updateUserForm");

	profileForm.addEventListener("submit", async (e) => {
		e.preventDefault();
		const formData = new FormData(e.target);
		const body = Object.fromEntries(formData.entries());
		const response = await fetch("/api/v1/users/profile", {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(body),
		});
		if (response.redirected) {
			window.location = response.url;
		}
	});
});
