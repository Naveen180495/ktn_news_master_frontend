<script>
    // Receive props (supporting both standard props & Svelte 5)
    let {
        data = { summary: [], rounds: [], shopSave: [] },
        selectedDate = new Date().toISOString().split("T")[0],
        priceMap = {},
        onBack = () => history.back(),
    } = $props();

    // Safely extract arrays with fallbacks
    let summary = $derived(data?.summary || []);
    let rounds = $derived(data?.rounds || []);
    let shopSave = $derived(data?.shopSave || []);

    // Format date string (e.g., "MONDAY 09/03/2026")
    let formattedDate = $derived(
        (() => {
            if (!selectedDate) return "";
            const d = new Date(selectedDate);
            const dayName = d
                .toLocaleDateString("en-GB", { weekday: "long" })
                .toUpperCase();
            const dateStr = d.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            });
            return `${dayName} ${dateStr}`;
        })(),
    );

    // 1. Calculations for Paper Summary Page with Defensive Fallbacks
    let totalDeliveriesSum = $derived(
        summary.reduce((acc, curr) => acc + (curr.deliveryQty || 0), 0),
    );
    let totalShopSaveSum = $derived(
        summary.reduce((acc, curr) => acc + (curr.shopSaveQty || 0), 0),
    );
    let totalPapersSum = $derived(
        summary.reduce((acc, curr) => acc + (curr.totalQty || 0), 0),
    );

    // Calculate price totals safely
    let summaryWithPrices = $derived(
        summary.map((item) => {
            const paperName = (item.paper || "").toUpperCase();
            const unitPrice = priceMap[paperName] || 0.0;
            const lineTotal = unitPrice * (item.totalQty || 0);
            return { ...item, unitPrice, lineTotal };
        }),
    );

    // Helper: Group by Street (Strips door/house number to group common streets)
    function groupByStreet(items = []) {
        const groups = {};
        items.forEach((item) => {
            let addressStr = (item.address || "").trim().toUpperCase();

            // Remove "FLAT X" or "FLAT X, Y" or leading door numbers to isolate the street name
            // E.g., "FLAT 2, 150 DOBBIN HILL" -> "DOBBIN HILL"
            // E.g., "FLAT A 12 MAIN STREET" -> "MAIN STREET"
            let streetName = addressStr
                .replace(/^(FLAT|APT|APARTMENT)\s+[\w\d\-\/]+[\s,]+/i, "") // Removes Flat/Apt prefix
                .replace(/^(FLAT|APT|APARTMENT)\s+\d+[\s,]+/i, "")
                .replace(/^\d+[A-Za-z]?\s+/, "") // Removes leading house number
                .trim();

            if (!streetName) streetName = addressStr;

            if (!groups[streetName]) {
                groups[streetName] = [];
            }
            groups[streetName].push(item);
        });
        return groups;
    }

    // Helper: Extract Flat and/or Door number from address
    function getDoorNo(address = "") {
        const cleanAddress = (address || "").trim().toUpperCase();

        // Check if the address starts with a Flat definition
        // E.g., "FLAT 2, 150 DOBBIN HILL" -> captures "FLAT 2, 150" or "FLAT 2 150"
        const flatMatch = cleanAddress.match(
            /^(FLAT|APT|APARTMENT)\s+[\w\d\-\/]+([\s,]+\d+[A-Za-z]?)?/i,
        );
        if (flatMatch) {
            return flatMatch[0].replace(/,/g, "").trim();
        }

        // Default fallback: Extract standard door number (e.g., "150 DOBBIN HILL" -> "150")
        const match = cleanAddress.match(/^(\d+[A-Za-z]?)/);
        return match ? match[1] : cleanAddress;
    }

    // Helper: Format paper list per customer
    function formatPaperList(items = []) {
        return items
            .map((i) => {
                let paperName = (i.paper || "").toUpperCase();
                return i.quantity > 1
                    ? `${i.quantity} ${paperName}`
                    : paperName;
            })
            .join(", ");
    }

    // Helper: Group items by customer for Shop Save view
    function groupByAccountType(items = []) {
        const accGroups = {
            "Non-account Customers": {},
            "Monthly Account Customers": {},
            "Weekly Account Customers": {},
        };

        items.forEach((item) => {
            let category = "Non-account Customers";
            if (item.accountType === "Monthly a/c")
                category = "Monthly Account Customers";
            else if (item.accountType === "Weekly a/c")
                category = "Weekly Account Customers";

            if (!accGroups[category][item.customerName]) {
                accGroups[category][item.customerName] = [];
            }
            accGroups[category][item.customerName].push(item);
        });

        return accGroups;
    }

    function handlePrint() {
        window.print();
    }
</script>

<!-- Action Buttons Bar (Hidden during Print) -->
<div class="action-bar no-print">
    <button class="btn btn-back" onclick={onBack}>← Back to Menu</button>
    <button class="btn btn-print" onclick={handlePrint}
        >🖨️ Print Delivery Notes</button
    >
