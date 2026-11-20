
/* =====================================
   1. GET HTML ELEMENTS
===================================== */

const addTaskBtn = document.getElementById("addTaskBtn");
const taskModal = document.getElementById("taskModal");
const closeModal = document.getElementById("closeModal");
const cancelTask = document.getElementById("cancelTask");
const taskForm = document.getElementById("taskForm");

const taskIdInput = document.getElementById("taskId");
const taskTitleInput = document.getElementById("taskTitle");
const taskDescriptionInput = document.getElementById("taskDescription");
const taskCategoryInput = document.getElementById("taskCategory");
const taskPriorityInput = document.getElementById("taskPriority");
const taskDateInput = document.getElementById("taskDate");
const taskStatusInput = document.getElementById("taskStatus");

const searchInput = document.getElementById("searchInput");
const filterSelect = document.getElementById("filterSelect");
const themeToggle = document.getElementById("themeToggle");


/* =====================================
   2. LOAD TASKS FROM LOCAL STORAGE
===================================== */

let tasks = [];

try {
    const savedTasks = localStorage.getItem("riyaTaskManagerTasks");
    tasks = savedTasks ? JSON.parse(savedTasks) : [];

    if (!Array.isArray(tasks)) {
        tasks = [];
    }
} catch (error) {
    tasks = [];
}

function saveTasks() {
    localStorage.setItem("riyaTaskManagerTasks", JSON.stringify(tasks));
}


/* =====================================
   3. SAVE THEME PREFERENCE
===================================== */

const savedTheme = localStorage.getItem("riyaTaskManagerTheme");

if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    themeToggle.textContent = "☀️";
}

themeToggle.addEventListener("click", function () {
    document.body.classList.toggle("dark-mode");

    const isDarkMode = document.body.classList.contains("dark-mode");

    themeToggle.textContent = isDarkMode ? "☀️" : "🌙";

    localStorage.setItem(
        "riyaTaskManagerTheme",
        isDarkMode ? "dark" : "light"
    );
});


/* =====================================
   4. OPEN AND CLOSE TASK MODAL
===================================== */

function openModal(status = "todo") {
    taskForm.reset();

    taskIdInput.value = "";
    taskStatusInput.value = status;

    document.getElementById("modalTitle").textContent = "Add New Task";

    taskModal.classList.add("show");
    taskTitleInput.focus();
}

function closeTaskModal() {
    taskModal.classList.remove("show");
    taskForm.reset();
}

addTaskBtn.addEventListener("click", function () {
    openModal("todo");
});

closeModal.addEventListener("click", closeTaskModal);

cancelTask.addEventListener("click", closeTaskModal);

taskModal.addEventListener("click", function (event) {
    if (event.target === taskModal) {
        closeTaskModal();
    }
});

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        closeTaskModal();
    }
});

document.querySelectorAll("[data-add-status]").forEach(function (button) {
    button.addEventListener("click", function () {
        openModal(button.dataset.addStatus);
    });
});


/* =====================================
   5. ADD OR UPDATE A TASK
===================================== */

taskForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const title = taskTitleInput.value.trim();

    if (title === "") {
        alert("Please enter a task title.");
        return;
    }

    const taskData = {
        id: taskIdInput.value || String(Date.now()),
        title: title,
        description: taskDescriptionInput.value.trim(),
        category: taskCategoryInput.value,
        priority: taskPriorityInput.value,
        date: taskDateInput.value,
        status: taskStatusInput.value
    };

    const existingTaskIndex = tasks.findIndex(function (task) {
        return task.id === taskData.id;
    });

    if (existingTaskIndex !== -1) {
        tasks[existingTaskIndex] = taskData;
    } else {
        tasks.push(taskData);
    }

    saveTasks();
    renderTasks();
    closeTaskModal();
});


/* =====================================
   6. EDIT A TASK
===================================== */

