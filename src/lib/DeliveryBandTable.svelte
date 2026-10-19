<script>
    let { bandList = [], onViewBand, onPrepareNew, onBackToHub } = $props();
</script>

<div class="page-header">
    <div>
        <h1>Delivery Band Management</h1>
        <p class="subtitle">
            Manage delivery fee structures for Saturday, Sunday, and Weekdays.
        </p>
    </div>
    <div class="header-actions">
        <button class="back-link" onclick={onBackToHub}>← Back</button>
        <button class="primary-btn" onclick={onPrepareNew}>+ Add Band</button>
    </div>
</div>

<div class="data-section">
    <table class="modern-table">
        <thead>
            <tr>
                <th>ID</th>
                <th>Band Name</th>
                <th>Weekday (Mon-Fri)</th>
                <th>Saturday</th>
                <th>Sunday</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            {#each bandList as band}
                <tr>
                    <td>{band.id}</td>
                    <td><strong>{band.name}</strong></td>
                    <td>£{band.weekdayCharge?.toFixed(2) ?? "0.00"}</td>
                    <td>£{band.saturdayCharge?.toFixed(2) ?? "0.00"}</td>
                    <td>£{band.sundayCharge?.toFixed(2) ?? "0.00"}</td>
                    <td>
                        <button
                            class="edit-btn"
                            onclick={() => onViewBand(band)}>View</button
                        >
                    </td>
                </tr>
            {:else}
                <tr>
                    <td
                        colspan="6"
                        style="text-align: center; padding: 2rem; color: #636e72;"
                    >
                        No delivery bands found. Click "+ Add Band" to start.
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
    .data-section {
        background: white;
        border-radius: 6px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
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
