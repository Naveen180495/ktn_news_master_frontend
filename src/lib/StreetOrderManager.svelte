<script>
    let { roundList = [], onBack } = $props();

    let selectedRoundId = $state("");
    let roundAddresses = $state([]);
    let isSaving = $state(false);

    // Fetch addresses/stops for the selected round when dropdown changes
    async function handleRoundSelect(e) {
        const roundId = e.target.value;
        selectedRoundId = roundId;
        if (!roundId) {
            roundAddresses = [];
            return;
        }

        try {
            const res = await fetch(
                `http://localhost:8080/api/rounds/${roundId}/addresses`,
            );
            if (res.ok) {
                const data = await res.json();
                roundAddresses = data.addresses || [];
            }
        } catch (err) {
            console.error("Failed to fetch round addresses:", err);
        }
    }

    // Move address up in the sequence order
    function moveUp(index) {
        if (index <= 0) return;
        const item = roundAddresses[index];
        roundAddresses.splice(index, 1);
        roundAddresses.splice(index - 1, 0, item);
        roundAddresses = [...roundAddresses];
    }

    // Move address down in the sequence order
    function moveDown(index) {
        if (index >= roundAddresses.length - 1) return;
        const item = roundAddresses[index];
        roundAddresses.splice(index, 1);
        roundAddresses.splice(index + 1, 0, item);
        roundAddresses = [...roundAddresses];
    }

    // Save custom sequence to DB
    async function saveSequence() {
        if (!selectedRoundId) return;
        isSaving = true;
        try {
            const payload = {
                round: selectedRoundId,
                addresses: roundAddresses.map((addr, idx) => ({
                    ...addr,
                    sequenceOrder: idx + 1,
                })),
            };

            const res = await fetch(
                `http://localhost:8080/api/rounds/${selectedRoundId}/save-sequence`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                },
            );

            if (res.ok) {
                alert("Round address sequence saved successfully!");
            } else {
                alert("Failed to save address sequence.");
            }
        } catch (err) {
            console.error("Error saving sequence:", err);
        } finally {
            isSaving = false;
        }
    }
</script>

<div class="street-manager-container">
    <div class="page-header">
        <div>
            <h1>Round Address Ordering</h1>
            <p class="subtitle">
                Customize the delivery stop sequence for the selected round.
            </p>
        </div>
        <button class="back-link" onclick={onBack}>← Back to Streets Hub</button
        >
    </div>

    <div class="selector-card">
        <label for="round-select">Select Delivery Round:</label>
        <select
            id="round-select"
            onchange={handleRoundSelect}
            bind:value={selectedRoundId}
        >
            <option value="">-- Choose a Round --</option>
            {#each roundList as r}
                <option value={r.round}
                    >Round {r.round} ({r.deliveryPersonName ||
                        "Unassigned"})</option
                >
            {/each}
        </select>
    </div>

    {#if selectedRoundId}
        <div class="sequence-card">
            <h3>Delivery Stop Order</h3>
            <p class="hint">
                Use the up and down buttons to arrange the exact delivery
                sequence.
            </p>

            <div class="table-responsive">
                <table class="modern-table">
                    <thead>
                        <tr>
                            <th>Order</th>
                            <th>A/c No</th>
                            <th>Customer Name</th>
                            <th>Address</th>
                            <th class="text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each roundAddresses as addr, index}
                            <tr>
                                <td><strong>#{index + 1}</strong></td>
                                <td>{addr.acNo}</td>
                                <td>{addr.customerName}</td>
                                <td>{addr.address}</td>
                                <td class="text-right action-btns">
                                    <button
                                        class="order-btn"
                                        onclick={() => moveUp(index)}
                                        disabled={index === 0}>▲ Up</button
                                    >
                                    <button
                                        class="order-btn"
                                        onclick={() => moveDown(index)}
                                        disabled={index ===
                                            roundAddresses.length - 1}
                                        >▼ Down</button
                                    >
                                </td>
                            </tr>
                        {:else}
                            <tr>
                                <td colspan="5" class="empty-notice"
                                    >No addresses found for this round.</td
                                >
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>

            <div class="footer-actions">
                <button
                    class="primary-btn"
                    onclick={saveSequence}
                    disabled={isSaving || roundAddresses.length === 0}
                >
                    {isSaving ? "Saving..." : "Save Sequence Order"}
                </button>
            </div>
        </div>
    {/if}
</div>

<style>
    .street-manager-container {
        background: #f8f9fa;
        padding: 24px;
        border-radius: 8px;
        font-family: sans-serif;
    }
    .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        border-bottom: 2px solid #dee2e6;
        padding-bottom: 12px;
    }
    .page-header h1 {
        margin: 0;
        font-size: 24px;
        color: #212529;
    }
    .subtitle {
        margin: 4px 0 0 0;
        color: #636e72;
        font-size: 14px;
    }
    .back-link {
        background: none;
        border: none;
        color: #3498db;
        font-weight: bold;
        cursor: pointer;
        font-size: 14px;
    }
    .selector-card,
    .sequence-card {
        background: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        margin-bottom: 20px;
    }
    .selector-card label {
        display: block;
        font-weight: bold;
        margin-bottom: 8px;
        font-size: 14px;
        color: #495057;
    }
    .selector-card select {
        width: 100%;
        max-width: 400px;
        padding: 10px;
        border: 1px solid #ced4da;
        border-radius: 6px;
        font-size: 14px;
    }
    .sequence-card h3 {
        margin-top: 0;
        font-size: 16px;
        color: #495057;
        border-bottom: 1px solid #dee2e6;
        padding-bottom: 10px;
    }
    .hint {
        font-size: 13px;
        color: #6c757d;
        margin-bottom: 15px;
    }
    .modern-table {
        width: 100%;
        border-collapse: collapse;
        text-align: left;
    }
    .modern-table th {
        background: #f1f3f5;
        padding: 10px 12px;
        font-size: 13px;
        border-bottom: 2px solid #dee2e6;
        color: #495057;
    }
    .modern-table td {
        padding: 10px 12px;
        border-bottom: 1px solid #dee2e6;
        font-size: 14px;
        color: #333;
    }
    .text-right {
        text-align: right;
    }
    .action-btns {
        display: flex;
        gap: 6px;
        justify-content: flex-end;
    }
    .order-btn {
        background: #4a5568;
        color: white;
        border: none;
        padding: 5px 10px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
    }
    .order-btn:disabled {
        background: #cbd5e1;
        cursor: not-allowed;
    }
    .footer-actions {
        margin-top: 20px;
        text-align: right;
    }
    .primary-btn {
        background: #2ecc71;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 6px;
        font-weight: bold;
        cursor: pointer;
        font-size: 14px;
    }
    .primary-btn:hover:not(:disabled) {
        background: #27ae60;
    }
    .primary-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
    .empty-notice {
        text-align: center;
        color: #6c757d;
        padding: 2rem;
        font-style: italic;
    }
</style>
