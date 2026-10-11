<script>
    // Accept properties from the parent application state framework
    let { weekData, customerData, onBack, onUpdateSave } = $props();

    // Global metadata fields
    let weekCommencingDate = $state(weekData?.date || "2026-05-11");
    let deliveryCharge = $state(weekData?.deliveryCharge || 2.5);

    // Multi-line balance override adjustment text notes rows
    let notesLine1 = $state("");
    let notesLine2 = $state("");
    let notesLine3 = $state("");
    let isReadOnly = $state(false);

    // Initial matrix dataset mimicking the multiple papers rows on the paper ledger sheet
    let publications = $state(weekData?.weeklySubscriptionBreakdowns || null);

    // Initial matrix dataset mimicking the multiple vouchers rows on the voucher ledger sheet
    let vouchers = $state(
        weekData?.weeklyVoucherBreakdowns || [
            {
                voucherName: "",
                price: 0,
            },
        ],
    );

    // Calculate subtotal for an individual publication row across the week days
    function calculateRowTotal(pub) {
        const daysOfWeek = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
        return daysOfWeek.reduce((sum, day) => {
            // Only charge if the item is delivered on that day AND NOT marked as a holiday stop
            if (pub[day]) {
                return sum + pub.totalPrice;
            }
            return sum;
        }, 0);
    }

    let weeklyPaperTotal = $derived(
        publications
            .reduce((sum, m) => sum + (Number(m.totalPrice) || 0), 0)
            .toFixed(2),
    );

    let voucherTotal = $derived(
        vouchers.reduce((sum, v) => sum + (Number(v.price) || 0), 0).toFixed(2),
    );

    // Grand final total calculated due (Total Papers Cost + Delivery charge)
    let grandTotalDue = $derived(
        (
            Number(weeklyPaperTotal) +
                Number(deliveryCharge) -
                Number(voucherTotal) || 0
        ).toFixed(2),
    );

    // Net balance outstanding computation
    let outstandingBalance = $derived(
        (
            Number(grandTotalDue) - (Number(weekData.receivedAmount) || 0)
        ).toFixed(2),
    );

    // Track the currently focused row indices (-1 means no focus)
    let activePaperIndex = $state(-1);
    let activeVoucherIndex = $state(-1);

    function submitFormUpdates() {
        const updatedPayload = {
            weekDate: weekCommencingDate,
            deliveryCharge: Number(deliveryCharge),
            subscriptionBreakdowns: publications,
            totalAmount: Number(grandTotalDue || 0),
            voucherBreakdowns: vouchers,
            receivedAmount: Number(weekData.receivedAmount || 0),
            outstandingAmount: Number(outstandingBalance || 0),
            status: weekData.status,
        };
        onUpdateSave(updatedPayload);
    }

    function addPaperRow() {
        publications = [
            ...publications,
            {
                paperName: "",
                monQty: 0,
                tueQty: 0,
                wedQty: 0,
                thuQty: 0,
                friQty: 0,
                satQty: 0,
                sunQty: 0,
                totalPrice: 0,
            },
        ];
    }

    function addVoucherRow() {
        vouchers = [
            ...vouchers,
            {
                voucherName: "",
                price: 0,
            },
        ];
    }

    // Action helper function
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

    function deleteFocusedPaperRow() {
        if (publications.length > 0) {
			// Returns a copy of the array missing the last item
			publications = publications.slice(0, -1);
		}
    }

    function deleteFocusedVoucherRow() {
        if (vouchers.length > 0) {
            // Returns a copy of the array missing the last item
            vouchers = vouchers.slice(0, -1);
        }
    }
</script>

