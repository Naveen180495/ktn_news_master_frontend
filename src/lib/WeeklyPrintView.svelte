<script>
    // Svelte 5 Runes for attributes passed down from +page.svelte
    let { billingData = [], selectedDate = "", onBack = () => {} } = $props();

    // Format date nicely if available (e.g., from "2026-06-06" to "06/06/2026")
    function formatDate(dateStr) {
        if (!dateStr) return "";
        const [year, month, day] = dateStr.split("-");
        return `${day}/${month}/${year}`;
    }

    function addSevenDays(inputDate) {
        if (!inputDate) return "";
        const date = new Date(inputDate);
        if (isNaN(date.getTime())) return "";

        date.setDate(date.getDate() + 7);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${day}/${month}/${year}`;
    }

    let activeCount = $derived(billingData.length);

    // Dynamic Row Pagination Chunking (Fits 27 rows cleanly onto an A4 sheet grid)
    const ROWS_PER_PAGE = 27;
    let paginatedPages = $derived.by(() => {
        let pages = [];
        for (let i = 0; i < billingData.length; i += ROWS_PER_PAGE) {
            pages.push(billingData.slice(i, i + ROWS_PER_PAGE));
        }
        return pages;
    });

    function triggerNativePrint() {
        window.print();
    }
</script>

<div class="print-utility-bar no-print">
    <button onclick={onBack} class="utility-btn secondary-btn">
        ← Back to Menu
    </button>
    <button onclick={triggerNativePrint} class="utility-btn primary-btn">
        🖨️ Print Bill
    </button>
</div>

<div class="ledger-print-wrapper">
    {#each paginatedPages as pageRows, pageIndex}
        <div class="a4-page-sheet" class:last-printed-page={pageIndex === paginatedPages.length - 1}>
            <div class="page-content-inner">
                <header class="ledger-header-metadata">
                    <div class="meta-row-top">
                        <span class="doc-title">PAYMENTS DUE - ALL ACCOUNTS</span>
                        <span class="doc-page-counter">Page &nbsp;{pageIndex + 1}</span>
                    </div>
                    <hr class="header-divider" />
                    <div class="meta-row-bottom">
                        <span class="date-range">
                            Payments due &nbsp;: &nbsp; up to Saturday {addSevenDays(selectedDate)}
                        </span>
                        <span class="selection-count">
                            Selected &nbsp;: &nbsp; {activeCount}
                        </span>
                    </div>
                    <hr class="header-divider thick" />
                </header>

                <table class="ledger-matrix-table">
                    <thead>
                        <tr class="table-column-headers">
                            <th class="col-address text-left">Address</th>
                            <th class="col-acno text-center">A/c No</th>
                            <th class="col-name text-left">Customer Name</th>
                            <th class="col-weeks text-right">Weeks<br />owed</th>
                            <th class="col-money text-center">Up to:<br />{formatDate(selectedDate).substring(0, 5)}</th>
                            <th class="col-money text-center">Up to:<br />{addSevenDays(selectedDate).substring(0, 5)}</th>
                            <th class="col-received text-left">Received</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each pageRows as row}
                            <tr>
                                <td class="col-address-data text-uppercase">{row.address || "NO ADDRESS"}</td>
                                <td class="col-acno-data text-center">{row.acNo}</td>
                                <td class="col-name-data text-uppercase">
                                    {`${row.title || ""} ${row.forename || ""} ${row.surname || ""}`.trim()}
                                </td>
                                <td class="col-weeks-data text-right">{row.weeksOwed ?? "0"}</td>
                                <td class="col-money-data text-center">{(row.balanceUpToSelectedWeek || 0).toFixed(2)}</td>
                                <td class="col-money-data text-center">{(row.balanceUpToNextWeek || 0).toFixed(2)}</td>
                                <td class="col-received-data">
                                    <div class="writing-line"></div>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>

            <footer class="ledger-footer-container">
                <hr class="footer-divider-line" />
                <div class="footer-bottom-row">
                    {#if pageIndex < paginatedPages.length - 1}
                        <div class="footer-continuation">continued...</div>
                    {:else}
                        <div class="footer-continuation-empty">&nbsp;</div>
                    {/if}
                </div>
            </footer>
        </div>
    {/each}
</div>

<style>
    /* Interactive Browser Toolbar Styles */
    .print-utility-bar {
        display: flex;
        justify-content: space-between;
        padding: 14px 24px;
        background-color: #ffffff;
        border-bottom: 1px solid #e2e8f0;
        margin-bottom: 20px;
    }

    .utility-btn {
        padding: 10px 18px;
        font-size: 13.5px;
        font-weight: 600;
        border-radius: 6px;
        cursor: pointer;
    }

    .secondary-btn {
        background: #64748b;
        border: 1px solid #cbd5e1;
        color: #f9f9fa;
    }

    .primary-btn {
        background: #2563eb;
        color: #ffffff;
        border: none;
    }

    /* --- SCREEN AND PAPER SYNCED VIEWPORT CONFIGURATIONS --- */
    .ledger-print-wrapper {
        background-color: #f1f5f9; 
        padding: 20px 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 30px; 
    }

    /* Standard A4 Physical Model Canvas bounding dimensions layout */
    .a4-page-sheet {
        background: #ffffff;
        width: 210mm;
        min-height: 297mm;
        box-sizing: border-box;
        padding: 20mm 15mm;
        display: flex;
        flex-direction: column;
        justify-content: space-between; 
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08); 
        font-family: "Courier New", Courier, monospace;
        color: #000000;
        line-height: 1.4;
    }

    .page-content-inner {
        display: flex;
        flex-direction: column;
        width: 100%;
    }

    .ledger-header-metadata {
        width: 100%;
        margin-bottom: 10px;
    }

    .meta-row-top,
    .meta-row-bottom {
        display: flex;
        justify-content: space-between;
        font-size: 14px;
    }

    .doc-title {
        font-weight: bold;
    }

    .header-divider {
        border: none;
        border-top: 1px solid #000000;
        margin: 12px 0;
    }

    .header-divider.thick {
        border-top: 1px solid #000000;
        margin-top: 8px;
        margin-bottom: 0px;
    }

    .ledger-matrix-table {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
    }

    .ledger-matrix-table th {
        font-weight: bold;
        padding: 6px 4px;
        vertical-align: bottom;
        font-size: 14px;
    }

    .ledger-matrix-table td {
        padding: 6px 4px;
        vertical-align: middle;
        overflow: hidden;
        white-space: nowrap;
        font-size: 13px;
    }

    .text-left { text-align: left; }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .text-uppercase { text-transform: uppercase; }
    .font-bold { font-weight: bold; }

    /* Exact Column Balancing Ratios */
    .col-address, .col-address-data { width: 28%; }
    .col-acno, .col-acno-data { width: 10%; }
    .col-name, .col-name-data { width: 26%; }
    .col-weeks, .col-weeks-data { width: 10%; }
    .col-money, .col-money-data { width: 11%; }
    .col-received, .col-received-data { width: 15%; }

    .writing-line {
        width: 100%;
        border-bottom: 1px solid #666666;
        height: 16px;
    }

    /* --- FOOTER SEPARATOR STRUCTURE LAYOUT --- */
    .ledger-footer-container {
        width: 100%;
        margin-top: auto; 
        padding-top: 15px;
    }

    .footer-divider-line {
        border: none;
        border-top: 1px solid #000000;
        margin: 0 0 8px 0;
        width: 100%;
    }

    .footer-bottom-row {
        display: flex;
        justify-content: flex-end;
        width: 100%;
    }

    .footer-continuation {
        font-weight: bold;
        font-size: 14px;
    }

    .footer-continuation-empty {
        font-size: 14px;
    }

    /* --- NATIVE PRINTER ENGINE DRIVER OVERRIDES --- */
    @media print {
        .no-print {
            display: none !important;
        }

        @page {
            size: A4 portrait;
            margin: 0mm;
        }

        :global(body) {
            background: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
        }

        .ledger-print-wrapper {
            background: none !important;
            padding: 0 !important;
            gap: 0 !important;
            /* Prevents trailing node wrapper leaks */
            break-inside: avoid;
            page-break-inside: avoid;
        }

        .a4-page-sheet {
            box-shadow: none !important;
            margin: 0 auto !important;
            page-break-after: always;
            break-after: page;
            height: 297mm !important; /* Locks layout context securely to sheet bounds */
            box-sizing: border-box !important;
        }

        /* Target conditional flag that catches the final page block array wrapper element */
        .a4-page-sheet.last-printed-page {
            page-break-after: auto !important;
            break-after: auto !important;
        }
    }
</style>