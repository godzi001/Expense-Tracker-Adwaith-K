// =========================
// Get HTML elements
// =========================

const amountError = document.getElementById("amountError");

const addTransactionBtn = document.getElementById("addTransactionBtn");
const transactionModal = document.getElementById("transactionModal");
const closeModal = document.getElementById("closeModal");
const cancelBtn = document.getElementById("cancelBtn");

const transactionForm = document.getElementById("transactionForm");
const transactionList = document.getElementById("transactionList");

const modalTitle = document.getElementById("modalTitle");

const typeFilter = document.getElementById("typeFilter");
const categoryFilter = document.getElementById("categoryFilter");
const searchInput = document.getElementById("searchInput");
const sortFilter = document.getElementById("sortFilter");

const exportBtn = document.getElementById("exportBtn");

const monthlyTitle = document.getElementById("monthlyTitle");
const monthlyIncome = document.getElementById("monthlyIncome");
const monthlyExpenses = document.getElementById("monthlyExpenses");
const monthlyBalance = document.getElementById("monthlyBalance");
const monthFilter = document.getElementById("monthFilter");

const budgetInput = document.getElementById("budgetInput");
const setBudgetBtn = document.getElementById("setBudgetBtn");

const budgetAmount = document.getElementById("budgetAmount");
const budgetSpent = document.getElementById("budgetSpent");
const budgetRemaining = document.getElementById("budgetRemaining");

const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");
const budgetMessage = document.getElementById("budgetMessage");


// =========================
// Variables
// =========================

let transactions = [];
let editingId = null;
let budgets = {};


// =========================
// Open Add Transaction Modal
// =========================

addTransactionBtn.addEventListener("click", function () {

    editingId = null;

    modalTitle.textContent = "Add Transaction";

    transactionForm.reset();

    amountError.textContent = "";

    const today = new Date().toISOString().split("T")[0];

    document.getElementById("date").value = today;

    transactionModal.classList.remove("hidden");
});


// =========================
// Close Modal
// =========================

closeModal.addEventListener("click", function () {
    transactionModal.classList.add("hidden");
});

cancelBtn.addEventListener("click", function () {
    transactionModal.classList.add("hidden");
});


// =========================
// Save Transaction
// =========================

transactionForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const type = document.getElementById("type").value;
    const amount = document.getElementById("amount").value;
    const category = document.getElementById("category").value;
    const date = document.getElementById("date").value;
    const description = document.getElementById("description").value;


    // Clear previous error
    amountError.textContent = "";


    // Validate amount
    if (Number(amount) <= 0) {

        amountError.textContent =
            "Amount must be greater than 0.";

        return;
    }


    // Edit existing transaction
    if (editingId !== null) {

        const transaction = transactions.find(function (item) {
            return item.id === editingId;
        });


        if (transaction) {

            transaction.type = type;
            transaction.amount = Number(amount);
            transaction.category = category;
            transaction.date = date;
            transaction.description = description;
        }

    }


    // Add new transaction
    else {

        const transaction = {

            id: Date.now(),

            type: type,

            amount: Number(amount),

            category: category,

            date: date,

            description: description
        };


        transactions.push(transaction);
    }


    // Save and update everything
    saveTransactions();

    displayTransactions();

    updateSummary();

    updateMonthFilter();

    updateMonthlySummary();

    updateBudget();

    // Reset form
    transactionForm.reset();

    editingId = null;

    transactionModal.classList.add("hidden");
});


// =========================
// Display Transactions
// =========================

function displayTransactions() {

    transactionList.innerHTML = "";


    let filteredTransactions = [...transactions];


    // Type filter
    const selectedType = typeFilter.value;


    if (selectedType !== "all") {

        filteredTransactions = filteredTransactions.filter(function (transaction) {

            return transaction.type === selectedType;

        });
    }


    // Category filter
    const selectedCategory = categoryFilter.value;


    if (selectedCategory !== "all") {

        filteredTransactions = filteredTransactions.filter(function (transaction) {

            return transaction.category === selectedCategory;

        });
    }


    // Search
    const searchText = searchInput.value.toLowerCase().trim();


    if (searchText !== "") {

        filteredTransactions = filteredTransactions.filter(function (transaction) {

            return (
                transaction.category.toLowerCase().includes(searchText) ||
                transaction.description.toLowerCase().includes(searchText)
            );

        });
    }


    // Sorting
    const selectedSort = sortFilter.value;


    if (selectedSort === "newest") {

        filteredTransactions.sort(function (a, b) {

            return b.id - a.id;

        });

    }


    else if (selectedSort === "oldest") {

        filteredTransactions.sort(function (a, b) {

            return a.id - b.id;

        });

    }


    else if (selectedSort === "highest") {

        filteredTransactions.sort(function (a, b) {

            return b.amount - a.amount;

        });

    }


    else if (selectedSort === "lowest") {

        filteredTransactions.sort(function (a, b) {

            return a.amount - b.amount;

        });
    }


    // No matching transactions
    if (filteredTransactions.length === 0) {

        transactionList.innerHTML = `
            <div class="empty-message">
                No matching transactions found.
            </div>
        `;

        return;
    }


    // Display each transaction
    filteredTransactions.forEach(function (transaction) {

        const transactionItem = document.createElement("div");

        transactionItem.classList.add("transaction-item");


        transactionItem.innerHTML = `

            <div>

                <strong>${transaction.category}</strong>

                <p>
                    ${transaction.description || "No description"}
                </p>

                <small>
                    ${transaction.date}
                </small>

            </div>


            <div class="transaction-right">

                <strong class="${transaction.type === "income"
                ? "income-amount"
                : "expense-amount"
            }">

                    ${transaction.type === "income" ? "+" : "-"}
                    ₹${transaction.amount.toFixed(2)}

                </strong>


                <div class="transaction-actions">

                    <button
                        class="edit-btn"
                        onclick="editTransaction(${transaction.id})">

                        Edit

                    </button>


                    <button
                        class="delete-btn"
                        onclick="deleteTransaction(${transaction.id})">

                        Delete

                    </button>

                </div>

            </div>

        `;


        transactionList.appendChild(transactionItem);
    });
}


