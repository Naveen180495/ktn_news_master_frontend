<script>
    let { onOpenOrdering, onOpenBands, onBackToDashboard } = $props();
</script>

<div class="streets-dashboard-container">
    <div class="page-header">
        <div>
            <h2>Streets & Route Data Hub</h2>
            <p class="section-subtitle">
                Manage street location sequences and customize delivery stop
                orders for rounds.
            </p>
        </div>
        <button class="back-link" onclick={onBackToDashboard}
            >← Back to Dashboard</button
        >
    </div>

    <div class="streets-options-grid">
        <button class="streets-card-btn highlight" onclick={onOpenOrdering}>
            <div class="card-icon">📍</div>
            <h3>Round Address Ordering</h3>
            <p>
                Select a delivery round to customize and re-arrange the exact
                street stop order for delivery notes.
            </p>
        </button>

        <button class="streets-card-btn highlight" onclick={onOpenBands}>
            <div class="card-icon">💰</div>
            <h3>Delivery Bands</h3>
            <p>
                Configure delivery charge bands with custom rates for Saturday,
                Sunday, and Weekdays (Mon-Fri).
            </p>
        </button>
    </div>
</div>

<style>
    .streets-dashboard-container {
        background: white;
        border-radius: 10px;
        padding: 35px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04);
        font-family: sans-serif;
    }
    .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 25px;
        border-bottom: 2px solid #edf2f7;
        padding-bottom: 15px;
    }
    .page-header h2 {
        margin: 0 0 5px 0;
        font-size: 24px;
        color: #1e293b;
    }
    .section-subtitle {
        color: #64748b;
        margin: 0;
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
    .streets-options-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 24px;
    }
    .streets-card-btn {
        background: #f8fafc;
        border: 2px solid #e2e8f0;
        border-radius: 8px;
        padding: 28px;
        text-align: left;
        cursor: pointer;
        transition: all 0.2s ease-in-out;
    }
    .streets-card-btn:hover {
        transform: translateY(-2px);
        border-color: #cbd5e1;
        background: #f1f5f9;
    }
    .streets-card-btn.highlight {
        border-color: #bae6fd;
        background: #f0f9ff;
    }
    .streets-card-btn.highlight:hover {
        background: #e0f2fe;
        border-color: #7dd3fc;
    }
    .card-icon {
        font-size: 32px;
        margin-bottom: 12px;
    }
    .streets-card-btn h3 {
        margin: 0 0 8px 0;
        font-size: 18px;
        color: #0f172a;
    }
    .streets-card-btn p {
        margin: 0;
        font-size: 13px;
        color: #64748b;
        line-height: 1.5;
    }
</style>
