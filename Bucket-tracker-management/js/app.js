var currentBudget = 0;
var currentExpenses = [];
var editModalInstance = null;

document.addEventListener("DOMContentLoaded", function () {
  var modalElement = document.getElementById("editExpenseModal");
  if (modalElement && typeof bootstrap !== "undefined") {
    editModalInstance = new bootstrap.Modal(modalElement);
  }

  var today = new Date().toISOString().split("T")[0];
  var dateInput = document.getElementById("expenseDateInput");
  if (dateInput) {
    dateInput.value = today;
  }

  currentBudget = getStoredBudget();
  currentExpenses = getStoredExpenses();

  setupEventListeners();
  updateUI();
});

function setupEventListeners() {
  var addBudgetBtn = document.getElementById("addBudgetBtn");
  if (addBudgetBtn) {
    addBudgetBtn.addEventListener("click", handleAddBudget);
  }

  var addExpenseBtn = document.getElementById("addExpenseBtn");
  if (addExpenseBtn) {
    addExpenseBtn.addEventListener("click", handleAddExpense);
  }

  var resetAllBtn = document.getElementById("resetAllBtn");
  if (resetAllBtn) {
    resetAllBtn.addEventListener("click", handleResetAll);
  }

  var saveEditExpenseBtn = document.getElementById("saveEditExpenseBtn");
  if (saveEditExpenseBtn) {
    saveEditExpenseBtn.addEventListener("click", handleSaveEditExpense);
  }

  var expenseTableBody = document.getElementById("expenseTableBody");
  if (expenseTableBody) {
    expenseTableBody.addEventListener("click", handleTableActions);
  }
}

function handleAddBudget() {
  var budgetInput = document.getElementById("budgetInput");
  var enteredValue = budgetInput.value.trim();

  if (enteredValue === "") {
    alert("Please enter a budget amount!");
    budgetInput.focus();
    return;
  }

  var numericBudget = parseFloat(enteredValue);
  if (isNaN(numericBudget) || numericBudget < 0) {
    alert("Please enter a valid positive number for Budget!");
    budgetInput.focus();
    return;
  }

  currentBudget = numericBudget;
  saveStoredBudget(currentBudget);
  budgetInput.value = "";
  updateUI();
}

function handleAddExpense() {
  var titleInput = document.getElementById("expenseTitleInput");
  var amountInput = document.getElementById("expenseAmountInput");
  var dateInput = document.getElementById("expenseDateInput");

  var title = titleInput.value.trim();
  var amountStr = amountInput.value.trim();
  var date = dateInput ? dateInput.value : "";

  if (title === "") {
    alert("Please enter an expense title!");
    titleInput.focus();
    return;
  }

  if (amountStr === "") {
    alert("Please enter an amount!");
    amountInput.focus();
    return;
  }

  var amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) {
    alert("Please enter a valid positive expense amount!");
    amountInput.focus();
    return;
  }

  addExpenseItem(currentExpenses, title, amount, date);

  titleInput.value = "";
  amountInput.value = "";
  if (dateInput) {
    dateInput.value = new Date().toISOString().split("T")[0];
  }

  updateUI();
}

function handleTableActions(event) {
  var target = event.target;

  if (target.classList.contains("btn-remove")) {
    var expenseId = parseInt(target.getAttribute("data-id"));
    var confirmDelete = confirm("Are you sure you want to remove this expense?");
    if (confirmDelete) {
      deleteExpenseItem(currentExpenses, expenseId);
      updateUI();
    }
  }

  if (target.classList.contains("btn-edit")) {
    var editId = parseInt(target.getAttribute("data-id"));
    openEditModal(editId);
  }
}

