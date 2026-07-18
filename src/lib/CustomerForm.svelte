<script>
  let {
    mode = "add",
    customerData = {},
    paperList = [],
    onSave,
    onUpdate,
    onDelete,
    onOpenLedger,
    onBack,
  } = $props();

  let isReadOnly = $state(mode === "view");

  let form = $state(
    mode === "view"
      ? { ...customerData }
      : {
          acNo: "",
          startDate: "",
          address: "",
          phone: "",
          title: "",
          surname: "",
          forename: "",
          accountType: "Weekly a/c",
          roundAm: "",
          roundNotes: "",
          cancelDate: "",
          restartDate: "",
          deliveryCharge: 0,
        }
  );

  // Suggestions Data Repositories (Can be loaded from properties or an API)
  let paperSuggestions = $derived.by(() => {
    return paperList.filter((paper) => {
      const newspaper = paper.type.includes("Newspaper");
      return newspaper;
    });
  });

  let magazineSuggestions = $derived.by(() => {
    return paperList.filter((paper) => {
      const magazine = paper.type.includes("Magazine");
      return magazine;
    });
  });

  let papers = $state(customerData.dailyPapers || []);
  let magazines = $state(customerData.weeklyMagazines || []);

  // 2. Keep a local non-reactive backup reference object
  let originalBackup = {
    papers: [],
    magazines: [],
  };

  // Helper function to calculate row weekly totals using day-by-day unit pricing from master list
  function getCalculatedRowTotal(row) {
    if (!row.name) return 0;
    const match = paperList.find((p) => p.name === row.name);
    if (!match || !match.currentPrices) return 0;

    const prices = match.currentPrices;
    return (
      (parseInt(row.mon) || 0) * (parseFloat(prices.monday) || 0) +
      (parseInt(row.tue) || 0) * (parseFloat(prices.tuesday) || 0) +
      (parseInt(row.wed) || 0) * (parseFloat(prices.wednesday) || 0) +
      (parseInt(row.thu) || 0) * (parseFloat(prices.thursday) || 0) +
      (parseInt(row.fri) || 0) * (parseFloat(prices.friday) || 0) +
      (parseInt(row.sat) || 0) * (parseFloat(prices.saturday) || 0) +
      (parseInt(row.sun) || 0) * (parseFloat(prices.sunday) || 0)
    );
  }

  // Monitor row property modifications to update auto-calculated baseline values dynamically while keeping overrides editable
  $effect(() => {
    papers.forEach((paper) => {
      const autoPrice = getCalculatedRowTotal(paper);
      if (
        autoPrice > 0 &&
        (!paper.price || paper._lastAutoPrice !== autoPrice)
      ) {
        paper.price = autoPrice.toFixed(2);
        paper._lastAutoPrice = autoPrice;
      }
    });
  });

  $effect(() => {
    magazines.forEach((magazine) => {
      const autoPrice = getCalculatedRowTotal(magazine);
      if (
        autoPrice > 0 &&
        (!magazine.price || magazine._lastAutoPrice !== autoPrice)
      ) {
        magazine.price = autoPrice.toFixed(2);
        magazine._lastAutoPrice = autoPrice;
      }
    });
  });

  let dailyAndWeeklyPapersTotal = $derived(
    papers.reduce((sum, p) => sum + (parseFloat(p.price) || 0), 0).toFixed(2)
  );
  let weeklyMagazinesTotal = $derived(
    magazines.reduce((sum, m) => sum + (parseFloat(m.price) || 0), 0).toFixed(2)
  );
  let finalWeeklyTotal = $derived(
    String(
      Number(form.deliveryCharge || 0) +
        Number(dailyAndWeeklyPapersTotal) +
        Number(weeklyMagazinesTotal)
    )
  );

  function addPaperRow() {
    papers = [
      ...papers,
      {
        name: "",
        mon: 0,
        tue: 0,
        wed: 0,
        thu: 0,
        fri: 0,
        sat: 0,
        sun: 0,
        price: 0,
      },
    ];
  }
  function addMagazineRow() {
    magazines = [
      ...magazines,
      {
        name: "",
        mon: 0,
        tue: 0,
        wed: 0,
        thu: 0,
        fri: 0,
        sat: 0,
        sun: 0,
        price: 0,
      },
    ];
  }

  function handleSave() {
    const payload = {
      ...form,
      dailyPapers: papers,
      weeklyMagazines: magazines,
      dailyAndWeeklyPapersTotal,
      weeklyTotal: finalWeeklyTotal,
    };
    if (mode === "add") onSave(payload);
    else onUpdate(payload);
  }

  function noScroll(node) {
    const handleWheel = (e) => {
      e.preventDefault();
      node.blur();
    };
    node.addEventListener("wheel", handleWheel, { passive: false });
    return {
      destroy() {
        node.removeEventListener("wheel", handleWheel);
      },
    };
  }

  function deleteFocusedPaperRow() {
    if (papers.length > 0) {
      papers = papers.slice(0, -1);
    }
  }

  // Add functionality for magazines row deletion
  function deleteFocusedMagazineRow() {
    if (magazines.length > 0) {
      magazines = magazines.slice(0, -1);
    }
  }

  function handleEdit() {
    if (customerData) {
      const structuralPapers = customerData.dailyPapers || [];
      const structuralMagazines = customerData.weeklyMagazines || [];

      form = { ...customerData };
      papers = JSON.parse(JSON.stringify(structuralPapers));
      magazines = JSON.parse(JSON.stringify(structuralMagazines));
      originalBackup.papers = JSON.parse(JSON.stringify(structuralPapers));
      originalBackup.magazines = JSON.parse(
        JSON.stringify(structuralMagazines)
      );
      originalBackup.profile = JSON.parse(JSON.stringify(form));
    }
    isReadOnly = false;
  }

  function handleCancel() {
    papers = JSON.parse(JSON.stringify(originalBackup.papers));
    magazines = JSON.parse(JSON.stringify(originalBackup.magazines));
    form = JSON.parse(JSON.stringify(originalBackup.profile));
    isReadOnly = true;
  }
