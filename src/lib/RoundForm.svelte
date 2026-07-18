<script>
  let {
    mode = "add",
    roundData = {}, 
    onSave,
    onUpdate,
    onDelete,
    onBack,
  } = $props();

  let isReadOnly = $state(mode === "view");
  let originalBackup = { profile: {} };

  // State structured to match the metadata fields consistently
  let form = $state(
    mode === "view"
      ? { ...roundData,
       }
      : {
          round: "",
          deliveryPersonName: "",
          deliveryPersonPhone: "",
          roundNotes: "",
        }
  );

  let roundReadOnly = $derived(mode !== "add");

  function handleSave() {
    const payload = {
      ...form,
    };

    if (mode === "add") onSave(payload);
    else onUpdate(payload);
  }

  function handleEdit() {
    if (roundData) {
      form = { ...roundData };
      originalBackup.profile = JSON.parse(JSON.stringify(form));
    }
    isReadOnly = false;
  }

  function handleCancel() {
    form = JSON.parse(JSON.stringify(originalBackup.profile));
    isReadOnly = true;
  }
</script>

<div class="form-container">
  <header class="app-header">
    <div>
      <button class="back-link" onclick={onBack}>← Back</button>
      <h1>
        {isReadOnly
          ? "Round Details"
          : mode === "add"
            ? "Add New Round"
            : "Edit Round"}
      </h1>
    </div>
    <div class="header-actions">
      {#if isReadOnly}
        <button class="action-btn" onclick={handleEdit}>Edit</button>
        <button class="danger-btn" onclick={() => onDelete(form)}>Delete</button>
      {:else}
        {#if mode === "view"}
          <button class="cancel-btn" onclick={handleCancel}>Cancel</button>
        {/if}
        <button class="primary-btn" onclick={handleSave}>Save</button>
      {/if}
    </div>
  </header>

  <div class="form-card">
    <h2 class="card-title">Round Specifications</h2>
    <hr class="divider" />

    <div class="form-grid">
      <div class="form-group col-full">
        <label for="round">Round</label>
        <input
          id="round"
          type="text"
          bind:value={form.round}
          disabled={roundReadOnly}
        />
      </div>

      <div class="form-group col-span-2">
        <label for="name">Name</label>
        <input
          id="name"
          type="text"
          rows="2"
          bind:value={form.deliveryPersonName}
          placeholder="Enter delivery person name"
          disabled={isReadOnly}
        />
      </div>

      <div class="form-group col-span-1">
        <label for="phone">Phone</label>
        <input
          id="phone"
          type="tel"
          bind:value={form.deliveryPersonPhone}
          placeholder="Enter delivery person phone number"
          disabled={isReadOnly}
        />
      </div>

      <div class="form-group col-span-2">
        <label for="notes">Notes</label>
        <textarea
          id="notes"
          rows="4"
          bind:value={form.roundNotes}
          placeholder="Add any specific route details or instructions..."
          disabled={isReadOnly}
        ></textarea>
      </div>
    </div>
  </div>
</div>

<style>
  .form-container {
    font-family:
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      Roboto,
      sans-serif;
    max-width: 1100px;
    margin: 2rem auto;
    padding: 0 1.5rem;
    color: #334155;
    background-color: #f8fafc;
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
    font-weight: 600;
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
    transition: background 0.2s ease;
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
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    padding: 1.75rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }

  .card-title {
    font-size: 1.1rem;
    font-weight: 500;
    color: #475569;
    margin: 0 0 1rem 0;
  }

  .divider {
    border: 0;
    border-top: 1px solid #f1f5f9;
    margin-bottom: 1.5rem;
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1.25rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .col-span-1 {
    grid-column: span 1 / span 1;
  }
  .col-span-2 {
    grid-column: span 2 / span 2;
  }
  .col-full {
    grid-column: span 3 / span 3;
  }

  label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #475569;
  }

  input,
  textarea {
    width: 100%;
    padding: 0.65rem 0.75rem;
    border: 1px solid #cbd5e1;
    border-radius: 0.375rem;
    font-size: 0.95rem;
    color: #1e293b;
    background-color: #fff;
    box-sizing: border-box;
    transition:
      border-color 0.15s ease,
      box-shadow 0.15s ease;
  }

  input:focus,
  textarea:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  input:disabled,
  textarea:disabled {
    background-color: #f1f5f9;
    color: #64748b;
    cursor: not-allowed;
  }

  textarea {
    resize: vertical;
  }

  @media (max-width: 768px) {
    .form-grid {
      grid-template-columns: 1fr;
    }
    .col-span-1,
    .col-span-2,
    .col-full {
      grid-column: span 1 / span 1;
    }
  }
</style>