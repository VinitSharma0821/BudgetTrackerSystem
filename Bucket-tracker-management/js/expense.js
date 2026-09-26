function calculateTotalExpenses(list) {
    var total = 0;

    var i = 0;

    while (i < list.length) {
        var amount = Number(list[i].amount);

        total = total + amount;

        i = i + 1;
    }

    return total;
}


function calculateBudgetLeft(budget, totalExpenses) {
    var result;

    result = budget - totalExpenses;

    return result;
}


function addExpenseItem(list, title, amount, date) {

    if (date == null || date == "") {

        var today = new Date();

        var year = today.getFullYear();
        var month = today.getMonth() + 1;
        var day = today.getDate();

        if (month < 10) {
            month = "0" + month;
        }

        if (day < 10) {
            day = "0" + day;
        }

        date = year + "-" + month + "-" + day;
    }
    var item = {};

    item.id = Date.now();
    item.title = title;
    item.amount = Number(amount);
    item.date = date;
    list.push(item);
    saveStoredExpenses(list);

    return item;
}


function deleteExpenseItem(list, id) {

    var i = 0;

    while (i < list.length) {

        if (list[i].id == id) {
            list.splice(i, 1);
            saveStoredExpenses(list);

            return true;
        }

        i = i + 1;
    }

    return false;
}


function editExpenseItem(list, id, newTitle, newAmount, newDate) {

    var i = 0;

    while (i < list.length) {

        if (list[i].id == id) {

            list[i].title = newTitle;
            list[i].amount = Number(newAmount);

            if (newDate != null && newDate != "") {
                list[i].date = newDate;
            }

            saveStoredExpenses(list);

            return true;
        }

        i = i + 1;
    }

    return false;
}