<div class="modern-breakdown-container">
    <div class="view-header-strip">
        <div class="context-meta">
            <h2>Weekly Account</h2>
            <p class="breadcrumbs">
                Account No: <span class="highlight">{customerData?.acNo}</span>
            </p>
            <p class="breadcrumbs">
                Name: <span class="highlight"
                    >{customerData?.title} {customerData?.forename} {customerData?.surname}</span>
            </p>
        </div>
        <button class="ghost-back-btn" onclick={onBack}>← Back to Ledger</button
        >
        <button type="button" class="primary-btn" onclick={submitFormUpdates}>
            Save
        </button>
    </div>

    <div class="parameter-card-row">
        <div class="input-form-group">
            <label for="date-code">Date</label>
            <input
                id="date-code"
                type="text"
                class="clean-input readonly-input"
                readonly
                bind:value={weekCommencingDate}
            />
        </div>
        <div class="input-form-group">
            <label for="delivery-fee">Delivery Charge (£)</label>
            <input
                id="delivery-fee"
                type="number"
                step="0.05"
                class="clean-input monetary"
                bind:value={deliveryCharge}
                use:noScroll
            />
        </div>
    </div>

    <section class="form-card">
        <div class="paper-schedule-container">
            <div class="section-header">
                <h3>Papers & Magazines</h3>
                <div class="button-group">
                    <button
                        type="button"
                        class="add-row-btn"
                        onclick={addPaperRow}
                        disabled={isReadOnly}>+ Add</button
                    >
                    <button
                        type="button"
                        class="delete-row-btn"
                        onclick={deleteFocusedPaperRow}
                        disabled={isReadOnly || publications.length === 0}
                    >
                        - Delete
                    </button>
                </div>
            </div>

            <div class="table-responsive">
                <table class="schedule-table">
                    <thead>
                        <tr>
                            <th class="text-left">Paper Name</th>
                            <th>SUN</th><th>MON</th><th>TUE</th><th>WED</th><th
                                >THU</th
                            ><th>FRI</th><th>SAT</th>
                            <th class="text-right">Price (£)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each publications as paper, index}
                            <tr>
                                <td class="w-name"
                                    ><input
                                        type="text"
                                        disabled={isReadOnly}
                                        bind:value={paper.paperName}
                                    /></td
                                >
                                <td class="w-day"
                                    ><input
                                        type="number"
                                        disabled={isReadOnly}
                                        bind:value={paper.sunQty}
                                        use:noScroll
                                    /></td
                                >
                                <td class="w-day"
                                    ><input
                                        type="number"
                                        disabled={isReadOnly}
                                        bind:value={paper.monQty}
                                        use:noScroll
                                    /></td
                                >
                                <td class="w-day"
                                    ><input
                                        type="number"
                                        disabled={isReadOnly}
                                        bind:value={paper.tueQty}
                                        use:noScroll
                                    /></td
                                >
                                <td class="w-day"
                                    ><input
                                        type="number"
                                        disabled={isReadOnly}
                                        bind:value={paper.wedQty}
                                        use:noScroll
                                    /></td
                                >
                                <td class="w-day"
                                    ><input
                                        type="number"
                                        disabled={isReadOnly}
                                        bind:value={paper.thuQty}
                                        use:noScroll
                                    /></td
                                >
                                <td class="w-day"
                                    ><input
                                        type="number"
                                        disabled={isReadOnly}
                                        bind:value={paper.friQty}
                                        use:noScroll
                                    /></td
                                >
                                <td class="w-day"
                                    ><input
                                        type="number"
                                        disabled={isReadOnly}
                                        bind:value={paper.satQty}
                                        use:noScroll
                                    /></td
                                >

                                <td class="w-price"
                                    ><input
                                        type="number"
                                        class="text-right"
                                        disabled={isReadOnly}
                                        bind:value={paper.totalPrice}
                                        step="0.05"
                                        use:noScroll
                                    /></td
                                >
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        </div>
    </section>

    <div class="ledger-bottom-layout">
        <section class="form-card">
            <div class="paper-schedule-container">
                <div class="section-header">
                    <h3>Vouchers</h3>
                    <div class="button-group">
                        <button
                            type="button"
                            class="add-row-btn"
                            onclick={addVoucherRow}
                            disabled={isReadOnly}>+ Add</button
                        >
                        <button
                            type="button"
                            class="delete-row-btn"
                            onclick={deleteFocusedVoucherRow}
                            disabled={isReadOnly || vouchers.length === 0}
                        >
                            - Delete
                        </button>
                    </div>
                </div>
                <div class="table-responsive">
                    <table class="schedule-table">
                        <thead>
                            <tr>
                                <th class="text-left">Voucher Name</th>
                                <th class="text-right">Price (£)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each vouchers as paper}
                                <tr>
                                    <td class="w-name"
                                        ><input
                                            type="text"
                                            disabled={isReadOnly}
                                            bind:value={paper.voucherName}
                                        /></td
                                    >
                                    <td class="w-price"
                                        ><input
                                            type="number"
                                            class="text-right"
                                            disabled={isReadOnly}
                                            bind:value={paper.price}
                                            step="0.05"
                                            use:noScroll
                                        /></td
                                    >
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>

        <div class="financials-summary-panel">
            <div class="summary-item-row">
                <span class="summary-item-label">Total Due:</span>
                <span class="summary-item-value font-monospace"
                    >£ {grandTotalDue}</span
                >
            </div>

            <div class="summary-item-row">
                <span class="summary-item-label">Received:</span>
                <span class="summary-item-value font-monospace"
                    >£ {weekData.receivedAmount?.toFixed(2) || 0.0}</span
                >
            </div>

            <div class="summary-item-row outstanding-highlight-box">
                <span class="summary-item-label font-weight-bold text-dark-blue"
                    >Outstanding:</span
                >
                <span
                    class="summary-item-value font-monospace font-weight-bold text-blue"
                    >£ {outstandingBalance}</span
                >
            </div>
        </div>
    </div>