function openEditModal(expenseId) {
  var expenseToEdit = null;
  for (var i = 0; i < currentExpenses.length; i++) {
    if (currentExpenses[i].id === expenseId) {
      expenseToEdit = currentExpenses[i];
      break;
    }
  }

  if (!expenseToEdit) {
    return;
  }

  document.getElementById("editExpenseId").value = expenseToEdit.id;
  document.getElementById("editExpenseTitle").value = expenseToEdit.title;
  document.getElementById("editExpenseAmount").value = expenseToEdit.amount;

  var editDateInput = document.getElementById("editExpenseDate");
  if (editDateInput) {
    editDateInput.value = expenseToEdit.date || "";
  }

  if (editModalInstance) {
    editModalInstance.show();
  }
}

function handleSaveEditExpense() {
  var id = parseInt(document.getElementById("editExpenseId").value);
  var title = document.getElementById("editExpenseTitle").value.trim();
  var amountStr = document.getElementById("editExpenseAmount").value.trim();
  var dateInput = document.getElementById("editExpenseDate");
  var date = dateInput ? dateInput.value : "";

  if (title === "") {
    alert("Expense title cannot be empty!");
    return;
  }

  var amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) {
    alert("Please enter a valid positive amount!");
    return;
  }

  editExpenseItem(currentExpenses, id, title, amount, date);

  if (editModalInstance) {
    editModalInstance.hide();
  }

  updateUI();
}

function handleResetAll() {
  var userConfirmed = confirm("Are you sure you want to reset all data?");
  if (userConfirmed) {
    clearStoredData();
    currentBudget = 0;
    currentExpenses = [];
    updateUI();
  }
}

function updateUI() {
  var totalExpense = calculateTotalExpenses(currentExpenses);
  var budgetLeft = calculateBudgetLeft(currentBudget, totalExpense);

  var totalBudgetDisplay = document.getElementById("totalBudgetDisplay");
  var totalExpenseDisplay = document.getElementById("totalExpenseDisplay");
  var budgetLeftDisplay = document.getElementById("budgetLeftDisplay");

  if (totalBudgetDisplay) {
    totalBudgetDisplay.textContent = currentBudget.toFixed(2);
  }

  if (totalExpenseDisplay) {
    totalExpenseDisplay.textContent = totalExpense.toFixed(2);
  }

  if (budgetLeftDisplay) {
    budgetLeftDisplay.textContent = budgetLeft.toFixed(2);
    if (budgetLeft < 0) {
      budgetLeftDisplay.className = "stat-value negative";
    } else {
      budgetLeftDisplay.className = "stat-value positive";
    }
  }

  renderExpenseTable();
  renderExpenseChart(currentExpenses);
}

function renderExpenseTable() {
  var tableBody = document.getElementById("expenseTableBody");
  var noExpensesMsg = document.getElementById("noExpensesMessage");

  if (!tableBody) {
    return;
  }

  if (currentExpenses.length === 0) {
    tableBody.innerHTML = "";
    if (noExpensesMsg) {
      noExpensesMsg.style.display = "block";
    }
    return;
  }

  if (noExpensesMsg) {
    noExpensesMsg.style.display = "none";
  }

  var rowsHtml = "";
  for (var i = 0; i < currentExpenses.length; i++) {
    var item = currentExpenses[i];

    rowsHtml += "<tr>";
    rowsHtml += "  <td>" + escapeHtml(item.title) + "</td>";
    rowsHtml += "  <td>" + escapeHtml(item.date || "-") + "</td>";
    rowsHtml += "  <td>" + parseFloat(item.amount).toFixed(2) + "</td>";
    rowsHtml += "  <td class='text-center'>";
    rowsHtml += "    <button class='btn-edit' data-id='" + item.id + "'>Edit</button>";
    rowsHtml += "    <button class='btn-remove' data-id='" + item.id + "'>Remove</button>";
    rowsHtml += "  </td>";
    rowsHtml += "</tr>";
  }

  tableBody.innerHTML = rowsHtml;
}

function escapeHtml(string) {
  if (!string) return "";
  return String(string)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