function editTask(id) {
    const task = tasks.find(function (item) {
        return item.id === id;
    });

    if (!task) {
        return;
    }

    taskIdInput.value = task.id;
    taskTitleInput.value = task.title;
    taskDescriptionInput.value = task.description;
    taskCategoryInput.value = task.category;
    taskPriorityInput.value = task.priority;
    taskDateInput.value = task.date;
    taskStatusInput.value = task.status;

    document.getElementById("modalTitle").textContent = "Edit Task";

    taskModal.classList.add("show");
    taskTitleInput.focus();
}


/* =====================================
   7. DELETE A TASK
===================================== */

function deleteTask(id) {
    const confirmed = confirm("Are you sure you want to delete this task?");

    if (!confirmed) {
        return;
    }

    tasks = tasks.filter(function (task) {
        return task.id !== id;
    });

    saveTasks();
    renderTasks();
}


/* =====================================
   8. CHANGE TASK STATUS
===================================== */

function updateTaskStatus(id, newStatus) {
    const task = tasks.find(function (item) {
        return item.id === id;
    });

    if (!task) {
        return;
    }

    task.status = newStatus;

    saveTasks();
    renderTasks();
}


/* =====================================
   9. CREATE TASK CARD
===================================== */

function createTaskCard(task) {
    const card = document.createElement("div");

    card.className = "task-card";

    if (task.status === "done") {
        card.classList.add("completed");
    }

    const categoryClass = {
        "Work": "category-work",
        "Project": "category-project",
        "Assignment": "category-assignment",
        "Research": "category-research",
        "Personal": "category-personal",
        "Other": "category-other"
    };

    const priorityClass = {
        "High": "priority-high",
        "Normal": "priority-normal",
        "Low": "priority-low"
    };

    const safeTitle = escapeHTML(task.title);
    const safeDescription = escapeHTML(task.description);
    const safeCategory = escapeHTML(task.category);
    const safePriority = escapeHTML(task.priority);

    const categoryStyle = categoryClass[task.category] || "category-other";
    const priorityStyle = priorityClass[task.priority] || "priority-normal";

    let formattedDate = "No due date";
    let isOverdue = false;

    if (task.date) {
        const dateParts = task.date.split("-");
        formattedDate = `${dateParts[2]} ${new Date(
            Number(dateParts[0]),
            Number(dateParts[1]) - 1,
            Number(dateParts[2])
        ).toLocaleString("en", { month: "short" })}`;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const dueDate = new Date(
            Number(dateParts[0]),
            Number(dateParts[1]) - 1,
            Number(dateParts[2])
        );

        isOverdue = dueDate < today && task.status !== "done";
    }

    let statusAction = "";

    if (task.status === "todo") {
        statusAction = `
            <button class="task-complete-btn" data-action="progress" data-id="${task.id}">
                Start Task
            </button>
        `;
    } else if (task.status === "progress") {
        statusAction = `
            <button class="task-complete-btn" data-action="done" data-id="${task.id}">
                Mark Done
            </button>
        `;
    } else {
        statusAction = `
            <button class="task-complete-btn" data-action="todo" data-id="${task.id}">
                Reopen
            </button>
        `;
    }

    card.innerHTML = `
        <div class="task-card-top">
            <div class="task-labels">
                <span class="category ${categoryStyle}">${safeCategory}</span>
                <span class="priority ${priorityStyle}">${safePriority}</span>
            </div>

            <div class="task-menu-wrapper">
                <button class="task-menu-btn" type="button" aria-label="Task options">
                    •••
                </button>

                <div class="task-menu">
                    <button type="button" data-action="edit" data-id="${task.id}">
                        ✎ Edit Task
                    </button>

                    <button type="button" data-action="progress" data-id="${task.id}">
                        ◷ Mark In Progress
                    </button>

                    <button type="button" data-action="done" data-id="${task.id}">
                        ✓ Mark as Done
                    </button>

                    <button type="button" class="delete-action" data-action="delete" data-id="${task.id}">
                        🗑 Delete Task
                    </button>
                </div>
            </div>
        </div>

        <h4 class="task-card-title">${safeTitle}</h4>

        ${safeDescription ? `<p class="task-description">${safeDescription}</p>` : ""}

        <div class="task-card-footer">
            <span class="task-date ${isOverdue ? "overdue" : ""}">
                ◷ ${formattedDate}
            </span>

            ${statusAction}
        </div>
    `;

    return card;
}


