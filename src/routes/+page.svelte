<script>
  import LoginCard from "$lib/LoginCard.svelte";
  import Sidebar from "$lib/Sidebar.svelte";
  import CustomerTable from "$lib/CustomerTable.svelte";
  import CustomerForm from "$lib/CustomerForm.svelte";
  import LedgerGrid from "$lib/LedgerGrid.svelte";
  import WeeklyBreakdown from "$lib/WeeklyBreakdown.svelte";
  import PaymentHistory from "$lib/PaymentHistory.svelte";
  import MonthlyPrintView from "$lib/MonthlyPrintView.svelte";
  import WeeklyPrintView from "$lib/WeeklyPrintView.svelte";
  import IndividualBillView from "$lib/IndividualBillView.svelte";
  import PaperTable from "$lib/PaperTable.svelte";
  import PaperForm from "$lib/PaperForm.svelte";
  import RoundsTable from "$lib/RoundsTable.svelte";
  import RoundForm from "$lib/RoundForm.svelte";
  import DeliveriesDashboard from "$lib/DeliveriesDashboard.svelte";
  import DeliveryNotePrintView from "$lib/DeliveryNotePrintView.svelte";

  let isAuthenticated = $state(false);
  let activeTab = $state("dashboard");
  let customerList = $state([]);
  let selectedCustomer = $state(null); // Holds the complete active context

  let paperList = $state([]);
  let selectedPaper = $state(null); // Holds the complete active context

  let roundList = $state([]);
  let selectedRound = $state(null); // Holds the complete active context

  let ledgerWeeks = $state([]);
  let activeSelectedWeek = $state(null);
  let paymentHistoryList = $state([]);

  // Deliveries sub-view selection state tracking
  let deliveriesSubView = $state("menu"); // "menu", "weekly", "monthly"
  let monthlyBillsData = $state([]); // Holds processed raw backend rows for all active accounts
  let weeklyBillsData = $state([]); // Holds processed raw backend rows for all active accounts
  let deliveryNoteData = $state(null);

  // Confirmation Modal state controls
  let showConfirmModal = $state(false);
  let isSubmitting = $state(false);
  let addFromYearStart = $state(false);

  // Single Invoice Print Controller States
  let isSingleBillOpen = $state(false);
  let targetSingleCustomer = $state(null);

  let totalDue = $derived(
    ledgerWeeks
      .filter((w) => {
        const weekDate = new Date(w.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return weekDate < today;
      })
      .reduce(
        (sum, w) => (w.status !== "paid" ? sum + w.outstandingAmount : sum),
        0,
      ),
  );

  let totalDueTillSelectedWeek = $derived(
    ledgerWeeks.reduce((sum, w) => {
      if (activeSelectedWeek) {
        const weekDate = new Date(w.date);
        const selectedDate = new Date(activeSelectedWeek.date);

        if (weekDate <= selectedDate && w.status !== "paid") {
          if (w.outstandingAmount !== null) {
            return sum + w.outstandingAmount;
          } else {
            return sum + w.defaultWeeklyTotal;
          }
        }
      }
      return sum;
    }, 0),
  );

  // Voucher Modal State Controls
  let showVoucherModal = $state(false);
  let firstWeek = $state(null);
  let description = $state("");
  let numberOfWeeks = $state(null);
  let creditPerWeek = $state(null);

  let showPaymentModal = $state(false);
  let amountPaid = $state(totalDueTillSelectedWeek.toFixed(2));

  let showMonthlyBillingDialog = $state(false);
  let showWeeklyBillingDialog = $state(false);

  // Get real-time calendar thresholds
  const currentYear = new Date().getFullYear();
  const currentMonthNumber = new Date().getMonth() + 1;

  const dynamicYears = [currentYear - 2, currentYear - 1, currentYear];

  const allMonths = [
    { value: 1, name: "January" },
    { value: 2, name: "February" },
    { value: 3, name: "March" },
    { value: 4, name: "April" },
    { value: 5, name: "May" },
    { value: 6, name: "June" },
    { value: 7, name: "July" },
    { value: 8, name: "August" },
    { value: 9, name: "September" },
    { value: 10, name: "October" },
    { value: 11, name: "November" },
    { value: 12, name: "December" },
  ];

  // If current year is selected, filter out future months. Otherwise, show all 12.
  let availableMonths = $derived(
    selectedYear === currentYear
      ? allMonths.filter((m) => m.value <= currentMonthNumber)
      : allMonths,
  );

  // Input Form State (Initially bound to current parameters)
  let selectedYear = $state(currentYear);
  let selectedMonth = $state(currentMonthNumber);
  let selectedWeekDate = $state(null);
  let customNoteText = $state("");

  let selectedDeliveryNoteDate = $state(null);

  $effect(() => {
    if (activeSelectedWeek) {
      totalDueTillSelectedWeek = ledgerWeeks.reduce((sum, w) => {
        if (activeSelectedWeek) {
          const weekDate = new Date(w.date);
          const selectedDate = new Date(activeSelectedWeek.date);

          if (weekDate <= selectedDate && w.status !== "paid") {
            if (w.outstandingAmount !== null) {
              return sum + w.outstandingAmount;
            } else {
              return sum + w.defaultWeeklyTotal;
            }
          }
        }
        return sum;
      }, 0);
      amountPaid = totalDueTillSelectedWeek.toFixed(2);
    }
  });

  function closePaymentModal() {
    showPaymentModal = false;
    // Reset form entries on close
    amountPaid = totalDueTillSelectedWeek.toFixed(2);
    // activeSelectedWeek = null;
  }

  function handleSavePayment() {
    const payload = {
      acNo: selectedCustomer.acNo,
      amountPaid: amountPaid,
    };
    savePayment(payload);
    closePaymentModal();
  }

  function closeVoucherModal() {
    showVoucherModal = false;
    // Reset form entries on close
    description = "";
    numberOfWeeks = null;
    creditPerWeek = null;
  }

  function handleSaveVoucher() {
    const payload = {
      acNo: selectedCustomer.acNo,
      firstWeek: activeSelectedWeek.date,
      description: description,
      numberOfWeeks: Number(numberOfWeeks),
      creditPerWeek: Number(creditPerWeek),
    };
    saveVoucher(payload);
    closeVoucherModal();
  }

  async function loadCustomers() {
    try {
      const response = await fetch("http://localhost:8080/api/customers/all");
      if (response.ok) customerList = await response.json();
    } catch (err) {
      console.error("Failed to load customers:", err);
    }
  }

  async function loadPapers() {
    try {
      const response = await fetch("http://localhost:8080/api/papers/all");
      if (response.ok) paperList = await response.json();
    } catch (err) {
      console.error("Failed to load papers:", err);
    }
  }

  async function loadRounds() {
    try {
      const response = await fetch("http://localhost:8080/api/rounds/all");
      if (response.ok) roundList = await response.json();
    } catch (err) {
      console.error("Failed to load rounds:", err);
    }
  }

  function triggerNativePrint() {
    window.print();
  }

  async function saveCustomer(customerData) {
    try {
      const res = await fetch("http://localhost:8080/api/customers/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customerData),
      });
      if (res.ok) {
        alert("Customer saved successfully!");
        activeTab = "customers";
        loadCustomers();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function savePaper(paperData) {
    try {
      const res = await fetch("http://localhost:8080/api/papers/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paperData),
      });
      if (res.ok) {
        alert("Paper saved successfully!");
        activeTab = "papers";
        loadPapers();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function saveRound(roundData) {
    try {
      const res = await fetch("http://localhost:8080/api/rounds/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(roundData),
      });
      if (res.ok) {
        alert("Round saved successfully!");
        activeTab = "rounds";
        loadRounds();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function updateCustomer(customerData) {
    try {
      const res = await fetch(
        `http://localhost:8080/api/customers/update/${customerData.acNo}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(customerData),
        },
      );
      if (res.ok) {
        alert("Customer saved successfully!");
        selectedCustomer = customerData;
        if (activeTab === "view-customer") {
          activeTab = "after-update-customer";
        } else {
          activeTab = "view-customer";
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function updatePaper(paperData) {
    try {
      const res = await fetch(
        `http://localhost:8080/api/papers/update/${paperData.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(paperData),
        },
      );
      if (res.ok) {
        alert("Paper saved successfully!");
        selectedPaper = paperData;
        if (activeTab === "view-paper") {
          activeTab = "after-update-paper";
        } else {
          activeTab = "view-paper";
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function updateRound(roundData) {
    try {
      const res = await fetch(
        `http://localhost:8080/api/rounds/update/${roundData.round}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(roundData),
        },
      );
      if (res.ok) {
        alert("Round saved successfully!");
        selectedRound = roundData;
        if (activeTab === "view-round") {
          activeTab = "after-update-round";
        } else {
          activeTab = "view-round";
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function deleteCustomer(form) {
    if (confirm(`Delete ${form.forename} ${form.surname}?`)) {
      const res = await fetch(
        `http://localhost:8080/api/customers/delete/${form.acNo}`,
        { method: "DELETE" },
      );
      if (res.ok) {
        activeTab = "customers";
        loadCustomers();
      }
    }
  }

  async function deletePaper(paperData) {
    if (confirm(`Delete ${paperData.name}?`)) {
      const res = await fetch(
        `http://localhost:8080/api/papers/delete/${paperData.id}`,
        { method: "DELETE" },
      );
      if (res.ok) {
        activeTab = "papers";
        loadPapers();
      }
    }
  }

  async function deleteRound(roundData) {
    if (confirm(`Delete ${roundData.round}?`)) {
      const res = await fetch(
        `http://localhost:8080/api/rounds/delete/${roundData.round}`,
        { method: "DELETE" },
      );
      if (res.ok) {
        activeTab = "rounds";
        loadRounds();
      }
    }
  }

  async function fetchLedger(acNo) {
    try {
      // Extract the current calendar year dynamically
      const currentYear = new Date().getFullYear();
      const res = await fetch(
        `http://localhost:8080/api/ledger/${String(acNo).trim()}/${currentYear}`,
      );
      if (res.ok) {
        const rawWeeks = await res.json();

        // Map through the collection and update outstandingAmount for each week object
        ledgerWeeks = rawWeeks;
        activeSelectedWeek = null;
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function confirmAddSubscription() {
    if (!activeSelectedWeek || !selectedCustomer) return;
    isSubmitting = true;
    try {
      const payload = {
        acNo: selectedCustomer.acNo,
        weekDate: activeSelectedWeek.date,
        outstandingAmount: activeSelectedWeek.amount,
        addFromYearStart: addFromYearStart,
      };

      const res = await fetch(
        "http://localhost:8080/api/ledger/add-subscription",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      if (res.ok) {
        alert(
          "Subscription successfully configured for the chosen calendar week sequence.",
        );
        showConfirmModal = false;
        await fetchLedger(selectedCustomer.acNo);
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(
          `Failed to add subscription: ${errData.message || res.statusText}`,
        );
      }
    } catch (err) {
      console.error("Subscription Error:", err);
      alert(
        "A communications error occurred while validating database persistence rows.",
      );
    } finally {
      isSubmitting = false;
    }
  }

  async function handleSaveBreakdownUpdate(updatedPayload) {
    try {
      const res = await fetch(
        "http://localhost:8080/api/ledger/update-subscription",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            acNo: selectedCustomer.acNo,
            ...updatedPayload,
          }),
        },
      );
      if (res.ok) {
        alert("Weekly breakdown itemizations updated and saved successfully!");
        activeTab = "ledger";
        await fetchLedger(selectedCustomer.acNo);
      } else {
        alert("Failed to update breakdown entry settings data rows.");
      }
    } catch (err) {
      console.error(err);
      alert("Error sync payload variables across target endpoints.");
    }
  }

  async function saveVoucher(voucherPayload) {
    try {
      const res = await fetch("http://localhost:8080/api/ledger/add-voucher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...voucherPayload,
        }),
      });
      if (res.ok) {
        alert("Voucher applied successfully!");
        activeTab = "ledger";
        await fetchLedger(selectedCustomer.acNo);
      } else {
        alert("Failed to apply voucher.");
      }
    } catch (err) {
      console.error(err);
      alert("Error sync payload variables across target endpoints.");
    }
  }

  async function savePayment(payload) {
    try {
      const res = await fetch("http://localhost:8080/api/payment/add-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
        }),
      });
      if (res.ok) {
        alert("Payment processed successfully!");
        activeTab = "ledger";
        await fetchLedger(selectedCustomer.acNo);
      } else {
        alert("Failed to process payment.");
      }
    } catch (err) {
      console.error(err);
      alert("Error sync payload variables across target endpoints.");
    }
  }

  function handleViewPaymentHistory() {
    getPaymentHistory(selectedCustomer.acNo);
    activeTab = "payment-history";
  }

  async function getPaymentHistory(acNo) {
    try {
      const currentYear = new Date().getFullYear();
      const res = await fetch(
        `http://localhost:8080/api/payment/get-history/${String(acNo).trim()}/${currentYear}`,
      );
      if (res.ok) {
        paymentHistoryList = await res.json();
      }
    } catch (err) {
      console.error("Failed to load payment history:", err);
    }
  }

  async function handleMonthlyBillGenerate({ year, month, note }) {
    showMonthlyBillingDialog = false;
    selectedYear = year;
    selectedMonth = month;
    customNoteText = note;
    try {
      const response = await fetch(
        `http://localhost:8080/api/billing/monthly-bills/${selectedYear}/${selectedMonth}`,
      );
      if (!response.ok)
        throw new Error("Failed to fetch bill metrics from server");

      const baseInvoiceList = await response.json();

      const customersInvoiceList = baseInvoiceList.map((invoice) => ({
        ...invoice,
        customNote: customNoteText,
      }));

      monthlyBillsData = customersInvoiceList;

      deliveriesSubView = "monthly";
    } catch (error) {
      console.error("Billing Generation Error:", error);
    }
  }

  async function handleWeeklyBillGenerate({ weekDate }) {
    showWeeklyBillingDialog = false;
    selectedWeekDate = weekDate;
    try {
      const response = await fetch(
        `http://localhost:8080/api/billing/weekly-bill/${selectedWeekDate}`,
      );
      if (!response.ok)
        throw new Error("Failed to fetch bill metrics from server");

      const baseInvoiceList = await response.json();

      const customersInvoiceList = baseInvoiceList.map((invoice) => ({
        ...invoice,
      }));

      weeklyBillsData = customersInvoiceList;

      deliveriesSubView = "weekly";
    } catch (error) {
      console.error("Billing Generation Error:", error);
    }
  }

  async function handleDeliveryNoteGenerate({ date }) {
    try {
      selectedDeliveryNoteDate = date;
      const response = await fetch(
        `http://localhost:8080/api/deliveries/delivery-note/${selectedDeliveryNoteDate}`,
      );
      if (response.ok) {
        deliveryNoteData = await response.json();
        deliveriesSubView = "delivery-note";
      }
    } catch (err) {
      console.error("Error fetching delivery note:", err);
    }
  }

  // Handler function triggered by the existing list action button
  function triggerSingleBillView(customer) {
    targetSingleCustomer = customer;
    isSingleBillOpen = true;
  }

  $effect(() => {
    if (activeTab === "customers" && isAuthenticated) {
      loadCustomers();
      loadPapers();
    }
    if (activeTab === "papers" && isAuthenticated) {
      loadPapers();
    }
    if (activeTab === "rounds" && isAuthenticated) {
      loadRounds();
    }
    if (activeTab === "deliveries") {
      deliveriesSubView = "menu";
    }
    if (selectedYear === currentYear && selectedMonth > currentMonthNumber) {
      selectedMonth = currentMonthNumber;
    }
  });

  // Action helper function
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
</script>

{#if !isAuthenticated}
  <LoginCard onLoginSuccess={() => (isAuthenticated = true)} />
{:else if activeTab === "deliveries" && deliveriesSubView === "monthly"}
  <MonthlyPrintView
    customersInvoiceList={monthlyBillsData}
    onBack={() => {
      (activeTab = "deliveries"), (deliveriesSubView = "menu");
    }}
  />
{:else if activeTab === "deliveries" && deliveriesSubView === "weekly"}
  <WeeklyPrintView
    billingData={weeklyBillsData}
    selectedDate={selectedWeekDate}
    onBack={() => (deliveriesSubView = "menu")}
  />
{:else if activeTab === "deliveries" && deliveriesSubView === "delivery-note"}
  <DeliveryNotePrintView
    data={deliveryNoteData}
    selectedDate={selectedDeliveryNoteDate}
    onBack={() => (deliveriesSubView = "menu")}
  />
{:else}
  <div class="dashboard-wrapper">
    <Sidebar
      {activeTab}
      onNavigate={(tab) => (activeTab = tab)}
      onLogout={() => {
        (isAuthenticated = false), (activeTab = "dashboard");
      }}
    />

    <main class="main-content">
      {#if activeTab === "dashboard"}
        <div class="welcome-card">
          <h1>Dashboard Overview</h1>
          <p>
            Select customer options or rounds menu on the sidebar to get
            started.
          </p>
        </div>
      {:else if activeTab === "deliveries"}
        <DeliveriesDashboard
          onOpenWeekly={handleWeeklyBillGenerate}
          onOpenMonthly={handleMonthlyBillGenerate}
          onOpenDeliveryNote={handleDeliveryNoteGenerate}
        />
      {:else if activeTab === "customers"}
        <CustomerTable
          {customerList}
          onViewCustomer={(cust) => {
            selectedCustomer = cust;
            activeTab = "view-customer";
          }}
          onPrepareNew={() => (activeTab = "add-customer")}
          onBackToDashboard={() => (activeTab = "dashboard")}
        />
      {:else if activeTab === "add-customer"}
        <CustomerForm
          mode="add"
          onSave={saveCustomer}
          {paperList}
          onBack={() => (activeTab = "customers")}
        />
      {:else if activeTab === "view-customer"}
        <CustomerForm
          mode="view"
          customerData={selectedCustomer}
          {paperList}
          onUpdate={updateCustomer}
          onDelete={deleteCustomer}
          onOpenLedger={(acNo) => {
            fetchLedger(acNo);
            activeTab = "ledger";
          }}
          onBack={() => (activeTab = "customers")}
        />
      {:else if activeTab === "after-update-customer"}
        <CustomerForm
          mode="view"
          customerData={selectedCustomer}
          {paperList}
          onUpdate={updateCustomer}
          onDelete={deleteCustomer}
          onOpenLedger={(acNo) => {
            fetchLedger(acNo);
            activeTab = "ledger";
          }}
          onBack={() => (activeTab = "customers")}
        />
      {:else if activeTab === "papers"}
        <PaperTable
          {paperList}
          onViewPaper={(paper) => {
            selectedPaper = paper;
            activeTab = "view-paper";
          }}
          onPrepareNew={() => (activeTab = "add-paper")}
          onBackToDashboard={() => (activeTab = "dashboard")}
        />
      {:else if activeTab === "add-paper"}
        <PaperForm
          mode="add"
          onSave={savePaper}
          onBack={() => (activeTab = "papers")}
        />
      {:else if activeTab === "view-paper"}
        <PaperForm
          mode="view"
          paperData={selectedPaper}
          onUpdate={updatePaper}
          onDelete={deletePaper}
          onSave={savePaper}
          onBack={() => (activeTab = "papers")}
        />
      {:else if activeTab === "after-update-paper"}
        <PaperForm
          mode="view"
          paperData={selectedPaper}
          onUpdate={updatePaper}
          onDelete={deletePaper}
          onSave={savePaper}
          onBack={() => (activeTab = "papers")}
        />
      {:else if activeTab === "rounds"}
        <RoundsTable
          {roundList}
          onViewRound={(round) => {
            selectedRound = round;
            activeTab = "view-round";
          }}
          onRoundNew={() => (activeTab = "add-round")}
          onBackToDashboard={() => (activeTab = "dashboard")}
        />
      {:else if activeTab === "add-round"}
        <RoundForm
          mode="add"
          onSave={saveRound}
          onBack={() => (activeTab = "rounds")}
        />
      {:else if activeTab === "view-round"}
        <RoundForm
          mode="view"
          roundData={selectedRound}
          onUpdate={updateRound}
          onDelete={deleteRound}
          onBack={() => (activeTab = "rounds")}
        />
      {:else if activeTab === "after-update-round"}
        <RoundForm
          mode="view"
          roundData={selectedRound}
          onUpdate={updateRound}
          onDelete={deleteRound}
          onBack={() => (activeTab = "rounds")}
        />
      {:else if activeTab === "ledger"}
        <div class="ledger-container-inline">
          <div class="ledger-header">
            <h2>Accounts Ledger View</h2>
            <button
              class="back-btn"
              onclick={() => (activeTab = "view-customer")}
              >← Back to Profile</button
            >
            <button class="action-btn" onclick={handleViewPaymentHistory}
              >📜 View Payment History</button
            >
            <button
              class="action-btn"
              onclick={() => triggerSingleBillView(selectedCustomer)}
              >Generate Bill</button
            >
          </div>

          <div class="info-section">
            <div class="customer-meta-left">
              <span class="meta-label"
                >Account No: <strong class="meta-highlight"
                  >{selectedCustomer?.acNo || "N/A"}</strong
                ></span
              >
              <span class="meta-label"
                >Name: <strong class="meta-highlight"
                  >{selectedCustomer?.title || ""}
                  {selectedCustomer?.forename || ""}
                  {selectedCustomer?.surname || ""}</strong
                ></span
              >
            </div>

            <div class="total-due-right">
              <span class="due-label">Total Due:</span>
              <span class="val-box">£{totalDue.toFixed(2)}</span>
            </div>
          </div>

          <div class="split-ledger-layout">
            <div class="grid-view-column">
              <LedgerGrid
                weeks={ledgerWeeks}
                onSelectWeek={(w) => (activeSelectedWeek = w)}
              />
            </div>

            <div class="actions-sidebar-panel">
              {#if activeSelectedWeek}
                <div class="sticky-action-card">
                  <div class="selected-week-info">
                    <h4>Selected Week Details</h4>
                    <p>
                      <strong>Date:</strong>
                      {new Date(activeSelectedWeek.date).toLocaleDateString(
                        undefined,
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        },
                      )}
                    </p>
                    <p>
                      <strong>Est. Amount Due:</strong>
                      £ {totalDueTillSelectedWeek.toFixed(2)} (Till selected week)
                    </p>
                    <p>
                      <strong>Status:</strong>
                      {activeSelectedWeek.status
                        ? activeSelectedWeek.status.toUpperCase()
                        : "NOT SUBSCRIBED"}
                    </p>
                  </div>
                  <div class="action-buttons-group">
                    {#if activeSelectedWeek.outstandingAmount !== null}
                      <button
                        class="menu-action-btn secondary"
                        onclick={() => (activeTab = "weekly-breakdown")}
                        >📊 View Breakdown</button
                      >
                    {:else}
                      <button
                        class="menu-action-btn secondary"
                        onclick={() => (showConfirmModal = true)}
                        >➕ Add Subscription</button
                      >
                    {/if}
                    <button
                      class="menu-action-btn secondary"
                      onclick={() => (showVoucherModal = true)}
                    >
                      🎫 Record Voucher</button
                    >
                    <button
                      class="menu-action-btn secondary"
                      onclick={() => (showPaymentModal = true)}
                      >💳 Make Payment</button
                    >
                  </div>
                </div>
              {:else}
                <div class="empty-action-card">
                  <p>
                    Select any calendar week card cell to reveal payment &
                    modifications utilities.
                  </p>
                </div>
              {/if}
            </div>
          </div>
        </div>
      {:else if activeTab === "payment-history"}
        <PaymentHistory
          {paymentHistoryList}
          {selectedCustomer}
          onBack={() => (activeTab = "ledger")}
        />
      {:else if activeTab === "weekly-breakdown"}
        <WeeklyBreakdown
          weekData={activeSelectedWeek}
          customerData={selectedCustomer}
          onBack={() => {
            (activeTab = "ledger"),
              (activeSelectedWeek = null),
              fetchLedger(selectedCustomer.acNo);
          }}
          onUpdateSave={handleSaveBreakdownUpdate}
        />
      {/if}
    </main>
  </div>
{/if}

{#if showConfirmModal}
  <div class="modal-overlay">
    <div class="modal-box">
      <h3>Confirm Subscription</h3>
      <p>
        Are you sure you want to initialize and save a new subscription record
        entry for the selected row?
      </p>
      <div class="modal-summary">
        <div>
          <strong>Account Profile:</strong>
          {selectedCustomer?.forename}
          {selectedCustomer?.surname} ({selectedCustomer?.acNo})
        </div>
        <div>
          <strong>Target Week Date:</strong>
          {new Date(activeSelectedWeek?.date).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
        <div>
          <strong>Estimated Cost Base:</strong>
          £{activeSelectedWeek?.defaultWeeklyTotal.toFixed(2)}
        </div>
      </div>
      <div class="modal-footer-actions">
        <label for="confirmCheckbox" class="checkbox-wrapper">
          <input
            type="checkbox"
            id="confirmCheckbox"
            bind:checked={addFromYearStart}
            disabled={isSubmitting}
          />
          Add subscription from year start
        </label>
        <button
          class="modal-btn cancel"
          disabled={isSubmitting}
          onclick={() => (showConfirmModal = false)}>Cancel</button
        >
        <button
          class="modal-btn confirm"
          disabled={isSubmitting}
          onclick={confirmAddSubscription}
        >
          {isSubmitting ? "Processing..." : "Confirm Save"}
        </button>
      </div>
    </div>
  </div>
{/if}

{#if showVoucherModal}
  <div class="modal-overlay animate-fade-in">
    <div class="voucher-modal-box">
      <div class="voucher-modal-header">
        <h2>Record Vouchers</h2>
        <button
          onclick={closeVoucherModal}
          class="voucher-close-x-btn"
          aria-label="Close dialog">✕</button
        >
      </div>

      <div class="voucher-modal-body">
        <div class="voucher-form-row">
          <label for="firstWeek">First week:</label>
          <div class="voucher-input-wrapper">
            <input
              id="firstWeek"
              type="text"
              bind:value={activeSelectedWeek.date}
              disabled
              class="voucher-input-disabled"
            />
          </div>
        </div>

        <div class="voucher-form-row">
          <label for="description">Description:</label>
          <div class="voucher-input-wrapper custom-highlight">
            <input
              id="description"
              type="text"
              bind:value={description}
              placeholder="Enter voucher description..."
              class="voucher-input-highlighted"
            />
          </div>
        </div>

        <div class="voucher-form-row">
          <label for="numWeeks">Number of weeks:</label>
          <div class="voucher-input-split">
            <input
              id="numWeeks"
              type="number"
              min="1"
              bind:value={numberOfWeeks}
              placeholder="0"
              class="voucher-input-small"
              use:noScroll
            />
            <!-- <div class="voucher-meta-filler">
							Multi-week distribution
						</div> -->
          </div>
        </div>

        <div class="voucher-form-row">
          <label for="credit">Credit per week:</label>
          <div class="voucher-input-split">
            <div class="currency-input-container">
              <span class="currency-symbol">£</span>
              <input
                id="credit"
                type="number"
                step="0.05"
                min="0"
                bind:value={creditPerWeek}
                placeholder="0.00"
                class="voucher-input-currency"
                use:noScroll
              />
            </div>
            <div class="currency-input-container">
              <input
                id="totalCredit"
                type="number"
                disabled="true"
                value={numberOfWeeks && creditPerWeek
                  ? (numberOfWeeks * creditPerWeek).toFixed(2)
                  : "0.00"}
                placeholder="0.00"
                class="voucher-input-currency"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="voucher-modal-footer">
        <button
          onclick={closeVoucherModal}
          type="button"
          class="v-btn v-btn-secondary">Cancel</button
        >
        <button
          onclick={handleSaveVoucher}
          type="button"
          class="v-btn v-btn-primary">Save Changes</button
        >
      </div>
    </div>
  </div>
{/if}

{#if showPaymentModal}
  <div class="modal-overlay animate-fade-in">
    <div class="voucher-modal-box">
      <div class="voucher-modal-header">
        <h2>Record Payment</h2>
        <button
          onclick={closePaymentModal}
          class="voucher-close-x-btn"
          aria-label="Close dialog">✕</button
        >
      </div>

      <div class="voucher-modal-body">
        <div class="voucher-form-row">
          <label for="paymentAmount">Payment Amount:</label>
          <div class="voucher-input-split">
            <div class="currency-input-container">
              <span class="currency-symbol">£</span>
              <input
                id="paymentAmount"
                type="number"
                step="0.05"
                min="0"
                bind:value={amountPaid}
                placeholder="0.00"
                class="voucher-input-currency"
                use:noScroll
              />
            </div>
          </div>
        </div>
      </div>

      <div class="voucher-modal-footer">
        <button
          onclick={closePaymentModal}
          type="button"
          class="v-btn v-btn-secondary">Cancel</button
        >
        <button
          onclick={handleSavePayment}
          type="button"
          class="v-btn v-btn-primary">Save Payment</button
        >
      </div>
    </div>
  </div>
{/if}

<IndividualBillView
  customer={targetSingleCustomer}
  bind:isOpen={isSingleBillOpen}
  onClose={(acNo) => fetchLedger(acNo)}
/>

<style>
  :global(body) {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
      Helvetica, Arial, sans-serif;
    background: #f1f3f5;
  }

  .dashboard-wrapper {
    display: flex;
    min-height: 100vh;
  }

  .main-content {
    flex: 1;
    padding: 30px;
    background: #f8f9fa;
    overflow-y: auto;
  }

  .welcome-card {
    background: white;
    padding: 40px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  .ledger-container-inline {
    background: #1e272e;
    color: #fff;
    padding: 20px;
    border-radius: 8px;
  }

  .ledger-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #3d4e5d;
    padding-bottom: 10px;
    margin-bottom: 25px;
    gap: 12px;
  }

  .action-btn,
  .back-btn {
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    font-size: 14px;
    transition: background 0.2s ease;
  }

  .back-btn {
    background: #34495e;
    color: white;
  }

  .action-btn {
    background: #3498db;
    color: white;
  }

  .info-section {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #2c3e50;
    padding: 16px 24px;
    border-radius: 6px;
    margin-bottom: 20px;
  }

  .customer-meta-left {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .meta-label {
    font-size: 14px;
    color: #95a5a6;
  }

  .meta-highlight {
    color: #ffffff;
    font-weight: 600;
    margin-left: 4px;
  }

  .total-due-right {
    display: flex;
    align-items: center;
    gap: 15px;
  }

  .due-label {
    font-size: 15px;
    font-weight: 500;
    color: #ced4da;
  }

  .val-box {
    background: #fff;
    color: #2c3e50;
    padding: 6px 16px;
    border-radius: 6px;
    font-weight: bold;
    font-size: 16px;
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.2);
  }

  .split-ledger-layout {
    display: grid;
    grid-template-columns: 1fr 280px;
    gap: 20px;
    align-items: start;
    margin-bottom: 30px;
  }

  .grid-view-column {
    overflow-x: auto;
  }

  .actions-sidebar-panel {
    background: #2c3e50;
    border-radius: 6px;
    min-height: 300px;
    border: 1px solid #34495e;
  }

  .empty-action-card {
    padding: 40px 20px;
    text-align: center;
    color: #bdc3c7;
    font-size: 13px;
    line-height: 1.5;
  }

  .sticky-action-card {
    padding: 20px;
  }

  .selected-week-info {
    background: #1e272e;
    padding: 12px;
    border-radius: 4px;
    margin-bottom: 20px;
    border-left: 4px solid #3498db;
  }

  .selected-week-info h4 {
    margin: 0 0 10px 0;
    font-size: 14px;
    color: #ecf0f1;
  }

  .selected-week-info p {
    margin: 5px 0;
    font-size: 13px;
    color: #bdc3c7;
  }

  .action-buttons-group {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .menu-action-btn {
    width: 100%;
    padding: 12px;
    border: none;
    border-radius: 4px;
    font-weight: 600;
    font-size: 13px;
    text-align: left;
    cursor: pointer;
    color: white;
    transition: background 0.15s ease;
  }

  .menu-action-btn.secondary {
    background: #3498db;
  }
  .menu-action-btn.secondary:hover {
    background: #2980b9;
  }

  /* Modal Basic View Layout Overlays */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(15, 23, 42, 0.75);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  }

  .modal-box {
    background: #2c3e50;
    color: #fff;
    padding: 24px;
    border-radius: 8px;
    width: 450px;
    max-width: 90%;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    border: 1px solid #34495e;
  }

  .modal-box h3 {
    margin-top: 0;
    font-size: 18px;
    border-bottom: 1px solid #34495e;
    padding-bottom: 10px;
    color: #e67e22;
  }

  .modal-summary {
    background: #1e272e;
    padding: 12px;
    border-radius: 4px;
    font-size: 13px;
    line-height: 1.6;
    margin: 15px 0;
    color: #ecf0f1;
    border-left: 3px solid #e67e22;
  }

  .modal-footer-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 20px;
  }

  .checkbox-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: #ecf0f1;
    margin-right: auto; /* Pushes buttons to the right while pinning checkbox to left */
    cursor: pointer;
  }

  .checkbox-wrapper input[type="checkbox"] {
    cursor: pointer;
  }

  .modal-btn {
    padding: 10px 16px;
    border: none;
    border-radius: 4px;
    font-weight: 600;
    font-size: 13px;
    cursor: pointer;
  }

  .modal-btn.cancel {
    background: #7f8c8d;
    color: white;
  }
  .modal-btn.cancel:hover {
    background: #95a5a6;
  }

  .modal-btn.confirm {
    background: #2ecc71;
    color: white;
  }
  .modal-btn.confirm:hover:not(:disabled) {
    background: #27ae60;
  }
  .modal-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* EXPLICIT DESIGN STYLES FOR RECORD VOUCHERS DIALOG WINDOW */
  .voucher-modal-box {
    background: linear-gradient(to bottom, #2d3748, #1a202c);
    width: 540px;
    max-width: 95%;
    border-radius: 12px;
    border: 1px solid #4a5568;
    box-shadow:
      0 20px 25px -5px rgba(0, 0, 0, 0.4),
      0 10px 10px -5px rgba(0, 0, 0, 0.4);
    overflow: hidden;
    color: #edf2f7;
  }

  .voucher-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    background-color: #1a202c;
    border-bottom: 1px solid #4a5568;
  }

  .voucher-modal-header h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #22d3ee;
    letter-spacing: 0.5px;
  }

  .voucher-close-x-btn {
    background: none;
    border: none;
    color: #a0aec0;
    font-size: 16px;
    cursor: pointer;
    padding: 4px;
    border-radius: 6px;
    transition: all 0.15s ease;
  }
  .voucher-close-x-btn:hover {
    color: #fff;
    background-color: #2d3748;
  }

  .voucher-modal-body {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .voucher-form-row {
    display: grid;
    grid-template-columns: 140px 1fr;
    align-items: center;
    gap: 16px;
  }

  .voucher-form-row label {
    font-size: 14px;
    font-weight: 500;
    color: #e2e8f0;
  }

  .voucher-input-wrapper {
    width: 100%;
  }

  .voucher-input-disabled {
    width: 100%;
    background-color: rgba(10, 15, 30, 0.5);
    color: #a0aec0;
    border: 1px solid #2d3748;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 14px;
    box-sizing: border-box;
    cursor: not-allowed;
  }

  /* Highlights focus design matching original UI color values */
  .custom-highlight {
    position: relative;
    display: flex;
    align-items: center;
  }

  .voucher-input-highlighted {
    width: 100%;
    background-color: #edf4f5;
    color: #0f172a;
    font-weight: 600;
    border: 1px solid #0b0b0b;
    padding: 8px 28px;
    border-radius: 6px;
    font-size: 14px;
    box-sizing: border-box;
    box-shadow: 0 0 12px rgba(34, 211, 238, 0.2);
  }
  .voucher-input-highlighted::placeholder {
    color: rgba(15, 23, 42, 0.5);
  }
  .voucher-input-highlighted:focus {
    outline: none;
    border-color: #22d3ee;
  }

  .voucher-input-split {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .voucher-input-small {
    width: 80px;
    background-color: #edf4f5;
    border: 1px solid #4a5568;
    color: #060606;
    padding: 8px;
    border-radius: 6px;
    text-align: center;
    font-size: 14px;
  }
  .voucher-input-small:focus {
    outline: none;
    border-color: #22d3ee;
  }

  .voucher-meta-filler {
    flex: 1;
    background-color: rgba(15, 23, 42, 0.3);
    border: 1px dashed #4a5568;
    border-radius: 6px;
    height: 34px;
    display: flex;
    align-items: center;
    padding-left: 12px;
    font-size: 12px;
    color: #718096;
    font-style: italic;
  }

  .currency-input-container {
    position: relative;
    display: flex;
    align-items: center;
    width: 120px;
  }

  .currency-symbol {
    position: absolute;
    left: 10px;
    color: #0b0b0b;
    font-weight: 600;
    font-size: 14px;
  }

  .voucher-input-currency {
    width: 100%;
    background-color: #edf4f5;
    border: 1px solid #4a5568;
    color: #0b0b0b;
    padding: 8px 10px 8px 24px;
    border-radius: 6px;
    font-size: 14px;
    text-align: right;
  }
  .currency-input-container:focus-within .voucher-input-currency {
    outline: none;
    border-color: #22d3ee;
  }

  .voucher-modal-footer {
    padding: 16px 24px;
    background-color: #1a202c;
    border-top: 1px solid #4a5568;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }

  .v-btn {
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 500;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.15s ease;
    border: none;
  }

  .v-btn-secondary {
    background-color: #4a5568;
    color: #e2e8f0;
  }
  .v-btn-secondary:hover {
    background-color: #718096;
    color: #fff;
  }

  .v-btn-primary {
    background-color: #06b6d4;
    color: #0f172a;
    font-weight: 600;
  }
  .v-btn-primary:hover {
    background-color: #22d3ee;
  }

  .animate-fade-in {
    animation: fadeIn 0.15s ease-out forwards;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: scale(0.98);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  /* Deliveries Hub Sub-Navigation UI Styles */
  .deliveries-menu-container {
    background: white;
    border-radius: 10px;
    padding: 35px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04);
  }
  .deliveries-menu-container h2 {
    margin: 0 0 5px 0;
    font-size: 24px;
    color: #1e293b;
  }
  .section-subtitle {
    color: #64748b;
    margin: 0 0 30px 0;
    font-size: 14px;
  }
  .billing-options-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }
  .billing-card-btn {
    background: #f8fafc;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    padding: 30px;
    text-align: left;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
  }
  .billing-card-btn:hover {
    transform: translateY(-2px);
    border-color: #cbd5e1;
    background: #f1f5f9;
  }
  .billing-card-btn.highlight {
    border-color: #bae6fd;
    background: #f0f9ff;
  }
  .billing-card-btn.highlight:hover {
    background: #e0f2fe;
    border-color: #7dd3fc;
  }
  .card-icon {
    font-size: 32px;
    margin-bottom: 12px;
  }
  .billing-card-btn h3 {
    margin: 0 0 8px 0;
    font-size: 18px;
    color: #0f172a;
  }
  .billing-card-btn p {
    margin: 0;
    font-size: 13px;
    color: #64748b;
    line-height: 1.5;
  }
  /* === COMPACT POPUP MODAL ENHANCED UI OVERLAY === */
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(
      15,
      23,
      42,
      0.65
    ) !important; /* Semi-transparent dim layer */
    backdrop-filter: blur(4px);
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    z-index: 99999 !important; /* Keeps it strictly elevated above the dashboard grid layer */
    font-family:
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      Roboto,
      sans-serif;
  }

  .modal-backdrop .dialog-box {
    background: #ffffff !important;
    width: 480px !important;
    max-width: 92% !important;
    border-radius: 12px !important;
    border: 1px solid #e2e8f0 !important;
    box-shadow:
      0 20px 25px -5px rgba(0, 0, 0, 0.15),
      0 10px 10px -5px rgba(0, 0, 0, 0.05) !important;
    display: flex !important;
    flex-direction: column !important;
    overflow: hidden !important;
    animation: modalScaleUp 0.18s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .modal-backdrop .dialog-header {
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    padding: 14px 20px !important;
    background: #f8fafc !important;
    border-bottom: 1px solid #edf2f7 !important;
  }

  .modal-backdrop .dialog-header h3 {
    margin: 0 !important;
    font-size: 16px !important;
    font-weight: 700 !important;
    color: #0f172a !important;
    letter-spacing: -0.3px !important;
  }

  .modal-backdrop .close-x-btn {
    background: transparent !important;
    border: none !important;
    font-size: 24px !important;
    color: #94a3b8 !important;
    cursor: pointer !important;
    line-height: 1 !important;
    padding: 0 !important;
    transition: color 0.15s ease;
  }
  .modal-backdrop .close-x-btn:hover {
    color: #ef4444 !important;
  }

  .modal-backdrop .dialog-body {
    padding: 20px !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 16px !important;
    background: #ffffff !important;
  }

  .modal-backdrop .form-row-split {
    display: flex !important;
    gap: 16px !important;
    width: 100% !important;
  }

  .modal-backdrop .input-group {
    display: flex !important;
    flex-direction: column !important;
    gap: 6px !important;
    flex: 1 !important;
  }

  .modal-backdrop .input-group.full-width {
    width: 100% !important;
  }

  .modal-backdrop .input-group label {
    font-size: 12.5px !important;
    font-weight: 600 !important;
    color: #475569 !important;
    text-align: left !important;
    margin: 0 !important;
  }

  /* Explicitly resets background coloring properties inherited from tables or layout structures */
  .modal-backdrop .input-group select,
  .modal-backdrop .input-group textarea,
  .modal-backdrop .input-group input[type="date"] {
    padding: 10px 12px !important;
    border: 1px solid #cbd5e1 !important;
    border-radius: 6px !important;
    font-size: 14px !important;
    color: #1e293b !important;
    background-color: #ffffff !important; /* Prevents matching underlying dashboard dark styling nodes */
    font-family: inherit !important;
    width: 100% !important;
    box-sizing: border-box !important;
    box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.02) !important;
    transition:
      border-color 0.15s ease,
      box-shadow 0.15s ease;
  }

  .modal-backdrop .input-group select:focus,
  .modal-backdrop .input-group textarea:focus,
  .modal-backdrop .input-group input[type="date"]:focus {
    outline: none !important;
    border-color: #2563eb !important;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15) !important;
  }

  .modal-backdrop .input-group textarea {
    resize: none !important;
    line-height: 1.5 !important;
    min-height: 90px !important;
  }

  .modal-backdrop .dialog-footer {
    padding: 14px 20px !important;
    background: #f8fafc !important;
    border-top: 1px solid #edf2f7 !important;
    display: flex !important;
    justify-content: flex-end !important;
    gap: 12px !important;
  }

  .modal-backdrop .cancel-modal-btn {
    padding: 9px 16px !important;
    background: #ffffff !important;
    border: 1px solid #cbd5e1 !important;
    color: #475569 !important;
    font-weight: 600 !important;
    border-radius: 6px !important;
    cursor: pointer !important;
    font-size: 13.5px !important;
    transition:
      background 0.15s ease,
      color 0.15s ease;
  }
  .modal-backdrop .cancel-modal-btn:hover {
    background: #f1f5f9 !important;
    color: #1e293b !important;
  }

  .modal-backdrop .confirm-modal-btn {
    padding: 9px 16px !important;
    background: #2563eb !important;
    border: none !important;
    color: #ffffff !important;
    font-weight: 600 !important;
    border-radius: 6px !important;
    cursor: pointer !important;
    font-size: 13.5px !important;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
    transition: background 0.15s ease;
  }
  .modal-backdrop .confirm-modal-btn:hover {
    background: #1d4ed8 !important;
  }

  @keyframes modalScaleUp {
    from {
      transform: scale(0.95);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }

  /* Target WebKit browsers (Chrome, Safari, Edge, Opera) */
  input[type="number"]::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  /* Target Mozilla Firefox */
  input[type="number"] {
    -moz-appearance: textfield;
  }
</style>
