<script>
    // Define the component properties (Props) using Svelte 5 syntax
    let { paymentHistoryList = [], selectedCustomer = null, onBack } = $props();
</script>

<div class="history-page-container">
    <div class="ledger-header">
        <h2>Payment History Log</h2>
        <button class="back-btn" onclick={onBack}>← Return to Ledger</button>
    </div>

    <div class="info-section">
        <div class="customer-meta-left">
            <span class="meta-label"
                >Account Code: <strong class="meta-highlight"
                    >{selectedCustomer?.acNo || "N/A"}</strong
                ></span
            >
            <span class="meta-label"
                >Customer Name: <strong class="meta-highlight"
                    >{selectedCustomer?.title || ""}
                    {selectedCustomer?.forename || ""}
                    {selectedCustomer?.surname || ""}</strong
                ></span
            >
        </div>
    </div>

    <div class="history-table-wrapper">
        <table class="history-log-table">
            <thead>
                <tr>
                    <th>Payment Date</th>
                    <th>Payment Time</th>
                    <th>Amount Paid</th>
                </tr>
            </thead>
            <tbody>
                {#each paymentHistoryList as payment (payment.id)}
                    <tr>
                        <td
                            >{new Date(
                                payment.paymentDateTime,
                            ).toLocaleDateString()}</td
                        >
                        <td
                            >{new Date(
                                payment.paymentDateTime,
                            ).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                            })}</td
                        >
                        <td class="text-green-cell"
                            >£{payment.amountPaid.toFixed(2)}</td
                        >
                    </tr>
                {:else}
                    <tr>
                        <td colspan="3" class="empty-history-notice">
                            No verified physical history logs recorded for this
                            calendar customer profile.
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
</div>

<style>
    .history-page-container {
        background: #1e272e;
        color: #fff;
        padding: 24px;
        border-radius: 8px;
    }

    .ledger-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #3d4e5d;
        padding-bottom: 10px;
        margin-bottom: 25px;
        gap: 12px;
    }

    .back-btn {
        padding: 10px 20px;
        border: none;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        font-size: 14px;
        background: #34495e;
        color: white;
        transition: background 0.2s ease;
    }
    .back-btn:hover {
        background: #2c3e50;
    }

    .info-section {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: #2c3e50;
        padding: 16px 24px;
        border-radius: 6px;
        margin-bottom: 20px;
    }

    .customer-meta-left {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .meta-label {
        font-size: 14px;
        color: #95a5a6;
    }

    .meta-highlight {
        color: #ffffff;
        font-weight: 600;
        margin-left: 4px;
    }

    .history-table-wrapper {
        background: #2c3e50;
        border-radius: 6px;
        padding: 15px;
        margin-top: 20px;
        border: 1px solid #34495e;
    }

    .history-log-table {
        width: 100%;
        border-collapse: collapse;
        color: #fff;
    }

    .history-log-table th {
        background: #1e272e;
        text-align: left;
        padding: 12px;
        font-size: 13px;
        text-transform: uppercase;
        color: #95a5a6;
        border-bottom: 2px solid #34495e;
    }

    .history-log-table td {
        padding: 12px;
        border-bottom: 1px solid #34495e;
        font-size: 14px;
    }

    .text-green-cell {
        color: #2ecc71;
        font-weight: bold;
    }

    .empty-history-notice {
        text-align: center;
        color: #bdc3c7;
        padding: 30px !important;
        font-style: italic;
    }
</style>
