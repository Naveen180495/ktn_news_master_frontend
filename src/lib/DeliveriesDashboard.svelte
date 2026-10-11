<script>
    let { onOpenWeekly, onOpenMonthly, onOpenDeliveryNote } = $props();

    let showMonthlyBillingDialog = $state(false);
    let showWeeklyBillingDialog = $state(false);
    let showDeliveryNoteDialog = $state(false);

    // Calendar parameters
    const currentYear = new Date().getFullYear();
    const currentMonthNumber = new Date().getMonth() + 1;
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

    let selectedYear = $state(currentYear);
    let selectedMonth = $state(currentMonthNumber);
    let selectedWeekDate = $state(null);
    let deliveryNoteDate = $state(new Date().toISOString().split("T")[0]); // Default to today
    let customNoteText = $state("");

    let availableMonths = $derived(
        selectedYear === currentYear
            ? allMonths.filter((m) => m.value <= currentMonthNumber)
            : allMonths,
    );

    function handleMonthlySubmit() {
        showMonthlyBillingDialog = false;
        onOpenMonthly({
            year: selectedYear,
            month: selectedMonth,
            note: customNoteText,
        });
    }

    function handleWeeklySubmit() {
        showWeeklyBillingDialog = false;
        onOpenWeekly({ weekDate: selectedWeekDate });
    }

    function handleDeliveryNoteSubmit() {
        showDeliveryNoteDialog = false;
        onOpenDeliveryNote({ date: deliveryNoteDate });
    }
</script>

<div class="deliveries-menu-container">
    <h2>Deliveries & Statements Dashboard</h2>
    <p class="section-subtitle">
        Select statement interval type or print daily round delivery summaries.
    </p>

    <div class="billing-options-grid">
        <button
            class="billing-card-btn highlight"
            onclick={() => (showWeeklyBillingDialog = true)}
        >
            <div class="card-icon">📅</div>
            <h3>Weekly Bill</h3>
            <p>
                Prepare active 7-day balance registers for round orders
                distribution.
            </p>
        </button>

        <button
            class="billing-card-btn highlight"
            onclick={() => (showMonthlyBillingDialog = true)}
        >
            <div class="card-icon">📊</div>
            <h3>Monthly Bill</h3>
            <p>
                Generate high-fidelity consolidated logs spanning complete days
                of active fiscal month.
            </p>
        </button>

        <button
            class="billing-card-btn highlight"
            onclick={() => (showDeliveryNoteDialog = true)}
        >
            <div class="card-icon">🚚</div>
            <h3>Delivery Note</h3>
            <p>
                Generate daily delivery summary breakdown, round distribution,
                and shop save orders.
            </p>
        </button>
    </div>
</div>

