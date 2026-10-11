<script>
	// 1. Destructure using Svelte 5 bindable state syntax parameters
	let { customer, isOpen = $bindable(false), onClose } = $props();

	// Real-time date boundary thresholds
	const currentYear = new Date().getFullYear();
	const currentMonthNumber = new Date().getMonth() + 1;

	const todayDate = new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });

	// Modal State Controls
	let selectedYear = $state(currentYear);
	let selectedMonth = $state(currentMonthNumber);
	let customNoteText = $state(
		"DEAR CUSTOMER, PLEASE FIND YOUR WEEKLY STATEMENT COPIES ATTACHED BELOW. THANK YOU.",
	);

	let isProcessing = $state(false);
	let showPreviewScreen = $state(false);
	let invoiceData = $state(null);

	// Date selections limits
	const dynamicYears = [currentYear - 2, currentYear - 1, currentYear];
	const allMonths = [
		{ value: 1, name: "January" },
		{ value: 2, name: "February" },
		{ value: 3, name: "March" },
		{ value: 4, name: "April" },
		{ value: 5, name: "May" },
		{ value: 6, name: "June" },
		{ value: 7, name: "July" },
		{ value: 8, name: "August" },
		{ value: 9, name: "September" },
		{ value: 10, name: "October" },
		{ value: 11, name: "November" },
		{ value: 12, name: "December" },
	];

	let availableMonths = $derived(
		selectedYear === currentYear
			? allMonths.filter((m) => m.value <= currentMonthNumber)
			: allMonths,
	);

	$effect(() => {
		if (
			selectedYear === currentYear &&
			selectedMonth > currentMonthNumber
		) {
			selectedMonth = currentMonthNumber;
		}
	});

	async function loadInvoicePreview() {
		if (!customer || !customer.acNo) return;
		isProcessing = true;

		try {
			const response = await fetch(
				`http://localhost:8080/api/billing/monthly-bill/${customer.acNo}/${selectedYear}/${selectedMonth}`,
			);
			if (!response.ok)
				throw new Error(
					"Could not parse stream arrays from database server.",
				);

			invoiceData = await response.json();
			showPreviewScreen = true;
		} catch (err) {
			console.error("Fetch profile invoice error:", err);
			alert("Error reading backend data streams.");
		} finally {
			isProcessing = false;
		}
	}

	function triggerHardwarePrint() {
		window.print();
	}

	function closeEntireWorkflow() {
		showPreviewScreen = false;
		isOpen = false; // This triggers an upward bind state mutation back to +page.svelte seamlessly!
		invoiceData = null;

		// Call the fetch callback with the current customer account number
		if (onClose && customer?.acNo) {
			onClose(customer.acNo);
		}
	}

	/**
     * Takes a Saturday date input (e.g., "30/05/2026"), calculates the
     * previous Sunday date (e.g., "24/05/2026"), and returns the range string.
     */
    function getWeekRangeDisplay(dateInput, currentPrice = 0) {
        if (!dateInput) return { label: "N/A", value: "0.00" };

        // Parse the "DD/MM/YYYY" format safely
        let parts = dateInput.split("/");
        let saturdayDate;

        if (parts.length === 3) {
            saturdayDate = new Date(+parts[2], +parts[1] - 1, +parts[0]);
        } else {
            saturdayDate = new Date(dateInput);
        }

        // Fallback check if the date fails to parse
        if (isNaN(saturdayDate.getTime())) {
            return { label: dateInput, value: `${currentPrice.toFixed(2)}` };
        }

        // Calculate the previous Sunday by subtracting 6 days from Saturday
        let sundayDate = new Date(saturdayDate);
        sundayDate.setDate(saturdayDate.getDate() - 6);

        // Format options to print dates as DD/MM/YYYY
        const formatOptions = {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        };
        let sundayString = sundayDate.toLocaleDateString(
            "en-GB",
            formatOptions,
        );
        let saturdayString = saturdayDate.toLocaleDateString(
            "en-GB",
            formatOptions,
        );

        return {
            label: `${sundayString} - ${saturdayString}`,
            value: `${currentPrice.toFixed(2)}`,
        };
    }

	function getFullName(c) {
        return `${c.title || ""} ${c.forename || ""} ${c.surname || ""}`.trim();
    }
