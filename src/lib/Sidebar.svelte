<script>
	let { activeTab, onNavigate, onLogout } = $props();

	const menuItems = [
		{ name: "Rounds", icon: "🔄", desc: "Manage delivery cycles" },
		{ name: "Streets", icon: "📍", desc: "Route and location data" },
		{ name: "Papers", icon: "📰", desc: "Inventory and publications" },
		{ name: "Customers", icon: "👥", desc: "Client database" },
		{ name: "Deliveries", icon: "🚚", desc: "Track active shipments" },
		{ name: "Utilities", icon: "🛠️", desc: "System settings" },
	];
</script>

<aside class="sidebar">
	<div class="logo">
		<div class="logo-icon">KTN</div>
		<span>News Master</span>
	</div>

	<nav>
		{#each menuItems as item}
			<button
				class="nav-item"
				class:active={activeTab === item.name.toLowerCase() ||
					(item.name === "Customers" &&
						(activeTab === "view-customer" ||
							activeTab === "add-customer" ||
							activeTab === "ledger"))}
				onclick={() => onNavigate(item.name.toLowerCase())}
			>
				<span class="icon">{item.icon}</span>
				<div class="nav-text">
					<span class="nav-title">{item.name}</span>
					<span class="nav-desc">{item.desc}</span>
				</div>
			</button>
		{/each}
	</nav>

	<button class="exit-btn" onclick={onLogout}>Logout</button>
</aside>

<style>
	.sidebar {
		width: 260px;
		background: #2c3e50;
		color: #ecf0f1;
		display: flex;
		flex-direction: column;
		border-right: 4px solid #34495e;
		position: -webkit-sticky;
		position: sticky;
		top: 0;
		height: 100vh; /* Always match the height of the screen monitor precisely */
		min-height: 100vh;
		max-height: 100vh;
		overflow-y: auto;
	}

	.logo {
		padding: 20px;
		display: flex;
		align-items: center;
		gap: 12px;
		background: #1a252f;
		border-bottom: 2px solid #34495e;
	}

	.logo-icon {
		background: #e67e22;
		color: #fff;
		font-weight: bold;
		padding: 6px 10px;
		border-radius: 4px;
	}

	.logo span {
		font-weight: bold;
		font-size: 18px;
	}

	nav {
		flex: 1;
		padding: 15px 0;
	}

	.nav-item {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 15px;
		padding: 12px 20px;
		background: none;
		border: none;
		color: #bdc3c7;
		text-align: left;
		cursor: pointer;
		transition: all 0.2s;
	}

	.nav-item:hover {
		background: #34495e;
		color: #fff;
	}

	.nav-item.active {
		background: #3498db;
		color: #fff;
		border-left: 5px solid #e67e22;
	}

	.nav-item .icon {
		font-size: 20px;
	}

	.nav-text {
		display: flex;
		flex-direction: column;
	}

	.nav-title {
		font-weight: bold;
		font-size: 14px;
	}

	.nav-desc {
		font-size: 11px;
		color: #95a5a6;
	}

	.exit-btn {
		margin: 20px;
		padding: 10px;
		background: #c0392b;
		color: #fff;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-weight: bold;
	}

	.exit-btn:hover {
		background: #e74c3c;
	}
</style>