// =========================
// Edit Transaction
// =========================

function editTransaction(id) {

    const transaction = transactions.find(function (item) {

        return item.id === id;

    });


    if (!transaction) {
        return;
    }


    editingId = id;

    modalTitle.textContent = "Edit Transaction";

    document.getElementById("type").value =
        transaction.type;

    document.getElementById("amount").value =
        transaction.amount;

    document.getElementById("category").value =
        transaction.category;

    document.getElementById("date").value =
        transaction.date;

    document.getElementById("description").value =
        transaction.description;

    amountError.textContent = "";

    transactionModal.classList.remove("hidden");
}


// =========================
// Delete Transaction
// =========================

function deleteTransaction(id) {

    const confirmed = confirm(
        "Are you sure you want to delete this transaction?"
    );


    if (!confirmed) {
        return;
    }


    transactions = transactions.filter(function (transaction) {

        return transaction.id !== id;

    });


    saveTransactions();
    displayTransactions();
    updateSummary();
    updateMonthFilter();
    updateMonthlySummary();
    updateBudget();
}


// =========================
// Update Main Summary
// =========================

function updateSummary() {

    let totalIncome = 0;

    let totalExpenses = 0;


    transactions.forEach(function (transaction) {

        if (transaction.type === "income") {

            totalIncome += transaction.amount;

        }

        else {

            totalExpenses += transaction.amount;

        }

    });


    const balance = totalIncome - totalExpenses;


    document.getElementById("income").textContent =
        "₹" + totalIncome.toFixed(2);

    document.getElementById("expenses").textContent =
        "₹" + totalExpenses.toFixed(2);

    document.getElementById("balance").textContent =
        "₹" + balance.toFixed(2);
}


// =========================
// Save to Local Storage
// =========================

function saveTransactions() {

    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    );
}

// Save budgets to Local Storage
function saveBudgets() {

    localStorage.setItem(
        "budgets",
        JSON.stringify(budgets)
    );
}

// Load budgets from Local Storage
function loadBudgets() {

    const savedBudgets =
        localStorage.getItem("budgets");

    if (savedBudgets) {

        try {

            budgets = JSON.parse(savedBudgets);

        } catch (error) {

            budgets = {};
        }
    }
}

// =========================
// Update Monthly Summary
// =========================

function updateMonthlySummary() {

    const currentMonth =
        new Date().toISOString().slice(0, 7);


    const selectedMonth =
        monthFilter.value || currentMonth;


    let monthIncome = 0;

    let monthExpenses = 0;


    transactions.forEach(function (transaction) {

        const transactionMonth =
            transaction.date.slice(0, 7);


        if (transactionMonth === selectedMonth) {

            if (transaction.type === "income") {

                monthIncome += transaction.amount;

            }

            else {

                monthExpenses += transaction.amount;

            }
        }
    });


    const monthBalance =
        monthIncome - monthExpenses;


    const monthDate =
        new Date(selectedMonth + "-01");


    const monthName =
        monthDate.toLocaleString("default", {
            month: "long"
        });


    const year =
        monthDate.getFullYear();


    monthlyTitle.textContent =
        "Monthly Summary - " +
        monthName +
        " " +
        year;


    monthlyIncome.textContent =
        "₹" + monthIncome.toFixed(2);


    monthlyExpenses.textContent =
        "₹" + monthExpenses.toFixed(2);


    monthlyBalance.textContent =
        "₹" + monthBalance.toFixed(2);
}