</script>

{#if isOpen && !showPreviewScreen}
	<div class="modal-backdrop no-print">
		<div class="dialog-box">
			<div class="dialog-header">
				<h3>Generate Single Statement [A/C: {customer?.acNo}]</h3>
				<button class="close-x-btn" onclick={() => (isOpen = false)}
					>&times;</button
				>
			</div>

			<div class="dialog-body">
				<div class="form-row-split">
					<div class="input-group">
						<label for="v-year">Target Billing Year</label>
						<select id="v-year" bind:value={selectedYear}>
							{#each dynamicYears as y}
								<option value={y}>{y}</option>
							{/each}
						</select>
					</div>

					<div class="input-group">
						<label for="v-month">Target Billing Month</label>
						<select id="v-month" bind:value={selectedMonth}>
							{#each availableMonths as m}
								<option value={m.value}>{m.name}</option>
							{/each}
						</select>
					</div>
				</div>

				<div class="input-group full-width">
					<label for="v-notes">Disclaimer Note Line Message</label>
					<textarea id="v-notes" rows="4" bind:value={customNoteText}
					></textarea>
				</div>
			</div>

			<div class="dialog-footer">
				<button
					class="cancel-modal-btn"
					disabled={isProcessing}
					onclick={() => (isOpen = false)}>Cancel</button
				>
				<button
					class="confirm-modal-btn"
					disabled={isProcessing}
					onclick={loadInvoicePreview}
				>
					{isProcessing
						? "Analyzing Records..."
						: "View Bill Preview"}
				</button>
			</div>
		</div>
	</div>
{/if}

{#if showPreviewScreen && invoiceData}
	<div class="print-window-wrapper">
		<div class="screen-header no-print">
			<button class="back-btn" onclick={() => (showPreviewScreen = false)}
				>← Back</button
			>
			<div class="bar-title">Monthly Statement Preview</div>
			<div class="right-actions">
				<button class="print-btn" onclick={triggerHardwarePrint}
					>🖨️ Print Statement</button
				>
				<button class="close-gate-btn" onclick={closeEntireWorkflow}
					>&times; Close</button
				>
			</div>
		</div>

		<div class="a4-print-page">
			<div class="invoice-card-tile">
				<div class="invoice-header">
					<div class="company-brand">
						<h3>KTN FOOD & WINE</h3>
						<p class="subtitle">
							234 Greystones Road, Sheffield, S11 7BR
						</p>
						<p class="subtitle phone">Tel: 0114 267 0260</p>
					</div>
				</div>

				<p class="doc-title">BILL FOR CUSTOMER</p>

				<div class="profile-date-row">
					<div class="meta-right-panel">
						<div class="ac-pill">
							Account: <strong>{invoiceData.acNo}</strong>
						</div>
					</div>
					<div class="date-badge-box">
						<span class="date-label">Date:</span>
						<span class="date-value">{todayDate}</span>
					</div>
				</div>
				<div class="address-date-row">
					<div class="customer-address-block">
						<h4 class="name-line">{getFullName(invoiceData)}</h4>
						{#if invoiceData.address}<div class="address-line">
								{invoiceData.address}
							</div>{/if}
					</div>
				</div>

				<div class="accounting-summary-box">
					<div class="ledger-row brought-forward-line">
						<span class="ledger-label">Balance brought forward</span
						>
						<span class="ledger-value"
							>{(invoiceData.balanceBroughtForward || 0).toFixed(
								2,
							)}</span
						>
					</div>

					<div class="weeks-scroller-area">
						{#each invoiceData.weeks || [] as week}
							{@const rangeItem = getWeekRangeDisplay(
								week.date,
								week.outstandingAmount,
							)}
							<div class="ledger-row week-item-line">
								<span class="ledger-label"
									>{rangeItem.label}</span
								>
								<span class="ledger-value"
									>{rangeItem.value}</span
								>
							</div>
						{/each}
					</div>

					<div class="ledger-row grand-total-row">
						<span class="total-label">TOTAL AMOUNT NOW DUE</span>
						<span class="total-value"
							>£ {(invoiceData.totalAmountDue || 0).toFixed(
								2,
							)}</span
						>
					</div>
				</div>

				<div class="customer-note-footer">
					<p class="note-body">
						{customNoteText}
					</p>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	/* ==========================================================================
	   1. MODAL PARAMETER DIALOG LAYER (SCREEN VIEW ONLY)
	   ========================================================================== */
	.modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background: rgba(15, 23, 42, 0.6) !important;
		backdrop-filter: blur(4px);
		display: flex !important;
		justify-content: center !important;
		align-items: center !important;
		z-index: 99999 !important;
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
	}

	.modal-backdrop .dialog-box {
		background: #ffffff !important;
		width: 480px !important;
		max-width: 92% !important;
		border-radius: 12px !important;
		border: 1px solid #e2e8f0 !important;
		box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1) !important;
		display: flex !important;
		flex-direction: column !important;
		overflow: hidden !important;
	}

	.modal-backdrop .dialog-header {
		display: flex !important;
		justify-content: space-between !important;
		align-items: center !important;
		padding: 16px 20px !important;
		background: #f8fafc !important;
		border-bottom: 1px solid #e2e8f0 !important;
	}

	.modal-backdrop .dialog-header h3 {
		margin: 0 !important;
		font-size: 16px !important;
		font-weight: 700 !important;
		color: #0f172a !important;
	}

	.modal-backdrop .close-x-btn {
		background: transparent !important;
		border: none !important;
		font-size: 22px !important;
		color: #94a3b8 !important;
		cursor: pointer !important;
		padding: 0 !important;
	}

	.modal-backdrop .dialog-body {
		padding: 20px !important;
		display: flex !important;
		flex-direction: column !important;
		gap: 16px !important;
		background: #ffffff !important;
	}

	.modal-backdrop .form-row-split {
		display: flex !important;
		gap: 16px !important;
	}

	.modal-backdrop .input-group {
		display: flex !important;
		flex-direction: column !important;
		gap: 6px !important;
		flex: 1 !important;
	}

	.modal-backdrop .input-group label {
		font-size: 12.5px !important;
		font-weight: 600 !important;
		color: #334155 !important;
	}

	.modal-backdrop .input-group select,
	.modal-backdrop .input-group textarea {
		padding: 10px 12px !important;
		border: 1px solid #cbd5e1 !important;
		border-radius: 6px !important;
		font-size: 14px !important;
		color: #0f172a !important;
		background-color: #ffffff !important;
		box-sizing: border-box !important;
	}

	.modal-backdrop .input-group textarea {
		resize: none !important;
		min-height: 90px !important;
		line-height: 1.5 !important;
	}

	.modal-backdrop .dialog-footer {
		padding: 14px 20px !important;
		background: #f8fafc !important;
		border-top: 1px solid #e2e8f0 !important;
		display: flex !important;
		justify-content: flex-end !important;
		gap: 12px !important;
	}

	.modal-backdrop .cancel-modal-btn {
		padding: 9px 16px !important;
		background: #ffffff !important;
		border: 1px solid #cbd5e1 !important;
		color: #475569 !important;
		font-weight: 600 !important;
		border-radius: 6px !important;
		cursor: pointer !important;
	}

	.modal-backdrop .confirm-modal-btn {
		padding: 9px 16px !important;
		background: #2563eb !important;
		border: none !important;
		color: #ffffff !important;
		font-weight: 600 !important;
		border-radius: 6px !important;
		cursor: pointer !important;
	}

	/* ==========================================================================
	   2. SCREEN WORKSPACE CONTAINER AND BACKDROP (SCREEN VIEW ONLY)
	   ========================================================================== */
	.print-window-wrapper {
		background: #576574;
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		z-index: 999999;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
	}

	.screen-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		background: #1e293b;
		padding: 12px 24px;
		color: #ffffff;
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
		position: sticky;
		top: 0;
		z-index: 1000000;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
	}

	.screen-header .bar-title {
		font-weight: 700;
		font-size: 15px;
		color: #38bdf8;
	}

	.screen-header .right-actions {
		display: flex;
		gap: 12px;
		align-items: center;
	}

	.back-btn, .print-btn, .close-gate-btn {
		padding: 8px 16px;
		border: none;
		border-radius: 4px;
		font-weight: 600;
		cursor: pointer;
		font-size: 13px;
	}
	.back-btn { background: #475569; color: #ffffff; }
	.print-btn { background: #10b981; color: #ffffff; }
	.close-gate-btn { background: #ef4444; color: #ffffff; }

	/* ==========================================================================
	   3. CRISP A4 CONTAINER (PREVENTS VERTICAL STRETCHING)
	   ========================================================================== */
	.a4-print-page {
		width: 210mm;
		height: 297mm;
		min-height: 297mm;
		max-height: 297mm;
		background: #ffffff;
		box-sizing: border-box;
		margin: 40px auto;
		padding: 20mm;
		box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
		display: flex;
		flex-direction: column;
		justify-content: flex-start; /* Keeps invoice pinned to top rather than stretching across empty space */
	}

	/* ==========================================================================
	   4. DETAILED INVOICE LAYOUT (MATCHES BATCH LAYOUT STYLE)
	   ========================================================================== */
	.invoice-card-tile {
		padding: 24px;
		width: 100%;
		box-sizing: border-box;
		background: #ffffff;
		color: #000000;
		font-family: 'Courier New', Courier, monospace;
		line-height: 1.4;
		display: flex;
		flex-direction: column;
	}

	.invoice-header {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		margin-bottom: 15px;
	}

	.company-brand h3 {
		margin: 0;
		font-size: 20px;
		font-weight: bold;
		letter-spacing: 0.5px;
	}

	.company-brand .subtitle {
		margin: 2px 0 0 0;
		font-size: 15px;
	}

	.meta-right-panel {
		display: flex;
		justify-content: center;
		margin-bottom: 15px;
	}

	.ac-pill {
		font-size: 15px;
		font-weight: bold;
	}

	.doc-title {
		margin: 10px 0;
		font-size: 15px;
		font-weight: bold;
		text-decoration: underline;
		text-align: center;
	}

	.profile-date-row {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-top: 20px;
		font-size: 14px;
	}

	.address-date-row {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 20px;
		font-size: 14px;
	}

	.customer-address-block {
		flex: 1;
		text-align: left;
		line-height: 1.3;
	}

	.name-line {
		font-size: 16px;
		font-weight: bold;
		text-transform: uppercase;
		margin-bottom: 4px;
	}

	.address-line {
		font-size: 15px;
		text-transform: uppercase;
	}

	.date-badge-box {
		text-align: right;
		font-size: 14px;
		font-weight: bold;
		line-height: 1.4;
	}

	/* --- MONOSPACE LEDGER TABLES & GRID --- */
	.accounting-summary-box {
		display: flex;
		flex-direction: column;
		margin-top: 10px;
	}

	.ledger-row {
		display: flex;
		justify-content: space-between;
		font-size: 14px;
		padding: 4px 0;
	}

	.ledger-row.brought-forward-line {
        padding: 8px 0px;
    }

	.grand-total-row {
		border-top: 2px solid #000000;
		border-bottom: 2px solid #000000;
		padding: 8px 0;
		margin-top: 20px;
		font-weight: bold;
	}

	.total-label {
		font-size: 15px;
	}

	.total-value {
		font-size: 16px;
	}

	.customer-note-footer {
		margin-top: 20px;
		padding-top: 10px;
	}

	.note-body {
		font-size: 12px;
		margin: 0;
		line-height: 1.4;
		text-align: justify;
		font-weight: bold;
	}

	/* ==========================================================================
	   5. PHYSICAL PRINTER OVERRIDES
	   ========================================================================== */
	@media print {
		@page {
			margin: 0 !important;
			size: A4 portrait;
		}

		.no-print {
			display: none !important;
		}

		body, html {
			background: #ffffff !important;
			margin: 0 !important;
			padding: 0 !important;
		}

		.print-window-wrapper {
			position: absolute !important;
			top: 0 !important;
			left: 0 !important;
			width: 210mm !important;
			height: 297mm !important;
			background: #ffffff !important;
			padding: 0 !important;
			margin: 0 !important;
		}

		.a4-print-page {
			margin: 0 !important;
			border: none !important;
			box-shadow: none !important;
			padding: 20mm !important;
			width: 210mm !important;
			height: 297mm !important;
			max-height: 297mm !important;
			box-sizing: border-box !important;
		}
	}
</style>
