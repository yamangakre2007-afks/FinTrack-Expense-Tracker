// ==========================================
// 1. GET HTML ELEMENTS
// ==========================================

const expenseForm = document.getElementById("expenseForm");
const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");

const expenseList = document.getElementById("expenseList");
const emptyMessage = document.getElementById("emptyMessage");

const totalExpenses = document.getElementById("totalExpenses");
const monthlyExpenses = document.getElementById("monthlyExpenses");
const totalTransactions = document.getElementById("totalTransactions");

const searchInput = document.getElementById("searchInput");
const filterCategory = document.getElementById("filterCategory");
const sortExpenses = document.getElementById("sortExpenses");

const categoryList = document.getElementById("categoryList");

const openFormBtn = document.getElementById("openFormBtn");
const cancelBtn = document.getElementById("cancelBtn");
const expenseFormSection = document.getElementById("expenseFormSection");

const themeToggle = document.getElementById("themeToggle");


// ==========================================
// 2. EXPENSE DATA
// ==========================================

let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

let editExpenseId = null;


// ==========================================
// 3. SAVE EXPENSES IN LOCAL STORAGE
// ==========================================

function saveExpenses() {
    localStorage.setItem("expenses", JSON.stringify(expenses));
}


// ==========================================
// 4. FORMAT CURRENCY
// ==========================================

function formatCurrency(amount) {
    return "₹" + Number(amount).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}


// ==========================================
// 5. OPEN AND CLOSE FORM
// ==========================================

openFormBtn.addEventListener("click", function() {
    expenseFormSection.scrollIntoView({
        behavior: "smooth"
    });

    titleInput.focus();
});

cancelBtn.addEventListener("click", function() {
    expenseForm.reset();
    editExpenseId = null;
});


// ==========================================
// 6. ADD AND EDIT EXPENSE
// ==========================================

expenseForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const title = titleInput.value.trim();
    const amount = Number(amountInput.value);
    const category = categoryInput.value;
    const date = dateInput.value;

    if (!title || amount <= 0 || !category || !date) {
        alert("Please enter valid expense details.");
        return;
    }

    if (editExpenseId !== null) {

        expenses = expenses.map(function(expense) {
            if (expense.id === editExpenseId) {
                return {
                    ...expense,
                    title: title,
                    amount: amount,
                    category: category,
                    date: date
                };
            }

            return expense;
        });

        editExpenseId = null;

    } else {

        const newExpense = {
            id: Date.now(),
            title: title,
            amount: amount,
            category: category,
            date: date
        };

        expenses.push(newExpense);
    }

    saveExpenses();

    expenseForm.reset();

    updateDashboard();
});


// ==========================================
// 7. DISPLAY EXPENSES
// ==========================================

function displayExpenses() {

    expenseList.innerHTML = "";

    const searchTerm = searchInput.value.toLowerCase().trim();
    const selectedCategory = filterCategory.value;
    const selectedSort = sortExpenses.value;

    // Search and category filtering

    let filteredExpenses = expenses.filter(function(expense) {

        const matchesSearch = expense.title
            .toLowerCase()
            .includes(searchTerm);

        const matchesCategory =
            selectedCategory === "All" ||
            expense.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });


    // ======================================
    // 8. SORTING FEATURE
    // ======================================

    filteredExpenses.sort(function(a, b) {

        switch (selectedSort) {

            case "newest":
                return new Date(b.date) - new Date(a.date);

            case "oldest":
                return new Date(a.date) - new Date(b.date);

            case "high":
                return Number(b.amount) - Number(a.amount);

            case "low":
                return Number(a.amount) - Number(b.amount);

            default:
                return new Date(b.date) - new Date(a.date);
        }

    });


    // Display empty message

    if (filteredExpenses.length === 0) {
        emptyMessage.style.display = "block";
    } else {
        emptyMessage.style.display = "none";
    }


    // Display transactions

    filteredExpenses.forEach(function(expense) {

        const row = document.createElement("tr");

        const titleCell = document.createElement("td");
        titleCell.textContent = expense.title;

        const categoryCell = document.createElement("td");
        categoryCell.textContent = expense.category;

        const dateCell = document.createElement("td");
        dateCell.textContent = expense.date;

        const amountCell = document.createElement("td");
        amountCell.textContent = formatCurrency(expense.amount);

        const actionsCell = document.createElement("td");

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.className = "edit-btn";

        editButton.addEventListener("click", function() {
            editExpense(expense.id);
        });

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-btn";

        deleteButton.addEventListener("click", function() {
            deleteExpense(expense.id);
        });

        actionsCell.appendChild(editButton);
        actionsCell.appendChild(deleteButton);

        row.appendChild(titleCell);
        row.appendChild(categoryCell);
        row.appendChild(dateCell);
        row.appendChild(amountCell);
        row.appendChild(actionsCell);

        expenseList.appendChild(row);

    });

}


