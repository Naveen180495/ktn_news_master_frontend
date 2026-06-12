<script>
    // Accept the array of weeks and the callback function for selection tracking
    let { weeks = [], onSelectWeek } = $props();
    let selectedDate = $state(null);

    function handleCellClick(week) {
        if (selectedDate === week.date) {
            // Clicked the same cell twice: CLEAR selection
            selectedDate = null;
            onSelectWeek(null);
        } else {
            // Clicked a new cell: SET selection
            selectedDate = week.date;
            onSelectWeek(week);
        }
    }
</script>

<div class="ledger-container">
    <div class="months-header-grid">
        {#each ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as month}
            <div class="month-title">{month}</div>
        {/each}
    </div>

    <div class="matrix-grid-body">
        {#each Array(12) as _, mIndex}
            <div class="month-vertical-column">
                {#each weeks.filter((w) => w.month === mIndex) as week}
                    {@const dateObj = new Date(week.date)}
                    <button
                        type="button"
                        class="ledger-week-cell {week.status}"
                        class:is-active-selected={selectedDate === week.date}
                        onclick={() => handleCellClick(week)}
                    >
                        <span class="cell-day-label">
                            {dateObj.toLocaleDateString("en-GB", {
                                weekday: "short",
                            })}
                        </span>
                        <span class="cell-day-num">{dateObj.getDate()}</span>
                        {#if week.status !== null && week.status !== "partial"}
                            <span class="cell-amount"
                                >£{week.totalAmount.toFixed(2)}</span
                            >
                        {:else if week.status !== null && week.status === "partial"}
                            <span class="cell-amount"
                                >£{week.outstandingAmount.toFixed(2)}</span
                            >
                        {:else}
                            <span class="cell-amount"></span>
                        {/if}
                    </button>
                {/each}
            </div>
        {/each}
    </div>
</div>

<style>
    .ledger-container {
        background: #15191e;
        border: 3px solid #2e3842;
        border-radius: 6px;
        padding: 8px;
        box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.8);
        font-family: "Courier New", Courier, monospace;
    }

    /* Top Month Banner Bar Structure */
    .months-header-grid {
        display: grid;
        grid-template-columns: repeat(12, 1fr);
        background: #24303c;
        border-bottom: 2px solid #2e3842;
        padding: 6px 0;
        text-align: center;
    }

    .month-title {
        color: #9cb3c9;
        font-weight: bold;
        font-size: 0.9rem;
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    /* Core Matrix Framework Layout: Creates 12 independent vertical tracks */
    .matrix-grid-body {
        display: grid;
        grid-template-columns: repeat(12, 1fr);
        gap: 4px;
        padding-top: 6px;
        background: #0d1117;
    }

    .month-vertical-column {
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-height: 350px;
    }

    /* Individual Retro Matrix Cell Styles */
    .ledger-week-cell {
        background: #dbe5f2;
        border: 1px solid #3b3939;
        color: #3b3939;
        padding: 6px 2px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        border-radius: 3px;
        cursor: pointer;
        width: 100%;
        box-sizing: border-box;
        height: 68px;
        transition: all 0.15s ease-in-out;
    }

    .cell-day-label {
        font-size: 0.65rem;
        color: #3b3939;
        text-transform: uppercase;
    }

    .cell-day-num {
        font-size: 0.95rem;
        font-weight: bold;
        color: #3b3939;
    }

    .cell-amount {
        font-size: 0.85rem;
        font-weight: bold;
    }

    /* System Status State Modifiers */
    .ledger-week-cell.paid {
        border-color: #2ecc71;
        color: #2ecc71;
    }
    .ledger-week-cell.paid .cell-day-label {
        color: #3b3939;
        opacity: 0.7;
    }

    .ledger-week-cell.partial {
        border-color: #3b3939;
        color: #fa5b25;
    }
    .ledger-week-cell.partial .cell-day-label {
        color: #3b3939;
        opacity: 0.7;
    }

    .ledger-week-cell.unpaid {
        border-color: #3b9ef4;
        color: #3b9ef4;
    }

    /* The exact Blue Highlight state for selections */
    .ledger-week-cell.is-active-selected {
        background: #2575fc !important;
        color: #ffffff !important;
        border-color: #ffffff !important;
        box-shadow: 0 0 12px #2575fc;
        transform: scale(1.02);
        z-index: 5;
    }
</style>
