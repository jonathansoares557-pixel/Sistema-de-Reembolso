// Sistema de Reembolso — lógica de adicionar, remover e totalizar despesas

const expenseForm = document.getElementById("expense-form");
const expenseInput = document.getElementById("expense");
const categoryInput = document.getElementById("category");
const amountInput = document.getElementById("amount");
const errorMessage = document.getElementById("error-message");

const expensesList = document.getElementById("expenses-list");
const expensesTotal = document.getElementById("expenses-total");
const expensesCount = document.getElementById("expenses-count");
const emptyMessage = document.getElementById("empty-message");

// ícone e rótulo de cada categoria
const categories = {
  food: { icon: "./img/food.svg", label: "Alimentação" },
  accommodation: { icon: "./img/accommodation.svg", label: "Hospedagem" },
  services: { icon: "./img/services.svg", label: "Serviços" },
  transport: { icon: "./img/transport.svg", label: "Transporte" },
  others: { icon: "./img/others.svg", label: "Outros" },
};

let expenses = [];

// máscara simples de moeda enquanto o usuário digita (0,00)
amountInput.addEventListener("input", () => {
  let value = amountInput.value.replace(/\D/g, "");

  if (!value) {
    amountInput.value = "";
    return;
  }

  value = (Number(value) / 100).toFixed(2) + "";
  amountInput.value = value.replace(".", ",").replace(/(\d)(?=(\d{3})+\,)/g, "$1.");

  // mantém o cursor sempre no final, evitando embaralhar os dígitos ao
  // digitar depois de clicar no meio de um valor já preenchido
  const end = amountInput.value.length;
  amountInput.setSelectionRange(end, end);
});

// limpa o erro ao editar qualquer campo
[expenseInput, categoryInput, amountInput].forEach((field) => {
  field.addEventListener("input", hideError);
  field.addEventListener("change", hideError);
});

expenseForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = expenseInput.value.trim();
  const category = categoryInput.value;
  const amount = parseAmount(amountInput.value);

  if (!name || !category || !amount || amount <= 0) {
    showError();
    return;
  }

  addExpense({
    id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
    name,
    category,
    amount,
  });

  expenseForm.reset();
  expenseInput.focus();
});

expensesList.addEventListener("click", (event) => {
  const removeIcon = event.target.closest(".remove-icon");
  if (!removeIcon) return;

  const id = removeIcon.closest(".expense").dataset.id;
  removeExpense(id);
});

function parseAmount(rawValue) {
  const normalized = rawValue.replace(/\./g, "").replace(",", ".");
  return Number(normalized);
}

function showError() {
  errorMessage.classList.add("show");
  [expenseInput, categoryInput, amountInput].forEach((field) => {
    if (!field.value) field.classList.add("error");
  });
}

function hideError() {
  errorMessage.classList.remove("show");
  [expenseInput, categoryInput, amountInput].forEach((field) =>
    field.classList.remove("error")
  );
}

function addExpense(expense) {
  expenses.push(expense);
  renderExpenses();
}

function removeExpense(id) {
  expenses = expenses.filter((expense) => expense.id !== id);
  renderExpenses();
}

function renderExpenses() {
  expensesList.innerHTML = "";

  if (expenses.length === 0) {
    expensesList.appendChild(emptyMessage);
    updateSummary();
    return;
  }

  expenses.forEach((expense) => {
    const { icon, label } = categories[expense.category];

    const li = document.createElement("li");
    li.className = "expense";
    li.dataset.id = expense.id;

    li.innerHTML = `
      <img src="${icon}" alt="Ícone de ${label}" />
      <div class="expense-info">
        <strong>${expense.name}</strong>
        <span>${label}</span>
      </div>
      <span class="expense-amount">
        <small>R$</small>${formatCurrency(expense.amount)}
      </span>
      <img src="./img/remove.svg" alt="remover" class="remove-icon" />
    `;

    expensesList.appendChild(li);
  });

  updateSummary();
}

function updateSummary() {
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  expensesTotal.textContent = formatCurrency(total);
  expensesCount.textContent = `${expenses.length} despesa${
    expenses.length === 1 ? "" : "s"
  }`;
}

function formatCurrency(value) {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
