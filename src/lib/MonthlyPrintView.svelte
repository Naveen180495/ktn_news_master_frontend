<script>
    let { customersInvoiceList = [], onBack } = $props();

    const todayDate = new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });

    function getFullName(c) {
        return `${c.title || ""} ${c.forename || ""} ${c.surname || ""}`.trim();
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

    // CHUNK CONTEXT HELPER: Splits your customer array into groups of exactly 4
    function chunkArray(array, size) {
        let result = [];
        for (let i = 0; i < array.length; i += size) {
            result.push(array.slice(i, i + size));
        }
        return result;
    }

    // This creates an array of arrays: [[4 customers], [4 customers], ...]
    let invoicePages = $derived(chunkArray(customersInvoiceList, 4));
</script>

<div class="no-print screen-header">
    <button class="back-btn" onclick={onBack}>← Back to Menu</button>
    <button class="print-btn" onclick={() => window.print()}
        >🖨️ Print Bill</button
    >
</div>

<div class="print-window-wrapper">
    {#each invoicePages as pageGroup}
        <div class="a4-print-page">
            {#each pageGroup as bill}
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
                                Account: <strong>{bill.acNo}</strong>
                            </div>
                        </div>
                        <div class="date-badge-box">
                            <span class="date-label">Date:</span>
                            <span class="date-value">{todayDate}</span>
                        </div>
                    </div>
                    <div class="address-date-row">
                        <div class="customer-address-block">
                            <h4 class="name-line">{getFullName(bill)}</h4>
                            {#if bill.address}<div class="address-line">
                                    {bill.address}
                                </div>{/if}
                        </div>
                    </div>

                    <div class="accounting-summary-box">
                        <div class="ledger-row brought-forward-line">
                            <span class="ledger-label"
                                >Balance brought forward</span
                            >
                            <span class="ledger-value"
                                >{(bill.balanceBroughtForward || 0).toFixed(
                                    2,
                                )}</span
                            >
                        </div>

                        <div class="weeks-scroller-area">
                            {#each bill.weeks || [] as week}
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
                            <span class="total-label">TOTAL AMOUNT NOW DUE</span
                            >
                            <span class="total-value"
                                >£ {(bill.totalAmountDue || 0).toFixed(2)}</span
                            >
                        </div>
                    </div>

                    <div class="customer-note-footer">
                        <p class="note-body">
                            {bill.customNote}
                        </p>
                    </div>
                </div>
            {/each}
        </div>
    {/each}
</div>

<style>
    /* === SCREEN ENVIRONMENT NAVIGATION HEADER === */
    .screen-header {
        display: flex;
        justify-content: space-between;
        background-color: #ffffff;
        padding: 12px 24px;
        border-radius: 6px;
        font-family: sans-serif;
    }
    .back-btn,
    .print-btn {
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        font-weight: 600;
        cursor: pointer;
        font-size: 13px;
    }
    .back-btn {
        background: #64748b;
        color: white;
    }
    .print-btn {
        background: #2563eb;
        color: white;
    }

    .print-window-wrapper {
        background: #f1f5f9;
        padding: 20px 0;
        min-height: 100vh;
        box-sizing: border-box;
    }

    /* === FIXED A4 CONTAINER (4 CUSTOMERS PER SHEET) === */
    .a4-print-page {
        width: 210mm;
        height: 297mm;
        max-height: 297mm;
        display: grid;
        grid-template-columns: 1fr 1fr; /* 2 Columns */
        grid-template-rows: 1fr 1fr; /* 2 Rows */
        gap: 10mm;
        padding: 5mm;
        background: #ffffff;
        box-sizing: border-box;
        margin: 0 auto 5mm auto; /* Spacing between different pages on screen view */
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
        page-break-inside: avoid;
        break-inside: avoid;
    }

    .a4-print-page:not(:last-child) {
        page-break-after: always;
        break-after: page;
    }

    /* === INDIVIDUAL BILL DESIGN CARD === */
    .invoice-card-tile {
        border: 1px dashed #aaaaaa;
        padding: 16px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        box-sizing: border-box;
        overflow: hidden;
        background: #ffffff;
        color: #000000;
        font-family: "Courier New", Courier, monospace;
        line-height: 1.4;
    }

    /* UPDATED: Stacks company info and account pill neatly in the center */
    .invoice-header {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        border-bottom: 1px dashed #000000;
        padding-bottom: 6px;
        position: relative;
    }

    /* UPDATED: Centers company info titles */
    .company-brand {
        text-align: center;
        width: 100%;
    }
    .company-brand h3 {
        margin: 0;
        font-size: 16.5px;
        font-weight: bold;
        letter-spacing: 0.5px;
    }
    .company-brand .subtitle {
        margin: 2px 0 0 0;
        font-size: 12px;
        color: #000000;
    }

    .doc-title {
        margin: 8px 0 4px 0;
        font-size: 13.5px;
        font-weight: bold;
        text-decoration: underline;
    }

    .ac-pill {
        font-size: 13px;
    }

    .profile-date-row {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin: 14px 0 6px 0;
        font-size: 13px;
    }

    .address-date-row {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin: 0px 0 6px 0;
        font-size: 13px;
    }
    .customer-address-block {
        flex: 1;
        text-align: left;
    }
    .name-line {
        margin: 0 0 2px 0;
        font-size: 14px;
        font-weight: bold;
        text-transform: uppercase;
    }
    .address-line {
        font-size: 13px;
        font-weight: bold;
        text-transform: uppercase;
    }
    .date-badge-box {
        text-align: right;
        font-size: 13px;
        white-space: nowrap;
        font-weight: bold;
    }

    .accounting-summary-box {
        display: flex;
        flex-direction: column;
        flex: 1;
        margin: 25px 0;
    }
    .ledger-row {
        display: flex;
        justify-content: space-between;
        font-size: 13px;
        padding: 2px 0;
    }

    .ledger-row.brought-forward-line {
        padding: 8px 0px;
    }

    .weeks-scroller-area {
        display: flex;
        flex-direction: column;
        margin: 4px 0;
        flex: 1;
    }

    .grand-total-row {
        border-top: 1.5px solid #000000;
        border-bottom: 1.5px solid #000000;
        padding: 5px 0;
        font-weight: bold;
    }
    .total-label {
        font-size: 13px;
        font-weight: bold;
    }
    .total-value {
        font-size: 14px;
        font-weight: bold;
    }

    .customer-note-footer {
        margin-top: 8px;
    }
    .note-body {
        font-size: 11px;
        margin: 0;
        line-height: 1.3;
        text-align: justify;
    }

    /* === HARDWARE PRINTER CONSTRAINTS === */
    @media print {
        @page {
            margin: 0 !important;
        }
        .no-print {
            display: none !important;
        }
        .print-window-wrapper {
            background: transparent !important;
            padding: 0 !important;
        }
        body,
        html {
            background: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
            height: 100vh !important;
        }
        .a4-print-page {
            margin: 0 auto !important;
            border: none !important;
            box-shadow: none !important;

            /* Keep adjustments matched perfectly in physical print outputs */
            padding: 5mm !important;
            gap: 10mm !important;

            width: 210mm !important;
            height: 297mm !important;
            max-height: 297mm !important;
            box-sizing: border-box !important;
            page-break-inside: avoid !important;
        }
    }
</style>
