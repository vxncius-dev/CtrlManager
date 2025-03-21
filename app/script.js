class CtrlManager {
	constructor() {
		this.parentObject = JSON.parse(localStorage.getItem("CtrlManager-local")) || {};
		this.tableBody = document.getElementById("expensesTable");
		this.viewMoreBtn = document.getElementById("explore-btn");
		this.tryNowBtn = document.getElementById("start-btn");
		this.filterInput = document.getElementById("filterInput");
		this.contextMenu = document.getElementById("contextMenu");
		this.deleteOption = document.getElementById("deleteOption");
		this.editOption = document.getElementById("editOption");
		this.selectedExpenseId = null;
		this.initEventListeners();
		this.renderExpenses();
	}

	generateUniqueId() {
		return "exp_" + Math.random().toString(36).substr(2, 9);
	}

	saveToLocalStorage() {
		localStorage.setItem("expenses", JSON.stringify(this.parentObject));
	}

	addExpense(amount, category, notes, date) {
		if (!this.parentObject) {
			console.error("parentObject não foi inicializado corretamente.");
			return;
		}

		const id = this.generateUniqueId();
		this.parentObject[id] = {
			id,
			amount: parseFloat(amount),
			category,
			notes,
			date: new Date(date).toISOString()
		};
		this.saveToLocalStorage();
		this.renderExpenses();
	}

	deleteExpense(id) {
		delete this.parentObject[id];
		this.saveToLocalStorage();
		this.renderExpenses();
	}

	renderExpenses(filter = "") {
		this.tableBody.innerHTML = "";
		const expenses = this.parentObject ? Object.values(this.parentObject) : [];
		const filteredExpenses = expenses.filter((expense) =>
			expense.category.toLowerCase().includes(filter.toLowerCase())
		);

		filteredExpenses.forEach((expense) => {
			const tr = document.createElement("tr");
			tr.setAttribute("data-id", expense.id);
			tr.innerHTML = `
                <td class="p-2">${expense.amount.toFixed(2)}</td>
                <td class="p-2">${expense.category}</td>
                <td class="p-2">${expense.notes}</td>
               	<td class="p-2">${new Date(expense.date).toLocaleDateString(
																	"pt-BR",
																	{
																		day: "2-digit",
																		month: "2-digit"
																	}
																)}</td>
            `;
			this.tableBody.appendChild(tr);
		});
	}

	showContextMenu(event, expenseId) {
		event.preventDefault();
		this.selectedExpenseId = expenseId;
		this.contextMenu.classList.remove("hidden");
		this.contextMenu.style.left = `${event.pageX}px`;
		this.contextMenu.style.top = `${event.pageY}px`;
	}

	hideContextMenu() {
		this.contextMenu.classList.add("hidden");
		this.selectedExpenseId = null;
	}

	editExpense(id) {
		const expense = this.parentObject[id];
		const modal = document.getElementById("expenseModal");
		const modalAmount = document.getElementById("modalAmount");
		const modalCategory = document.getElementById("modalCategory");
		const modalNotes = document.getElementById("modalNotes");
		const modalDate = document.getElementById("modalDate");
		const saveExpenseBtn = document.getElementById("saveExpense");

		modalAmount.value = expense.amount;
		modalCategory.value = expense.category;
		modalNotes.value = expense.notes;
		modalDate.value = new Date(expense.date).toISOString().split("T")[0];

		modal.classList.remove("hidden");

		const saveHandler = () => {
			const updatedExpense = {
				id: id,
				amount: parseFloat(modalAmount.value),
				category: modalCategory.value,
				notes: modalNotes.value,
				date: new Date(modalDate.value + "T00:00:00").toISOString()
			};

			if (
				updatedExpense.amount &&
				updatedExpense.category &&
				updatedExpense.date
			) {
				this.parentObject[id] = updatedExpense;
				this.saveToLocalStorage();
				this.renderExpenses();
				modal.classList.add("hidden");
				saveExpenseBtn.removeEventListener("click", saveHandler);
			} else {
				alert("Please fill in amount, category, and date");
			}
		};

		saveExpenseBtn.removeEventListener("click", () => this.addExpenseHandler());
		saveExpenseBtn.addEventListener("click", saveHandler);
	}

	initEventListeners() {
		const modal = document.getElementById("expenseModal");
		const openModalBtn = document.getElementById("openModal");
		const closeModalBtn = document.getElementById("closeModal");
		const saveExpenseBtn = document.getElementById("saveExpense");
		const modalDate = document.getElementById("modalDate");
		const today = new Date();
		const formattedDate = today.toISOString().split("T")[0];

		this.addExpenseHandler = () => {
			const amount = document.getElementById("modalAmount").value;
			const category = document.getElementById("modalCategory").value;
			const notes = document.getElementById("modalNotes").value;
			const date = document.getElementById("modalDate").value;

			if (amount && category && date) {
				this.addExpense(amount, category, notes, date);
				modal.classList.add("hidden");
				document.getElementById("modalAmount").value = "";
				document.getElementById("modalCategory").value = "";
				document.getElementById("modalNotes").value = "";
				document.getElementById("modalDate").value = "";
			} else {
				alert("Please fill in amount, category, and date");
			}
		};

		openModalBtn.addEventListener("click", () => {
			modal.classList.remove("hidden");
			modalDate.value = formattedDate;
			document.getElementById("modalAmount").value = "";
			document.getElementById("modalCategory").value = "";
			document.getElementById("modalNotes").value = "";
		});

		closeModalBtn.addEventListener("click", () => {
			modal.classList.add("hidden");
			saveExpenseBtn.removeEventListener("click", () => this.addExpenseHandler());
			saveExpenseBtn.addEventListener("click", () => this.addExpenseHandler());
		});

		saveExpenseBtn.addEventListener("click", () => this.addExpenseHandler());

		this.filterInput.addEventListener("input", (e) => {
			this.renderExpenses(e.target.value);
		});

		this.tableBody.addEventListener("contextmenu", (e) => {
			const row = e.target.closest("tr");
			if (row) {
				const expenseId = row.getAttribute("data-id");
				this.showContextMenu(e, expenseId);
			}
		});

		this.deleteOption.addEventListener("click", () => {
			if (this.selectedExpenseId) {
				this.deleteExpense(this.selectedExpenseId);
				this.hideContextMenu();
			}
		});

		this.editOption.addEventListener("click", () => {
			if (this.selectedExpenseId) {
				this.editExpense(this.selectedExpenseId);
				this.hideContextMenu();
			}
		});

		document.addEventListener("click", () => {
			this.hideContextMenu();
		});

		this.viewMoreBtn.addEventListener("click", () => {
			document
				.getElementById("features-section")
				.scrollIntoView({ behavior: "smooth" });
		});

		this.tryNowBtn.addEventListener("click", () => {
			document
				.getElementById("app-section")
				.scrollIntoView({ behavior: "smooth" });
		});
	}
}

const expenseManager = new CtrlManager();