<!-- WEEKLY DIALOG -->
{#if showWeeklyBillingDialog}
    <div class="modal-backdrop">
        <div class="dialog-box">
            <div class="dialog-header">
                <h3>Generate Weekly Statements</h3>
                <button
                    class="close-x-btn"
                    onclick={() => (showWeeklyBillingDialog = false)}
                    >&times;</button
                >
            </div>
            <div class="dialog-body">
                <div class="form-row-split">
                    <div class="input-group">
                        <label for="bill-week">Target Billing Week</label>
                        <input
                            id="bill-week"
                            type="date"
                            bind:value={selectedWeekDate}
                        />
                    </div>
                </div>
            </div>
            <div class="dialog-footer">
                <button
                    class="cancel-modal-btn"
                    onclick={() => (showWeeklyBillingDialog = false)}
                    >Cancel</button
                >
                <button class="confirm-modal-btn" onclick={handleWeeklySubmit}
                    >Generate Bills</button
                >
            </div>
        </div>
    </div>
{/if}

<!-- MONTHLY DIALOG -->
{#if showMonthlyBillingDialog}
    <div class="modal-backdrop">
        <div class="dialog-box">
            <div class="dialog-header">
                <h3>Generate Monthly Statements</h3>
                <button
                    class="close-x-btn"
                    onclick={() => (showMonthlyBillingDialog = false)}
                    >&times;</button
                >
            </div>
            <div class="dialog-body">
                <div class="form-row-split">
                    <div class="input-group">
                        <label for="bill-year">Target Billing Year</label>
                        <select id="bill-year" bind:value={selectedYear}>
                            {#each dynamicYears as year}
                                <option value={year}>{year}</option>
                            {/each}
                        </select>
                    </div>
                    <div class="input-group">
                        <label for="bill-month">Target Billing Month</label>
                        <select id="bill-month" bind:value={selectedMonth}>
                            {#each availableMonths as month}
                                <option value={month.value}>{month.name}</option
                                >
                            {/each}
                        </select>
                    </div>
                </div>
                <div class="input-group full-width">
                    <label for="bill-notes">Disclaimer Note Message</label>
                    <textarea
                        id="bill-notes"
                        rows="3"
                        bind:value={customNoteText}
                    ></textarea>
                </div>
            </div>
            <div class="dialog-footer">
                <button
                    class="cancel-modal-btn"
                    onclick={() => (showMonthlyBillingDialog = false)}
                    >Cancel</button
                >
                <button class="confirm-modal-btn" onclick={handleMonthlySubmit}
                    >Generate Bills</button
                >
            </div>
        </div>
    </div>
{/if}

<!-- DELIVERY NOTE DIALOG -->
{#if showDeliveryNoteDialog}
    <div class="modal-backdrop">
        <div class="dialog-box">
            <div class="dialog-header">
                <h3>Generate Delivery Note</h3>
                <button
                    class="close-x-btn"
                    onclick={() => (showDeliveryNoteDialog = false)}
                    >&times;</button
                >
            </div>
            <div class="dialog-body">
                <div class="form-row-split">
                    <div class="input-group">
                        <label for="delivery-date">Select Delivery Date</label>
                        <input
                            id="delivery-date"
                            type="date"
                            bind:value={deliveryNoteDate}
                        />
                    </div>
                </div>
            </div>
            <div class="dialog-footer">
                <button
                    class="cancel-modal-btn"
                    onclick={() => (showDeliveryNoteDialog = false)}
                    >Cancel</button
                >
                <button
                    class="confirm-modal-btn"
                    onclick={handleDeliveryNoteSubmit}>Generate Sheet</button
                >
            </div>
        </div>
    </div>
{/if}

<style>
    .deliveries-menu-container {
        background: white;
        border-radius: 10px;
        padding: 35px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04);
    }
    .deliveries-menu-container h2 {
        margin: 0 0 5px 0;
        font-size: 24px;
        color: #1e293b;
    }
    .section-subtitle {
        color: #64748b;
        margin: 0 0 30px 0;
        font-size: 14px;
    }
    .billing-options-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 24px;
    }
    .billing-card-btn {
        background: #f8fafc;
        border: 2px solid #e2e8f0;
        border-radius: 8px;
        padding: 25px;
        text-align: left;
        cursor: pointer;
        transition: all 0.2s ease-in-out;
    }
    .billing-card-btn:hover {
        transform: translateY(-2px);
        border-color: #cbd5e1;
        background: #f1f5f9;
    }
    .billing-card-btn.highlight {
        border-color: #bae6fd;
        background: #f0f9ff;
    }
    .billing-card-btn.highlight:hover {
        background: #e0f2fe;
        border-color: #7dd3fc;
    }
    .card-icon {
        font-size: 32px;
        margin-bottom: 12px;
    }
    .billing-card-btn h3 {
        margin: 0 0 8px 0;
        font-size: 18px;
        color: #0f172a;
    }
    .billing-card-btn p {
        margin: 0;
        font-size: 13px;
        color: #64748b;
        line-height: 1.5;
    }

    .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(15, 23, 42, 0.65);
        backdrop-filter: blur(4px);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 99999;
    }
    .dialog-box {
        background: #ffffff;
        width: 480px;
        max-width: 92%;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15);
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }
    .dialog-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 14px 20px;
        background: #f8fafc;
        border-bottom: 1px solid #edf2f7;
    }
    .dialog-header h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 700;
        color: #0f172a;
    }
    .close-x-btn {
        background: transparent;
        border: none;
        font-size: 24px;
        color: #94a3b8;
        cursor: pointer;
    }
    .dialog-body {
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 16px;
    }
    .form-row-split {
        display: flex;
        gap: 16px;
        width: 100%;
    }
    .input-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
        flex: 1;
    }
    .input-group.full-width {
        width: 100%;
    }
    .input-group label {
        font-size: 12.5px;
        font-weight: 600;
        color: #475569;
    }
    .input-group select,
    .input-group textarea,
    .input-group input[type="date"] {
        padding: 10px 12px;
        border: 1px solid #cbd5e1;
        border-radius: 6px;
        font-size: 14px;
        color: #1e293b;
        background-color: #ffffff;
        width: 100%;
        box-sizing: border-box;
    }
    .dialog-footer {
        padding: 14px 20px;
        background: #f8fafc;
        border-top: 1px solid #edf2f7;
        display: flex;
        justify-content: flex-end;
        gap: 12px;
    }
    .cancel-modal-btn {
        padding: 9px 16px;
        background: #ffffff;
        border: 1px solid #cbd5e1;
        color: #475569;
        font-weight: 600;
        border-radius: 6px;
        cursor: pointer;
    }
    .confirm-modal-btn {
        padding: 9px 16px;
        background: #2563eb;
        border: none;
        color: #ffffff;
        font-weight: 600;
        border-radius: 6px;
        cursor: pointer;
    }
</style>