// Update monthly budget
function updateBudget() {

    const currentMonth =
        new Date().toISOString().slice(0, 7);

    const selectedMonth =
        monthFilter.value || currentMonth;


    const budget =
        Number(budgets[selectedMonth]) || 0;


    let spent = 0;


    transactions.forEach(function (transaction) {

        const transactionMonth =
            transaction.date.slice(0, 7);


        if (
            transactionMonth === selectedMonth &&
            transaction.type === "expense"
        ) {

            spent += transaction.amount;
        }
    });


    const remaining =
        budget - spent;


    // Show budget
    budgetAmount.textContent =
        "₹" + budget.toFixed(2);


    // Show spent
    budgetSpent.textContent =
        "₹" + spent.toFixed(2);


    // Show remaining
    budgetRemaining.textContent =
        "₹" + remaining.toFixed(2);


    // No budget set
    if (budget <= 0) {

        progressFill.style.width = "0%";

        progressText.textContent =
            "No budget set";

        budgetMessage.textContent =
            "Set a monthly budget to track your spending.";

        return;
    }


    // Calculate percentage
    const percentage =
        (spent / budget) * 100;


    // Limit progress bar to 100%
    const progress =
        Math.min(percentage, 100);


    progressFill.style.width =
        progress + "%";


    progressText.textContent =
        Math.round(percentage) + "% spent";


    // Budget status message
    if (percentage >= 100) {

        budgetMessage.textContent =
            "You have exceeded your monthly budget.";

    }

    else if (percentage >= 80) {

        budgetMessage.textContent =
            "You are close to your monthly budget.";

    }

    else {

        budgetMessage.textContent =
            "You are within your monthly budget.";
    }
}


// =========================
// Create Month Filter
// =========================

function updateMonthFilter() {

    const currentMonth =
        new Date().toISOString().slice(0, 7);


    const months = transactions.map(function (transaction) {

        return transaction.date.slice(0, 7);

    });


    // Always include current month
    months.push(currentMonth);


    // Remove duplicates
    const uniqueMonths = [...new Set(months)];


    // Newest month first
    uniqueMonths.sort(function (a, b) {

        return b.localeCompare(a);

    });


    const previousValue =
        monthFilter.value;


    monthFilter.innerHTML = "";


    uniqueMonths.forEach(function (month) {

        const option =
            document.createElement("option");


        option.value = month;


        const date =
            new Date(month + "-01");


        const monthName =
            date.toLocaleString("default", {
                month: "long"
            });


        const year =
            date.getFullYear();


        option.textContent =
            monthName + " " + year;


        monthFilter.appendChild(option);
    });


    if (uniqueMonths.includes(previousValue)) {

        monthFilter.value =
            previousValue;

    }

    else {

        monthFilter.value =
            currentMonth;

    }
}


// =========================
// Load Transactions
// =========================

function loadTransactions() {

    const savedTransactions =
        localStorage.getItem("transactions");


    if (savedTransactions) {

        try {

            transactions =
                JSON.parse(savedTransactions);

        }

        catch (error) {

            transactions = [];

            console.log(
                "Could not load saved transactions."
            );
        }
    }


    loadBudgets();

    updateMonthFilter();
    displayTransactions();
    updateSummary();
    updateMonthlySummary();
    updateBudget();


    // =========================
    // Filters
    // =========================

    typeFilter.addEventListener("change", function () {

        displayTransactions();

    });


    categoryFilter.addEventListener("change", function () {

        displayTransactions();

    });


    searchInput.addEventListener("input", function () {

        displayTransactions();

    });


    sortFilter.addEventListener("change", function () {

        displayTransactions();

    });


    monthFilter.addEventListener("change", function () {

        updateMonthlySummary();

        updateBudget();

    });
}    

    // Set monthly budget
    setBudgetBtn.addEventListener("click", function () {

        const amount =
            Number(budgetInput.value);


        if (amount <= 0) {

            alert("Please enter a valid budget.");

            return;
        }


        const currentMonth =
            new Date().toISOString().slice(0, 7);


        const selectedMonth =
            monthFilter.value || currentMonth;


        budgets[selectedMonth] =
            amount;


        saveBudgets();

        updateBudget();

        budgetInput.value = "";
    });


    // =========================
    // Export CSV
    // =========================

    function exportCSV() {

        if (transactions.length === 0) {

            alert(
                "There are no transactions to export."
            );

            return;
        }


        let csv =
            "Type,Amount,Category,Date,Description\n";


        transactions.forEach(function (transaction) {

            const description =
                (transaction.description || "")
                    .replace(/"/g, '""');


            csv +=
                `${transaction.type},` +
                `${transaction.amount},` +
                `${transaction.category},` +
                `${transaction.date},` +
                `"${description}"\n`;

        });


        const blob = new Blob(
            ["\uFEFF" + csv],
            {
                type: "text/csv;charset=utf-8;"
            }
        );


        const url =
            URL.createObjectURL(blob);


        const link =
            document.createElement("a");


        link.href = url;

        link.download =
            "expense-transactions.csv";


        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);


        URL.revokeObjectURL(url);
    }


    exportBtn.addEventListener("click", function () {

        exportCSV();

    });


    // =========================
    // Start Application
    // =========================

    loadTransactions();