</div>

<div class="print-container">
    <!-- ==========================================
       PAGE 1: MORNING ROUNDS - PAPER SUMMARY
       ========================================== -->
    <section class="print-page">
        <div class="header-row">
            <div class="title">MORNING ROUNDS - PAPER SUMMARY</div>
            <div class="date-str">{formattedDate}</div>
        </div>

        <div class="divider"></div>

        <table class="summary-table">
            <thead>
                <tr>
                    <th class="text-left"></th>
                    <th class="text-right underline">Deliver</th>
                    <th class="text-right underline">Save</th>
                    <th class="text-right underline">Total</th>
                </tr>
            </thead>
            <tbody>
                {#each summaryWithPrices as item}
                    <tr>
                        <td class="text-left">{item.paper.toUpperCase()}</td>
                        <td class="text-right">{item.deliveryQty || ""}</td>
                        <td class="text-right">{item.shopSaveQty || ""}</td>
                        <td class="text-right">{item.totalQty}</td>
                    </tr>
                {/each}
            </tbody>
            <tfoot>
                <tr class="totals-row">
                    <td class="text-left bold">Total Papers:</td>
                    <td class="text-right bold">{totalDeliveriesSum}</td>
                    <td class="text-right bold">{totalShopSaveSum}</td>
                    <td class="text-right bold">{totalPapersSum}</td>
                </tr>
            </tfoot>
        </table>

        <div class="page-footer-line"></div>
    </section>

    <!-- ==========================================
       PAGE 2+: INDIVIDUAL DELIVERY ROUNDS
       ========================================== -->
    {#each rounds as round}
        <section class="print-page">
            <div class="header-row">
                <div class="title">
                    MORNING ROUND [ {round.roundName} ] - {round.deliveryPerson}
                </div>
                <div class="date-str">{formattedDate}</div>
            </div>

            <div class="divider"></div>

            <!-- Round Paper Totals -->
            <div class="round-summary-block">
                {#each Object.entries(round.items.reduce((acc, item) => {
                        acc[item.paper.toUpperCase()] = (acc[item.paper.toUpperCase()] || 0) + item.quantity;
                        return acc;
                    }, {})) as [paper, qty]}
                    <div class="paper-count-line">
                        <span>{paper}</span>
                        <span>{qty}</span>
                    </div>
                {/each}

                <div class="divider short"></div>
                <div class="paper-count-line">
                    <span>Total Papers:</span>
                    <span
                        >{round.items.reduce(
                            (acc, i) => acc + i.quantity,
                            0,
                        )}</span
                    >
                </div>
                <div class="paper-count-line">
                    <span>Total Deliveries:</span>
                    <span>{new Set(round.items.map((i) => i.acNo)).size}</span>
                </div>
            </div>

            <div class="divider short"></div>

            <!-- Deliveries Grouped by Street -->
            <div class="deliveries-list">
                {#each Object.entries(groupByStreet(round.items)) as [street, items]}
                    <div class="street-group">
                        <div class="street-header">{street}</div>
                        {#each Object.entries(items.reduce((acc, item) => {
                                if (!acc[item.customerName]) acc[item.customerName] = [];
                                acc[item.customerName].push(item);
                                return acc;
                            }, {})) as [custName, custItems]}
                            <div class="delivery-row">
                                {#if custItems[0].deliveryNotes}
                                    <span class="house-no"
                                        >*{getDoorNo(
                                            custItems[0].address,
                                        )}</span
                                    >
                                    <span class="notes-text"
                                        >*** {custItems[0].deliveryNotes} ***</span
                                    >
                                {:else}
                                    <span class="house-no"
                                        >{getDoorNo(custItems[0].address)}</span
                                    >
                                    <span class="papers-text"
                                        >{formatPaperList(custItems)}</span
                                    >
                                {/if}
                            </div>
                        {/each}
                    </div>
                {/each}
            </div>

            <div class="page-footer-line"></div>
        </section>
    {/each}

    <!-- ==========================================
       PAGE 3: MORNING ROUND [ SV ] - SHOP SAVE
       ========================================== -->
    {#if shopSave && shopSave.length > 0}
        <section class="print-page">
            <div class="header-row">
                <div class="title">MORNING ROUND [sv] - SHOP SAVE</div>
                <div class="date-str">{formattedDate}</div>
            </div>

            <div class="divider"></div>

            <!-- Shop Save Summary Counts -->
            <div class="round-summary-block">
                {#each Object.entries(shopSave.reduce((acc, item) => {
                        acc[item.paper.toUpperCase()] = (acc[item.paper.toUpperCase()] || 0) + item.quantity;
                        return acc;
                    }, {})) as [paper, qty]}
                    <div class="paper-count-line">
                        <span>{paper}</span>
                        <span>{qty}</span>
                    </div>
                {/each}

                <div class="divider short"></div>
                <div class="paper-count-line">
                    <span>Total Papers:</span>
                    <span
                        >{shopSave.reduce(
                            (acc, i) => acc + i.quantity,
                            0,
                        )}</span
                    >
                </div>
                <div class="paper-count-line">
                    <span>Total Customers:</span>
                    <span>{new Set(shopSave.map((i) => i.acNo)).size}</span>
                </div>
            </div>

            <div class="divider short"></div>

            <!-- Shop Save Grouped by Account Type -->
            <div class="shop-save-list">
                {#each Object.entries(groupByAccountType(shopSave)) as [accType, customers]}
                    {#if Object.keys(customers).length > 0}
                        <div class="account-type-group">
                            <div class="account-type-header">{accType}</div>
                            {#each Object.entries(customers) as [custName, items]}
                                <div class="shopsave-row">
                                    <span class="cust-tag">[{custName}]</span>
                                    <span class="papers-text"
                                        >{formatPaperList(items)}</span
                                    >
                                </div>
                            {/each}
                        </div>
                    {/if}
                {/each}
            </div>

            <div class="page-footer-line"></div>
        </section>
    {/if}
</div>

<style>
    /* Top Action Bar Buttons */
    .action-bar {
        display: flex;
        justify-content: space-between;
        background-color: #ffffff;
        padding: 12px 24px;
        border-radius: 6px;
        font-family: sans-serif;
    }

    .btn {
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        font-weight: 600;
        cursor: pointer;
        font-size: 13px;
    }

    .btn-back {
        background: #64748b;
        color: white;
    }

    .btn-print {
        background: #2563eb;
        color: white;
    }

    /* Standard Screen Container */
    .print-container {
        font-family: "Courier New", Courier, monospace;
        font-size: 13pt;
        color: #000;
        background: #fff;
        width: 210mm;
        margin: 0 auto;
        padding: 10mm;
        box-sizing: border-box;
    }

    /* Screen Page Display */
    .print-page {
        margin-bottom: 20mm;
    }

    .header-row {
        display: flex;
        justify-content: space-between;
        font-weight: bold;
        font-size: 13pt;
        margin-bottom: 8px;
    }

    .divider {
        border-top: 1px solid #000;
        margin: 6px 0 12px 0;
    }

    .divider.short {
        width: 290px;
    }

    /* Summary Table */
    .summary-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 12px;
    }

    .summary-table th,
    .summary-table td {
        padding: 2px 4px;
        font-size: 12pt;
    }

    .summary-table tfoot td {
        border-top: 1px solid #000;
        padding-top: 6px;
    }

    .text-left {
        text-align: left;
    }
    .text-right {
        text-align: right;
    }
    .underline {
        text-decoration: underline;
    }
    .bold {
        font-weight: bold;
    }

    /* Round Summary Block */
    .round-summary-block {
        width: 280px;
        margin-bottom: 12px;
    }

    .paper-count-line {
        display: flex;
        justify-content: space-between;
        padding: 1px 0;
    }

    /* Street Header & Groups */
    .street-group {
        margin-bottom: 12px;
    }

    .street-header,
    .account-type-header {
        text-decoration: underline;
        font-weight: bold;
        margin-bottom: 4px;
    }

    .delivery-row,
    .shopsave-row {
        display: flex;
        padding-left: 20px;
        margin-bottom: 2px;
    }

    .house-no {
        min-width: 90px; /* Increased width for flat strings */
        white-space: nowrap; /* Prevents "FLAT 3" from wrapping */
        padding-right: 12px;
    }

    .cust-tag {
        width: 220px;
    }

    .papers-text,
    .notes-text {
        flex: 1;
    }

    .page-footer-line {
        /* border-bottom: 1px solid #000; */
        margin-top: 40px;
    }

    /* Print Specific Rules */
    @page {
        size: A4 portrait;
        margin: 0mm; /* Removes default browser margin box */
    }

    @media print {
        .no-print {
            display: none !important;
        }

        html,
        body {
            background: #fff;
            margin: 0 !important;
            padding: 0 !important;
            width: 100%;
            height: 100%;
        }

        .print-container {
            width: 100% !important;
            max-width: none !important;
            /* 2. Control padding inside container to align all 4 edges cleanly */
            padding: 12mm !important;
            margin: 0 !important;
            box-sizing: border-box;
        }

        .print-page {
            margin-bottom: 0 !important;
            box-sizing: border-box;
        }

        /* Target Page 2 onwards to increase top margin */
        .print-page:nth-child(n + 2) {
            padding-top: 15mm !important; /* Adjust this value to set desired top space */
        }

        .print-page:not(:last-child) {
            page-break-after: always;
            break-after: page;
        }

        .street-group {
            break-inside: avoid;
            page-break-inside: avoid;
        }
    }
</style>