/* =====================================
   10. PROTECT TASK TEXT
===================================== */

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
        const replacements = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return replacements[character];
    });
}


/* =====================================
   11. DISPLAY TASKS
===================================== */

function renderTasks() {
    const todoList = document.getElementById("todoList");
    const progressList = document.getElementById("progressList");
    const doneList = document.getElementById("doneList");

    todoList.innerHTML = "";
    progressList.innerHTML = "";
    doneList.innerHTML = "";

    let filteredTasks = [...tasks];

    const searchText = searchInput.value.trim().toLowerCase();
    const selectedFilter = filterSelect.value;

    if (searchText !== "") {
        filteredTasks = filteredTasks.filter(function (task) {
            return (
                task.title.toLowerCase().includes(searchText) ||
                task.description.toLowerCase().includes(searchText) ||
                task.category.toLowerCase().includes(searchText)
            );
        });
    }

    if (selectedFilter !== "all") {
        filteredTasks = filteredTasks.filter(function (task) {
            return task.status === selectedFilter;
        });
    }

    filteredTasks.forEach(function (task) {
        const taskCard = createTaskCard(task);

        if (task.status === "todo") {
            todoList.appendChild(taskCard);
        } else if (task.status === "progress") {
            progressList.appendChild(taskCard);
        } else if (task.status === "done") {
            doneList.appendChild(taskCard);
        }
    });

    if (todoList.children.length === 0) {
        todoList.innerHTML = '<p class="empty-message">No tasks here yet.</p>';
    }

    if (progressList.children.length === 0) {
        progressList.innerHTML = '<p class="empty-message">No tasks here yet.</p>';
    }

    if (doneList.children.length === 0) {
        doneList.innerHTML = '<p class="empty-message">No completed tasks yet.</p>';
    }

    updateTaskCounts();
}


/* =====================================
   12. UPDATE TASK COUNTS
===================================== */

function updateTaskCounts() {
    const todoTasks = tasks.filter(task => task.status === "todo");
    const progressTasks = tasks.filter(task => task.status === "progress");
    const doneTasks = tasks.filter(task => task.status === "done");

    document.getElementById("todoCount").textContent = todoTasks.length;
    document.getElementById("progressCount").textContent = progressTasks.length;
    document.getElementById("doneCount").textContent = doneTasks.length;

    document.getElementById("totalTasks").textContent = tasks.length;
    document.getElementById("progressTasks").textContent = progressTasks.length;
    document.getElementById("completedTasks").textContent = doneTasks.length;
}


/* =====================================
   13. TASK MENU AND BUTTON ACTIONS
===================================== */

document.addEventListener("click", function (event) {
    const menuButton = event.target.closest(".task-menu-btn");

    if (menuButton) {
        const currentMenu = menuButton.nextElementSibling;

        document.querySelectorAll(".task-menu.show").forEach(function (menu) {
            if (menu !== currentMenu) {
                menu.classList.remove("show");
            }
        });

        currentMenu.classList.toggle("show");
        return;
    }

    const actionButton = event.target.closest("[data-action]");

    if (actionButton) {
        const action = actionButton.dataset.action;
        const id = actionButton.dataset.id;

        if (action === "edit") {
            editTask(id);
        } else if (action === "delete") {
            deleteTask(id);
        } else if (action === "progress" || action === "done" || action === "todo") {
            updateTaskStatus(id, action);
        }

        document.querySelectorAll(".task-menu.show").forEach(function (menu) {
            menu.classList.remove("show");
        });

        return;
    }

    document.querySelectorAll(".task-menu.show").forEach(function (menu) {
        menu.classList.remove("show");
    });
});


/* =====================================
   14. SEARCH AND FILTER
===================================== */

searchInput.addEventListener("input", renderTasks);

filterSelect.addEventListener("change", renderTasks);


/* =====================================
   15. CURRENT YEAR
===================================== */

document.getElementById("currentYear").textContent =
    new Date().getFullYear();


/* =====================================
   16. INITIAL DISPLAY
===================================== */

renderTasks();
