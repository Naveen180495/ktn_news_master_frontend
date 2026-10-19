<script>
    let {
        mode = "add",
        bandData = {},
        onSave,
        onUpdate,
        onDelete,
        onBack,
    } = $props();

    let isReadOnly = $state(mode === "view");
    let bandReadOnly = $derived(mode !== "add");

    let form = $state(
        mode === "view"
            ? { ...bandData }
            : {
                  name: "",
                  weekdayCharge: 0,
                  saturdayCharge: 0,
                  sundayCharge: 0,
              },
    );

    function handleSave() {
        const payload = { ...form };
        if (mode === "add") {
            onSave(payload);
        } else {
            onUpdate(payload);
            isReadOnly = true; // Force local switch back to view mode
        }
    }

    function handleEdit() {
        isReadOnly = false;
    }

    function handleCancel() {
        form = { ...bandData }; // Reset form to original bandData
        isReadOnly = true;
    }
</script>

<div class="form-container">
    <header class="app-header">
        <div>
            <button class="back-link" onclick={onBack}>← Back</button>
            <h1>
                {isReadOnly
                    ? "Delivery Band Details"
                    : mode === "add"
                      ? "Add New Delivery Band"
                      : "Edit Delivery Band"}
            </h1>
        </div>
        <div class="header-actions">
            {#if isReadOnly}
                <button class="action-btn" onclick={handleEdit}>Edit</button>
                <button class="danger-btn" onclick={() => onDelete(form)}
                    >Delete</button
                >
            {:else}
                {#if mode === "view"}
                    <button class="cancel-btn" onclick={handleCancel}
                        >Cancel</button
                    >
                {/if}
                <button class="primary-btn" onclick={handleSave}>Save</button>
            {/if}
        </div>
    </header>

    <div class="form-card">
        <h3>Band Pricing Specifications</h3>
        <div class="grid-layout cols-2">
            <div class="field">
                <label for="band-name">Band Name</label>
                <input
                    id="band-name"
                    type="text"
                    disabled={bandReadOnly}
                    bind:value={form.name}
                    placeholder="e.g. Standard Band"
                    required
                />
            </div>
        </div>

        <div class="grid-layout cols-3">
            <div class="field">
                <label for="weekday">Weekday Charge (Mon-Fri)</label>
                <div class="currency-wrapper">
                    <span class="currency-symbol">£</span>
                    <input
                        id="weekday"
                        type="number"
                        step="0.05"
                        disabled={isReadOnly}
                        bind:value={form.weekdayCharge}
                    />
                </div>
            </div>
            <div class="field">
                <label for="saturday">Saturday Charge</label>
                <div class="currency-wrapper">
                    <span class="currency-symbol">£</span>
                    <input
                        id="saturday"
                        type="number"
                        step="0.05"
                        disabled={isReadOnly}
                        bind:value={form.saturdayCharge}
                    />
                </div>
            </div>
            <div class="field">
                <label for="sunday">Sunday Charge</label>
                <div class="currency-wrapper">
                    <span class="currency-symbol">£</span>
                    <input
                        id="sunday"
                        type="number"
                        step="0.05"
                        disabled={isReadOnly}
                        bind:value={form.sundayCharge}
                    />
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    .form-container {
        background: #f8f9fa;
        padding: 24px;
        border-radius: 8px;
        font-family: sans-serif;
    }
    .app-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
        border-bottom: 2px solid #e9ecef;
        padding-bottom: 12px;
    }
    .app-header h1 {
        margin: 8px 0 0 0;
        font-size: 24px;
        color: #212529;
    }
    .back-link {
        background: none;
        border: none;
        color: #4dabf7;
        font-weight: bold;
        cursor: pointer;
        padding: 0;
        font-size: 14px;
    }
    .header-actions {
        display: flex;
        gap: 12px;
    }
    .action-btn,
    .primary-btn,
    .cancel-btn,
    .danger-btn {
        padding: 10px 20px;
        border: none;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        font-size: 14px;
    }
    .action-btn {
        background: #3498db;
        color: white;
    }
    .primary-btn {
        background: #2ecc71;
        color: white;
    }
    .cancel-btn {
        background: #7f8c8d;
        color: white;
    }
    .danger-btn {
        background: #e74c3c;
        color: white;
    }
    .form-card {
        background: white;
        padding: 24px;
        border-radius: 8px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }
    .form-card h3 {
        margin-top: 0;
        margin-bottom: 20px;
        color: #495057;
        font-size: 16px;
        border-bottom: 1px solid #dee2e6;
        padding-bottom: 10px;
    }
    .grid-layout {
        display: grid;
        gap: 20px;
        margin-bottom: 20px;
    }
    .cols-2 {
        grid-template-columns: repeat(2, 1fr);
    }
    .cols-3 {
        grid-template-columns: repeat(3, 1fr);
    }
    .field {
        display: flex;
        flex-direction: column;
        gap: 6px;
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
        width: 100%;
        box-sizing: border-box;
        height: 42px;
    }
    input:disabled {
        background-color: #e9ecef;
        cursor: not-allowed;
    }
    .currency-wrapper {
        position: relative;
        display: flex;
        align-items: center;
    }
    .currency-symbol {
        position: absolute;
        left: 12px;
        font-weight: bold;
        color: #495057;
    }
    .currency-wrapper input {
        padding-left: 28px;
    }
</style>
