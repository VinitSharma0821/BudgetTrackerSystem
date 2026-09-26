var budget = "budget";
var expense = "expense";

function getStoredBudget() {
  var saved = localStorage.getItem(budget);
  if (!saved) {
    return 0;
  }
  return parseFloat(saved);
}

function saveStoredBudget(amount) {
  localStorage.setItem(budget, amount);
}

function getStoredExpenses() {
  var saved = localStorage.getItem(expense);
  if (!saved) {
    return [];
  }
  try {
    return JSON.parse(saved);
  } catch (e) {
    return [];
  }
}

function saveStoredExpenses(list) {
  localStorage.setItem(expense, JSON.stringify(list));
}

function clearStoredData() {
  localStorage.removeItem(budget);
  localStorage.removeItem(expense);
}
