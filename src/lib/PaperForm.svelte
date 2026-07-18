<script>
	let {
		mode = "add",
		paperData = {}, // Reused as paperData context here
		onSave,
		onUpdate,
		onDelete,
		onBack,
	} = $props();

	let isReadOnly = $state(mode === "view");

	// State structured to match the metadata fields
	let form = $state(
		mode === "view"
			? { ...paperData }
			: {
					name: "",
					type: "Newspaper",
					delivery: "Daily",
					notes: "",
					heavy: false,
					stopped: false,
					currentFromDate: "",
					newFromDate: "",
				},
	);

	// Multi-column pricing state structures
	let currentPrices = $state(paperData.currentPrices || { monday: 0, tuesday: 0, wednesday: 0, thursday: 0, friday: 0, saturday: 0, sunday: 0 });
	let newPrices = $state(paperData.newPrices || { monday: 0, tuesday: 0, wednesday: 0, thursday: 0, friday: 0, saturday: 0, sunday: 0 });

	let originalBackup = { currentPrices: {}, newPrices: {}, profile: {} };
	const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

	function handleSave() {
		const payload = {
			...form,
			currentPrices,
			newPrices
		};
		if (mode === "add") onSave(payload);
		else onUpdate(payload);
	}

	function handleEdit() {
		if (paperData) {
			form = { ...paperData };
			currentPrices = { ...(paperData.currentPrices || {}) };
			newPrices = { ...(paperData.newPrices || {}) };

			originalBackup.profile = JSON.parse(JSON.stringify(form));
			originalBackup.currentPrices = JSON.parse(JSON.stringify(currentPrices));
			originalBackup.newPrices = JSON.parse(JSON.stringify(newPrices));
		}
		isReadOnly = false;
	}

	function handleCancel() {
		form = JSON.parse(JSON.stringify(originalBackup.profile));
		currentPrices = JSON.parse(JSON.stringify(originalBackup.currentPrices));
		newPrices = JSON.parse(JSON.stringify(originalBackup.newPrices));
		isReadOnly = true;
	}

	function noScroll(node) {
		const handleWheel = (e) => {
			e.preventDefault();
			node.blur();
		};
		node.addEventListener("wheel", handleWheel, { passive: false });
		return {
			destroy() {
				node.removeEventListener("wheel", handleWheel);
			},
		};
	}
</script>