</div>

<style>
    /* Core Component Sheet Styling Variables Context layout mapping */
    .modern-breakdown-container {
        background: #ffffff;
        color: #2c3e50;
        padding: 24px;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        border: 1px solid #e2e8f0;
    }

    .view-header-strip {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        border-bottom: 2px solid #edf2f7;
        padding-bottom: 16px;
        margin-bottom: 20px;
    }

    .view-header-strip h2 {
        margin: 0 0 4px 0;
        font-size: 20px;
        color: #1a202c;
        font-weight: 700;
    }

    .breadcrumbs {
        margin: 0;
        font-size: 14px;
        color: #718096;
    }

    .highlight {
        color: #3182ce;
        font-weight: 600;
    }

    .ghost-back-btn {
        background: transparent;
        color: #4a5568;
        border: 1px solid #cbd5e0;
        padding: 8px 16px;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
    }
    .ghost-back-btn:hover {
        background: #f7fafc;
        color: #1a202c;
        border-color: #a0aec0;
    }

    /* Top Meta Form Parameters */
    .parameter-card-row {
        display: flex;
        gap: 24px;
        background: #f7fafc;
        padding: 16px;
        border-radius: 8px;
        margin-bottom: 24px;
        border: 1px solid #edf2f7;
    }

    .input-form-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .input-form-group label {
        font-size: 12px;
        font-weight: 700;
        color: #4a5568;
        letter-spacing: 0.5px;
    }

    .clean-input {
        background: #ffffff;
        border: 1px solid #cbd5e0;
        border-radius: 6px;
        padding: 8px 12px;
        font-size: 14px;
        color: #2d3748;
        width: 200px;
        outline: none;
        transition: border-color 0.15s;
    }
    .clean-input:focus {
        border-color: #3182ce;
        box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.15);
    }

    .clean-input.monetary {
        font-family: monospace;
        font-weight: bold;
        color: #2f855a;
    }

    .readonly-input {
        background-color: #f1f3f5;
        font-weight: 500;
    }

    .text-right {
        text-align: right;
    }

    label {
        font-size: 13px;
        font-weight: 600;
        color: #495057;
    }

    input {
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

    input:focus {
        outline: none;
        border-color: #a5d8ff;
    }

    input:disabled {
        background-color: #e9ecef;
        color: #495057;
        opacity: 0.9;
        cursor: not-allowed;
    }

    .table-responsive {
        overflow-x: auto;
        border: 1px solid #dee2e6;
        border-radius: 6px;
    }

    .schedule-table {
        width: 100%;
        border-collapse: collapse;
        background: white;
    }

    .schedule-table th {
        font-size: 12px;
        background: #f8f9fa;
        padding: 12px 10px;
        font-weight: 700;
        color: #495057;
        border-bottom: 2px solid #dee2e6;
        text-align: center;
    }

    .schedule-table td {
        padding: 8px;
        border-bottom: 1px solid #dee2e6;
    }

    .schedule-table input {
        padding: 8px;
        text-align: center;
        border-radius: 4px;
        height: 34px;
    }

    .schedule-table .w-name input {
        text-align: left;
    }
    .schedule-table th.text-left {
        text-align: left;
    }
    .schedule-table th.text-right {
        text-align: right;
    }

    .w-name {
        width: 35%;
    }
    .w-day {
        width: 7%;
    }
    .w-price {
        width: 16%;
    }

    .text-right {
        text-align: right;
    }

    .primary-btn {
        padding: 10px 20px;
        border: none;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        font-size: 14px;
        transition: background 0.2s ease;
        background: #2ecc71;
        color: white;
    }

    /* Side-by-Side Horizontal Dashboard Footer Structural Alignment Styles */
    .ledger-bottom-layout {
        display: grid;
        grid-template-columns: 1fr 340px;
        gap: 24px;
        align-items: start;
        margin-top: 20px;
    }

    .financials-summary-panel {
        background: #f8f9fa;
        border: 1px solid #ced4da;
        border-radius: 6px;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .summary-item-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 4px;
        border-bottom: 1px solid #e9ecef;
    }

    .summary-item-label {
        font-size: 14px;
        font-weight: 600;
        color: #495057;
    }

    .summary-item-value {
        font-size: 15px;
        font-weight: 700;
        color: #212529;
    }

    .text-dark-blue {
        color: #0a58ca;
        text-transform: uppercase;
        font-size: 12px;
        letter-spacing: 0.5px;
    }
    .text-blue {
        color: #0d6efd;
        font-size: 18px;
    }

    .outstanding-highlight-box {
        background: #eaf2ff;
        border: 1px solid #b6d4fe;
        padding: 8px 12px;
        border-radius: 4px;
        margin-top: 4px;
    }

    .form-card {
        background: white;
        padding: 24px;
        border-radius: 8px;
        box-shadow:
            0 1px 3px rgba(0, 0, 0, 0.05),
            0 1px 2px rgba(0, 0, 0, 0.1);
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

    /* Target WebKit browsers (Chrome, Safari, Edge, Opera) */
    input[type="number"]::-webkit-inner-spin-button,
    input[type="number"]::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }

    /* Target Mozilla Firefox */
    input[type="number"] {
        -moz-appearance: textfield;
    }

    /* Highlights the row containing the active cursor */
    .schedule-table tr:focus-within {
        background-color: #fffaf0; /* Light amber/yellow tint */
    }

    .section-header {
        display: flex;
        justify-content: space-between; /* Pushes H3 to left, button groups to right */
        align-items: center;
        margin-bottom: 16px;
        border-bottom: 1px solid #dee2e6;
        padding-bottom: 10px;
    }

    /* Resets any underlying header element line properties */
    .section-header h3 {
        margin: 0;
        border-bottom: none;
        padding-bottom: 0;
    }

    /* Keeps action sets pinned side-by-side cleanly */
    .button-group {
        display: flex;
        gap: 8px;
    }

    .add-row-btn {
        background: #232b30;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        font-size: 13px;
        transition: background 0.2s ease;
    }
    .add-row-btn:hover:not(:disabled) {
        background: #343a40;
    }

    /* Red destructive style context */
    .delete-row-btn {
        background: #e74c3c;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        font-size: 13px;
        transition: background 0.2s ease;
    }
    .delete-row-btn:hover:not(:disabled) {
        background: #c0392b;
    }

    /* Standardized disabled rule matches across components */
    .add-row-btn:disabled,
    .delete-row-btn:disabled {
        background: #e9ecef;
        color: #adb5bd;
        cursor: not-allowed;
        opacity: 0.7;
    }
</style>
