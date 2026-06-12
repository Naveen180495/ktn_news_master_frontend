<script>
	let { onLoginSuccess } = $props();

	let username = $state("");
	let password = $state("");
	let errorMessage = $state("");

	async function handleLogin(e) {
		e.preventDefault();
		try {
			// Extract runtime snapshot values from Svelte 5 Runes states cleanly
			const payload = {
				username: username,
				password: password,
			};

			const response = await fetch(
				"http://localhost:8080/api/auth/login",
				{
					method: "POST",
					body: JSON.stringify(payload),
					headers: { "Content-Type": "application/json" },
				},
			);

			if (response.ok) {
				// Clear any transient error flags before state progression
				errorMessage = "";
				onLoginSuccess();
			} else {
				errorMessage =
					"Invalid credentials. Please verify username and password.";
			}
		} catch (err) {
			errorMessage = "Authentication server down or unreachable.";
		}
	}
</script>

<div class="login-container">
	<form onsubmit={handleLogin} class="login-card">
		<img
			src="https://cdn-icons-png.flaticon.com/512/6081/6081434.png"
			alt="User Icon"
			width="80"
		/>
		<h1>KTN POS Login</h1>

		<div class="input-group">
			<label for="user">Username</label>
			<input
				id="user"
				type="text"
				bind:value={username}
				placeholder="Enter username"
				required
			/>
		</div>

		<div class="input-group">
			<label for="pass">Password</label>
			<input
				id="pass"
				type="password"
				bind:value={password}
				placeholder="••••••••"
				required
			/>
		</div>

		{#if errorMessage}
			<p class="error">{errorMessage}</p>
		{/if}

		<button type="submit">Login</button>
	</form>
</div>

<style>
	.login-container {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 100vh;
		background-color: #2c3e50;
		font-family: Arial, sans-serif;
	}

	.login-card {
		background: #fff;
		padding: 40px;
		border-radius: 8px;
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
		text-align: center;
		width: 100%;
		max-width: 400px;
	}

	.login-card img {
		margin-bottom: 20px;
	}

	.login-card h1 {
		font-size: 24px;
		color: #333;
		margin-bottom: 30px;
	}

	.input-group {
		margin-bottom: 20px;
		text-align: left;
	}

	.input-group label {
		display: block;
		font-size: 14px;
		color: #666;
		margin-bottom: 5px;
	}

	.input-group input {
		width: 100%;
		padding: 10px;
		font-size: 16px;
		border: 1px solid #ccc;
		border-radius: 4px;
		box-sizing: border-box;
	}

	.input-group input:focus {
		border-color: #3498db;
		outline: none;
	}

	button {
		width: 100%;
		padding: 12px;
		font-size: 16px;
		color: #fff;
		background-color: #3498db;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-weight: bold;
	}

	button:hover {
		background-color: #2980b9;
	}

	.error {
		color: #e74c3c;
		font-size: 14px;
		margin-bottom: 20px;
		font-weight: 600;
	}
</style>