// ==========================================
// 9. EDIT EXPENSE
// ==========================================

function editExpense(id) {

    const expense = expenses.find(function(item) {
        return item.id === id;
    });

    if (!expense) return;

    titleInput.value = expense.title;
    amountInput.value = expense.amount;
    categoryInput.value = expense.category;
    dateInput.value = expense.date;

    editExpenseId = id;

    expenseFormSection.scrollIntoView({
        behavior: "smooth"
    });
}


// ==========================================
// 10. DELETE EXPENSE
// ==========================================

function deleteExpense(id) {

    const confirmation = confirm(
        "Are you sure you want to delete this expense?"
    );

    if (!confirmation) return;

    expenses = expenses.filter(function(expense) {
        return expense.id !== id;
    });

    saveExpenses();

    updateDashboard();
}


// ==========================================
// 11. UPDATE DASHBOARD
// ==========================================

function updateDashboard() {

    const total = expenses.reduce(function(sum, expense) {
        return sum + Number(expense.amount);
    }, 0);

    const currentDate = new Date();

    const monthlyTotal = expenses.reduce(function(sum, expense) {

        const expenseDate = new Date(expense.date + "T00:00:00");

        if (
            expenseDate.getMonth() === currentDate.getMonth() &&
            expenseDate.getFullYear() === currentDate.getFullYear()
        ) {
            return sum + Number(expense.amount);
        }

        return sum;

    }, 0);

    totalExpenses.textContent = formatCurrency(total);

    monthlyExpenses.textContent = formatCurrency(monthlyTotal);

    totalTransactions.textContent = expenses.length;

    displayExpenses();

    displayCategories();
}


// ==========================================
// 12. SEARCH FEATURE
// ==========================================

searchInput.addEventListener("input", function() {
    displayExpenses();
});


// ==========================================
// 13. CATEGORY FILTER
// ==========================================

filterCategory.addEventListener("change", function() {
    displayExpenses();
});


// ==========================================
// 14. SORTING EVENT LISTENER
// ==========================================

sortExpenses.addEventListener("change", function() {
    displayExpenses();
});


// ==========================================
// 15. CATEGORY-WISE SPENDING
// ==========================================

function displayCategories() {

    categoryList.innerHTML = "";

    const categoryTotals = {};

    expenses.forEach(function(expense) {

        if (!categoryTotals[expense.category]) {
            categoryTotals[expense.category] = 0;
        }

        categoryTotals[expense.category] += Number(expense.amount);

    });

    const total = expenses.reduce(function(sum, expense) {
        return sum + Number(expense.amount);
    }, 0);

    for (let category in categoryTotals) {

        const amount = categoryTotals[category];

        const percentage = total > 0 ?
            (amount / total) * 100 :
            0;

        const categoryItem = document.createElement("div");
        categoryItem.className = "category-item";

        categoryItem.innerHTML = `
            <p>${category}</p>

            <div class="category-progress">
                <div class="category-progress-fill"
                     style="width: ${percentage}%">
                </div>
            </div>

            <small>
                ${formatCurrency(amount)} (${percentage.toFixed(1)}%)
            </small>
        `;

        categoryList.appendChild(categoryItem);
    }

}


// ==========================================
// 16. DARK MODE
// ==========================================

if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
}

themeToggle.addEventListener("click", function() {

    document.body.classList.toggle("dark-mode");

    const theme = document.body.classList.contains("dark-mode") ?
        "dark" :
        "light";

    localStorage.setItem("theme", theme);

});


// ==========================================
// 17. INITIAL DASHBOARD LOAD
// ==========================================

updateDashboard();