</script>

<datalist id="paper-options">
  {#each paperSuggestions as suggestion}
    <option value={suggestion.name}></option>
  {/each}
</datalist>

<datalist id="magazine-options">
  {#each magazineSuggestions as suggestion}
    <option value={suggestion.name}></option>
  {/each}
</datalist>

<div class="form-container">
  <header class="form-header">
    <div>
      <button class="back-link" onclick={onBack}>← Back</button>
      <h1>
        {isReadOnly
          ? "Customer Details"
          : mode === "add"
            ? "Add New Customer"
            : "Edit Customer"}
      </h1>
    </div>
    <div class="header-actions">
      {#if isReadOnly}
        <button class="action-btn" onclick={handleEdit}>Edit</button>
        <button class="danger-btn" onclick={() => onDelete(form)}>Delete</button
        >
        <button class="accounts-btn" onclick={() => onOpenLedger(form.acNo)}
          >Accounts</button
        >
      {:else}
        {#if mode === "view"}
          <button class="action-btn" onclick={handleCancel}>Cancel</button>
        {/if}
        <button class="primary-btn" onclick={handleSave}>Save</button>
      {/if}
    </div>
  </header>

  <div class="vertical-stack">
    <section class="form-card">
      <h3>Basic Details</h3>
      <div class="grid-layout cols-3">
        <div class="field">
          <label for="ac">A/c No</label>
          <input
            id="ac"
            type="text"
            readonly
            class="readonly-input"
            bind:value={form.acNo}
          />
        </div>
        <div class="field">
          <label for="sd">Start Date</label>
          <input
            id="sd"
            type="date"
            disabled={isReadOnly}
            bind:value={form.startDate}
          />
        </div>
        <div class="field">
          <label for="ph">Phone</label>
          <input
            id="ph"
            type="tel"
            disabled={isReadOnly}
            bind:value={form.phone}
          />
        </div>
      </div>

      <div class="grid-layout cols-3">
        <div class="field">
          <label for="tl">Title</label>
          <input
            id="tl"
            type="text"
            disabled={isReadOnly}
            bind:value={form.title}
            placeholder="e.g. Mr"
          />
        </div>
        <div class="field">
          <label for="fn">Forename</label>
          <input
            id="fn"
            type="text"
            disabled={isReadOnly}
            bind:value={form.forename}
          />
        </div>
        <div class="field">
          <label for="sn">Surname</label>
          <input
            id="sn"
            type="text"
            disabled={isReadOnly}
            bind:value={form.surname}
          />
        </div>
      </div>

      <div class="grid-layout cols-2">
        <div class="field">
          <label for="adr">Address</label>
          <textarea
            id="adr"
            rows="2"
            disabled={isReadOnly}
            bind:value={form.address}
          ></textarea>
        </div>
        <div class="field">
          <label for="at">Account Type</label>
          <select id="at" disabled={isReadOnly} bind:value={form.accountType}>
            <option>Weekly a/c</option>
            <option>Monthly a/c</option>
          </select>
        </div>
      </div>
    </section>

    <section class="form-card">
      <h3>Rounds & Schedules</h3>
      <div class="grid-layout cols-2">
        <div class="field">
          <label for="roundAm">AM Route</label>
          <input
            id="roundAm"
            type="text"
            disabled={isReadOnly}
            bind:value={form.roundAm}
          />
        </div>
        <div class="field">
          <label for="roundNotes">Round Notes</label>
          <input
            id="roundNotes"
            type="text"
            disabled={isReadOnly}
            bind:value={form.roundNotes}
          />
        </div>
      </div>
      <div class="grid-layout cols-2">
        <div class="field">
          <label for="cancelDate">Cancel Date</label>
          <input
            id="cancelDate"
            type="date"
            disabled={isReadOnly}
            bind:value={form.cancelDate}
          />
        </div>
        <div class="field">
          <label for="restartDate">Restart Date</label>
          <input
            id="restartDate"
            type="date"
            disabled={isReadOnly}
            bind:value={form.restartDate}
          />
        </div>
      </div>
    </section>

    <section class="form-card">
      <div class="paper-schedule-container">
        <div class="section-header">
          <h3>Daily & Weekly Papers</h3>
          <div class="button-group">
            <button
              class="add-row-btn"
              onclick={addPaperRow}
              disabled={isReadOnly}>+ Add</button
            >
            <button
              type="button"
              class="delete-row-btn"
              onclick={deleteFocusedPaperRow}
              disabled={isReadOnly || papers.length === 0}>- Delete</button
            >
          </div>
        </div>
        <div class="table-responsive">
          <table class="schedule-table">
            <thead>
              <tr>
                <th class="text-left">Paper Name</th>
                <th>MON</th><th>TUE</th><th>WED</th><th>THU</th><th>FRI</th><th
                  >SAT</th
                ><th>SUN</th>
                <th class="text-right">Price (£)</th>
              </tr>
            </thead>
            <tbody>
              {#each papers as paper}
                <tr>
                  <td class="w-name">
                    <input
                      type="text"
                      list="paper-options"
                      disabled={isReadOnly}
                      bind:value={paper.name}
                    />
                  </td>
                  <td class="w-day"
                    ><input
                      type="number"
                      disabled={isReadOnly}
                      bind:value={paper.mon}
                      use:noScroll
                    /></td
                  >
                  <td class="w-day"
                    ><input
                      type="number"
                      disabled={isReadOnly}
                      bind:value={paper.tue}
                      use:noScroll
                    /></td
                  >
                  <td class="w-day"
                    ><input
                      type="number"
                      disabled={isReadOnly}
                      bind:value={paper.wed}
                      use:noScroll
                    /></td
                  >
                  <td class="w-day"
                    ><input
                      type="number"
                      disabled={isReadOnly}
                      bind:value={paper.thu}
                      use:noScroll
                    /></td
                  >
                  <td class="w-day"
                    ><input
                      type="number"
                      disabled={isReadOnly}
                      bind:value={paper.fri}
                      use:noScroll
                    /></td
                  >
                  <td class="w-day"
                    ><input
                      type="number"
                      disabled={isReadOnly}
                      bind:value={paper.sat}
                      use:noScroll
                    /></td
                  >
                  <td class="w-day"
                    ><input
                      type="number"
                      disabled={isReadOnly}
                      bind:value={paper.sun}
                      use:noScroll
                    /></td
                  >
                  <td class="w-price">
                    <input
                      type="number"
                      step="0.01"
                      class="text-right"
                      disabled={isReadOnly}
                      bind:value={paper.price}
                      use:noScroll
                    />
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
        <div class="schedule-footer">
          <span
            >Weekly Total for Papers: <strong
              >£{dailyAndWeeklyPapersTotal}</strong
            ></span
          >
        </div>
      </div>
    </section>

    <section class="form-card">
      <div class="paper-schedule-container">
        <div class="section-header">
          <h3>Weekly Magazines</h3>
          <div class="button-group">
            <button
              class="add-row-btn"
              onclick={addMagazineRow}
              disabled={isReadOnly}>+ Add</button
            >
            <button
              type="button"
              class="delete-row-btn"
              onclick={deleteFocusedMagazineRow}
              disabled={isReadOnly || magazines.length === 0}>- Delete</button
            >
          </div>
        </div>
        <div class="table-responsive">
          <table class="schedule-table">
            <thead>
              <tr>
                <th class="text-left">Magazine Name</th>
                <th>MON</th><th>TUE</th><th>WED</th><th>THU</th><th>FRI</th><th
                  >SAT</th
                ><th>SUN</th>
                <th class="text-right">Price (£)</th>
              </tr>
            </thead>
            <tbody>
              {#each magazines as magazine}
                <tr>
                  <td class="w-name">
                    <input
                      type="text"
                      list="magazine-options"
                      disabled={isReadOnly}
                      bind:value={magazine.name}
                    />
                  </td>
                  <td class="w-day"
                    ><input
                      type="number"
                      disabled={isReadOnly}
                      bind:value={magazine.mon}
                      use:noScroll
                    /></td
                  >
                  <td class="w-day"
                    ><input
                      type="number"
                      disabled={isReadOnly}
                      bind:value={magazine.tue}
                      use:noScroll
                    /></td
                  >
                  <td class="w-day"
                    ><input
                      type="number"
                      disabled={isReadOnly}
                      bind:value={magazine.wed}
                      use:noScroll
                    /></td
                  >
                  <td class="w-day"
                    ><input
                      type="number"
                      disabled={isReadOnly}
                      bind:value={magazine.thu}
                      use:noScroll
                    /></td
                  >
                  <td class="w-day"
                    ><input
                      type="number"
                      disabled={isReadOnly}
                      bind:value={magazine.fri}
                      use:noScroll
                    /></td
                  >
                  <td class="w-day"
                    ><input
                      type="number"
                      disabled={isReadOnly}
                      bind:value={magazine.sat}
                      use:noScroll
                    /></td
                  >
                  <td class="w-day"
                    ><input
                      type="number"
                      disabled={isReadOnly}
                      bind:value={magazine.sun}
                      use:noScroll
                    /></td
                  >
                  <td class="w-price">
                    <input
                      type="number"
                      step="0.01"
                      class="text-right"
                      disabled={isReadOnly}
                      bind:value={magazine.price}
                      use:noScroll
                    />
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
        <div class="schedule-footer">
          <span
            >Weekly Total for Magazines: <strong>£{weeklyMagazinesTotal}</strong
            ></span
          >
        </div>
      </div>
    </section>

    <section class="form-card combined-totals">
      <div class="grid-layout cols-2-split">
        <div class="field">
          <label for="dc">Delivery Charge (£)</label>
          <input
            id="dc"
            type="number"
            disabled={isReadOnly}
            bind:value={form.deliveryCharge}
            step="0.05"
            use:noScroll
          />
        </div>
        <div class="totals-display-box">
          <span class="total-label">Calculated Weekly Total:</span>
          <span class="total-value">£{Number(finalWeeklyTotal).toFixed(2)}</span
          >
        </div>
      </div>
    </section>
  </div>
</div>

<style>
  .form-container {
    background: #f8f9fa;
    padding: 24px;
    border-radius: 8px;
  }
  .form-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    border-bottom: 2px solid #e9ecef;
    padding-bottom: 12px;
  }
  .form-header h1 {
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
  .accounts-btn,
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
  .accounts-btn {
    background: #9b59b6;
    color: white;
  }
  .danger-btn {
    background: #e74c3c;
    color: white;
  }
  .vertical-stack {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  .form-card {
    background: white;
    padding: 24px;
    border-radius: 8px;
    box-shadow:
      0 1px 3px rgba(0, 0, 0, 0.05),
      0 1px 2px rgba(0, 0, 0, 0.1);
  }
  .form-card h3 {
    margin-top: 0;
    margin-bottom: 20px;
    color: #495057;
    font-size: 16px;
    font-weight: 600;
    border-bottom: 1px solid #dee2e6;
    padding-bottom: 10px;
  }
  .grid-layout {
    display: grid;
    gap: 20px;
    margin-bottom: 20px;
  }
  .grid-layout:last-child {
    margin-bottom: 0;
  }
  .cols-2 {
    grid-template-columns: repeat(2, 1fr);
  }
  .cols-3 {
    grid-template-columns: repeat(3, 1fr);
  }
  .cols-2-split {
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    align-items: end;
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
  input,
  textarea,
  select {
    padding: 10px 14px;
    border: 1px solid #ced4da;
    border-radius: 6px;
    font-size: 14px;
    color: #212529;
    background-color: #fff;
    width: 100%;
    box-sizing: border-box;
    height: 42px;
  }
  textarea {
    height: auto;
  }
  input:focus,
  textarea:focus,
  select:focus {
    outline: none;
    border-color: #a5d8ff;
  }
  input:disabled,
  textarea:disabled,
  select:disabled {
    background-color: #e9ecef;
    color: #495057;
    opacity: 0.9;
    cursor: not-allowed;
  }
  .readonly-input {
    background-color: #f1f3f5;
    font-weight: 500;
  }
  .table-responsive {
    overflow-x: auto;
    border: 1px solid #dee2e6;
    border-radius: 6px;
  }
  .schedule-table {
    width: 100%;
    border-collapse: collapse;
    background: white;
  }
  .schedule-table th {
    font-size: 12px;
    background: #f8f9fa;
    padding: 12px 10px;
    font-weight: 700;
    color: #495057;
    border-bottom: 2px solid #dee2e6;
    text-align: center;
  }
  .schedule-table td {
    padding: 8px;
    border-bottom: 1px solid #dee2e6;
  }
  .schedule-table input {
    padding: 8px;
    text-align: center;
    border-radius: 4px;
    height: 34px;
  }
  .schedule-table .w-name input {
    text-align: left;
  }
  .schedule-table th.text-left {
    text-align: left;
  }
  .schedule-table th.text-right {
    text-align: right;
  }
  .w-name {
    width: 35%;
  }
  .w-day {
    width: 7%;
  }
  .w-price {
    width: 16%;
  }
  .text-right {
    text-align: right;
  }
  .schedule-footer {
    margin-top: 14px;
    text-align: right;
    font-size: 14px;
    color: #495057;
  }
  .combined-totals {
    background: #212529;
  }
  .combined-totals label {
    color: #f8f9fa;
  }
  .totals-display-box {
    background: #2b3035;
    border-radius: 6px;
    padding: 10px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 42px;
    box-sizing: border-box;
    border: 1px solid #343a40;
  }
  .total-label {
    font-size: 14px;
    color: #adb5bd;
    font-weight: 500;
  }
  .total-value {
    color: #2ecc71;
    font-size: 20px;
    font-weight: 700;
  }
  input[type="number"]::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  input[type="number"] {
    -moz-appearance: textfield;
  }

  .section-header {
    display: flex;
    justify-content: space-between; /* Pushes H3 to left, buttons to right */
    align-items: center;
    margin-bottom: 16px;
    border-bottom: 1px solid #dee2e6;
    padding-bottom: 10px;
  }

  /* Remove the bottom border from the typography tag itself */
  .section-header h3 {
    margin: 0;
    border-bottom: none;
    padding-bottom: 0;
  }

  /* Keeps both action buttons close together on the right */
  .button-group {
    display: flex;
    gap: 8px;
  }
  .add-row-btn {
    background: #232b30;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    font-size: 13px;
    transition: background 0.2s ease;
  }
  .add-row-btn:hover:not(:disabled) {
    background: #343a40;
  }

  /* Styled with a clear destructive red theme */
  .delete-row-btn {
    background: #e74c3c;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    font-size: 13px;
    transition: background 0.2s ease;
  }
  .delete-row-btn:hover:not(:disabled) {
    background: #c0392b;
  }
  .add-row-btn:disabled,
  .delete-row-btn:disabled {
    background: #e9ecef;
    color: #adb5bd;
    cursor: not-allowed;
    opacity: 0.7;
  }
  .schedule-table tr.active {
    background-color: #fffaf0;
  }
</style>
