<script>
	let { customerList, onViewCustomer, onPrepareNew, onBackToDashboard } = $props();

	let searchAddress = $state("");
	let searchAcNo = $state("");

	let filteredCustomers = $derived.by(() => {
		const address = searchAddress.toLowerCase();
		const acNum = searchAcNo;
		return customerList.filter((cust) => {
			const addressMatch = cust.address.toLowerCase().includes(address);
			const acMatch = String(cust.acNo).includes(acNum);
			return addressMatch && acMatch;
		});
	});
</script>

<div class="page-header">
	<div>
		<h1>Customer Management</h1>
		<p class="subtitle">Search, modify, or manage client billing and delivery data.</p>
	</div>
	<div class="header-actions">
		<button class="back-link" onclick={onBackToDashboard}>← Back</button>
		<button class="primary-btn" onclick={onPrepareNew}>+ Add Customer</button>
	</div>
</div>

<div class="filter-bar">
	<div class="filter-group small">
		<label for="acNo">A/c No:</label>
		<input id="acNo" type="text" placeholder="No..." bind:value={searchAcNo} />
	</div>

	<div class="filter-group large">
		<label for="custAddress">Customer Address:</label>
		<input id="custAddress" type="text" placeholder="Search by address..." bind:value={searchAddress} />
	</div>

	<button class="clear-btn" onclick={() => { searchAddress = ""; searchAcNo = ""; }}>
		Clear Filters
	</button>
</div>

<div class="data-section">
	<table class="modern-table">
		<thead>
			<tr>
				<th>A/c No</th>
				<th>Customer Name</th>
				<th>Address</th>
				<th>Actions</th>
			</tr>
		</thead>
		<tbody>
			{#each filteredCustomers as cust}
				<tr>
					<td>{cust.acNo}</td>
					<td>
						<strong>{cust.title} {cust.surname}{cust.forename ? ", " + cust.forename : ""}</strong>
					</td>
					<td>{cust.address}</td>
					<td>
						<button class="edit-btn" onclick={() => onViewCustomer(cust)}>View</button>
					</td>
				</tr>
			{:else}
				<tr>
					<td colspan="4" style="text-align: center; padding: 2rem; color: #636e72;">
						No customers found. Click "+ Add Customer" to start.
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 25px;
		border-bottom: 2px solid #dee2e6;
		padding-bottom: 15px;
	}

	.page-header h1 {
		margin: 0;
		color: #2d3436;
		font-size: 28px;
	}

	.subtitle {
		margin: 5px 0 0 0;
		color: #636e72;
		font-size: 14px;
	}

	.header-actions {
		display: flex;
		gap: 15px;
		align-items: center;
	}

	.back-link {
		background: none;
		border: none;
		color: #3498db;
		font-weight: bold;
		cursor: pointer;
		font-size: 14px;
	}

	.primary-btn {
		background: #2ecc71;
		color: white;
		border: none;
		padding: 10px 20px;
		border-radius: 4px;
		font-weight: bold;
		cursor: pointer;
	}

	.primary-btn:hover {
		background: #27ae60;
	}

	.filter-bar {
		display: flex;
		background: #f8f9fa;
		padding: 15px;
		border-radius: 6px;
		gap: 20px;
		align-items: flex-end;
		margin-bottom: 20px;
		border: 1px solid #e9ecef;
	}

	.filter-group {
		display: flex;
		flex-direction: column;
		gap: 5px;
	}

	.filter-group.small { width: 120px; }
	.filter-group.large { flex: 1; }

	.filter-group label {
		font-size: 12px;
		font-weight: bold;
		color: #495057;
	}

	.filter-group input {
		padding: 8px;
		border: 1px solid #ced4da;
		border-radius: 4px;
		font-size: 14px;
	}

	.clear-btn {
		padding: 8px 15px;
		background: #6c757d;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}

	.data-section {
		background: white;
		border-radius: 6px;
		box-shadow: 0 2px 8px rgba(0,0,0,0.05);
		overflow: hidden;
	}

	.modern-table {
		width: 100%;
		border-collapse: collapse;
		text-align: left;
	}

	.modern-table th {
		background: #f1f3f5;
		color: #495057;
		padding: 12px 15px;
		font-weight: bold;
		border-bottom: 2px solid #dee2e6;
	}

	.modern-table td {
		padding: 12px 15px;
		border-bottom: 1px solid #dee2e6;
		color: #333;
	}

	.modern-table tr:hover {
		background: #f8f9fa;
	}

	.edit-btn {
		background: #3498db;
		color: white;
		border: none;
		padding: 6px 12px;
		border-radius: 4px;
		cursor: pointer;
	}

	.edit-btn:hover {
		background: #2980b9;
	}
</style>