<div class="form-container">
	<header class="app-header">
		<div>
			<button class="back-link" onclick={onBack}>← Back</button>
			<h1>
				{isReadOnly
					? "Paper Details"
					: mode === "add"
						? "Add New Paper"
						: "Edit Paper"}
			</h1>
		</div>
		<div class="header-actions">
			{#if isReadOnly}
				<button class="action-btn" onclick={handleEdit}>Edit</button>
				<button class="danger-btn" onclick={() => onDelete(form)}>Delete</button>
			{:else}
				{#if mode === "view"}
					<button class="cancel-btn" onclick={handleCancel}>Cancel</button>
				{/if}
				<button class="primary-btn" onclick={handleSave}>Save</button>
			{/if}
		</div>
	</header>

	<div class="vertical-stack">
		<section class="form-card">
			<h3>Paper Specifications</h3>
			
			<div class="grid-layout cols-3">
				<div class="field">
					<label for="name">Name</label>
					<input type="text" id="name" disabled={isReadOnly} bind:value={form.name} required />
				</div>
				<div class="field">
					<label for="type">Type</label>
					<select id="type" disabled={isReadOnly} bind:value={form.type}>
						<option>Newspaper</option>
						<option>Magazine</option>
					</select>
				</div>
				<div class="field">
					<label for="delivery">Delivery</label>
					<select id="delivery" disabled={isReadOnly} bind:value={form.delivery}>
                    {#if form.type === "Newspaper"}
						<option>Daily</option>
						<option>Weekly</option>
                        <option>Sunday</option>
                    {:else if form.type === "Magazine"}
                        <option>Monthly</option>
                        <option>Weekly</option>
                    {/if}
					</select>
				</div>
			</div>

			<div class="grid-layout cols-2-split">
				<div class="field">
					<label for="notes">Notes</label>
					<textarea id="notes" rows="2" disabled={isReadOnly} bind:value={form.notes}></textarea>
				</div>
			</div>
		</section>

		<div class="grid-layout cols-2">
			<section class="form-card">
				<div class="card-header-flex">
					<h3>Current Rates</h3>
					<div class="date-field">
						<label for="curr-date">Effective from:</label>
						<input type="date" id="curr-date" disabled={isReadOnly} bind:value={form.currentFromDate} />
					</div>
				</div>
				
				<div class="price-list">
					{#each days as day}
						<div class="price-row">
							<span class="day-label">{day.charAt(0).toUpperCase() + day.slice(1)}</span>
							<div class="currency-input-wrapper">
								<span class="currency-symbol">£</span>
								<input type="number" step="0.01" disabled={isReadOnly} bind:value={currentPrices[day]} use:noScroll />
							</div>
						</div>
					{/each}
				</div>
			</section>

			<section class="form-card">
				<div class="card-header-flex">
					<h3>New Rates</h3>
					<div class="date-field">
						<label for="new-date">Effective from:</label>
						<input type="date" id="new-date" disabled={isReadOnly} bind:value={form.newFromDate} />
					</div>
				</div>

				<div class="price-list">
					{#each days as day}
						<div class="price-row">
							<span class="day-label">{day.charAt(0).toUpperCase() + day.slice(1)}</span>
							<div class="currency-input-wrapper">
								<span class="currency-symbol">£</span>
								<input type="number" step="0.01" disabled={isReadOnly} bind:value={newPrices[day]} use:noScroll />
							</div>
						</div>
					{/each}
				</div>
			</section>
		</div>
	</div>
</div>

<style>
	/* Shared Application Layout Frame Styling */
	.form-container {
		background: #f8f9fa;
		padding: 24px;
		border-radius: 8px;
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
	}

	.app-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 24px;
		border-bottom: 2px solid #e9ecef;
		padding-bottom: 12px;
	}

	.app-header h1 {
		margin: 8px 0 0 0;
		font-size: 24px;
		color: #212529;
		font-weight: 600;
	}

	.back-link {
		background: none;
		border: none;
		color: #4dabf7;
		font-weight: bold;
		cursor: pointer;
		padding: 0;
		font-size: 14px;
	}

	.header-actions {
		display: flex;
		gap: 12px;
	}

	.action-btn, .primary-btn, .cancel-btn, .danger-btn {
		padding: 10px 20px;
		border: none;
		border-radius: 6px;
		font-weight: 600;
		cursor: pointer;
		font-size: 14px;
		transition: background 0.2s ease;
	}

	.action-btn { background: #3498db; color: white; }
	.primary-btn { background: #2ecc71; color: white; }
	.cancel-btn { background: #7f8c8d; color: white; }
	.danger-btn { background: #e74c3c; color: white; }

	.vertical-stack {
		display: flex;
		flex-direction: column;
		gap: 24px;
	}

	/* Card Panel Structural Design Layout definitions */
	.form-card {
		background: white;
		padding: 24px;
		border-radius: 8px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1);
	}

	.form-card h3 {
		margin-top: 0;
		margin-bottom: 20px;
		color: #495057;
		font-size: 16px;
		font-weight: 600;
		border-bottom: 1px solid #dee2e6;
		padding-bottom: 10px;
	}

	.card-header-flex {
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-bottom: 1px solid #dee2e6;
		margin-bottom: 20px;
		padding-bottom: 10px;
	}

	.card-header-flex h3 {
		margin: 0;
		border-bottom: none;
		padding-bottom: 0;
	}

	.grid-layout {
		display: grid;
		gap: 20px;
		margin-bottom: 20px;
	}
	.grid-layout:last-child {
		margin-bottom: 0;
	}

	.cols-2 { grid-template-columns: repeat(2, 1fr); }
	.cols-3 { grid-template-columns: repeat(3, 1fr); }
	.cols-2-split { grid-template-columns: 2fr 1fr; gap: 40px; }

	.field {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	label {
		font-size: 13px;
		font-weight: 600;
		color: #495057;
	}

	.date-field {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	
	.date-field label {
		white-space: nowrap;
	}

	.date-field input[type="date"] {
		height: 34px;
		padding: 4px 10px;
		width: 150px;
	}

	input[type="text"],
	input[type="number"],
	input[type="date"],
    select,
	textarea {
		padding: 10px 14px;
		border: 1px solid #ced4da;
		border-radius: 6px;
		font-size: 14px;
		color: #212529;
		background-color: #fff;
		width: 100%;
		box-sizing: border-box;
		height: 42px;
	}

	textarea {
		height: auto;
		resize: vertical;
	}

	input:focus, textarea:focus {
		outline: none;
		border-color: #a5d8ff;
	}

	input:disabled, textarea:disabled {
		background-color: #e9ecef !important;
		color: #495057 !important;
		opacity: 0.9;
		cursor: not-allowed;
	}

	/* Pricing Grid items layout */
	.price-list {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.price-row {
		display: grid;
		grid-template-columns: 140px 1fr;
		align-items: center;
	}

	.day-label {
		font-size: 13px;
		font-weight: 600;
		color: #495057;
	}

	.currency-input-wrapper {
		display: flex;
		align-items: center;
		border: 1px solid #ced4da;
		border-radius: 6px;
		background: #fff;
		padding-left: 12px;
		height: 38px;
		box-sizing: border-box;
	}

	.currency-input-wrapper:has(input:disabled) {
		background-color: #e9ecef;
	}

	.currency-symbol {
		font-size: 14px;
		color: #495057;
		font-weight: 600;
		user-select: none;
	}

	.currency-input-wrapper input {
		border: none;
		height: 100%;
		padding: 0 12px 0 4px;
		text-align: right;
		background: transparent;
	}

	.currency-input-wrapper input:focus {
		outline: none;
	}

	/* Micro reset to completely clean native numeric triggers */
	input[type="number"]::-webkit-inner-spin-button,
	input[type="number"]::-webkit-outer-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}
	input[type="number"] { -moz-appearance: textfield; }
</style>