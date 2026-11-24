
// =====================================
// RISHABH GOAL TRACKER
// =====================================

const STORAGE_KEY = "rishabhGoalTrackerData";

let data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
    tasks: [],
    monthly: [],
    yearly: []
};

const today = new Date();
const todayKey = getDateKey(today);
const monthKey = todayKey.slice(0, 7);
const currentYear = today.getFullYear();

// =====================================
// DATE FUNCTIONS
// =====================================

function getDateKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

function formatDate(date) {
    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}

document.getElementById("todayDate").textContent =
    formatDate(today);

document.getElementById("dailyDate").textContent =
    formatDate(today);

document.getElementById("monthLabel").textContent =
    today.toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric"
    });

document.getElementById("yearLabel").textContent =
    currentYear;

// =====================================
// SAVE DATA
// =====================================

function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    renderAll();
}

// =====================================
// NAVIGATION
// =====================================

function showPage(pageId) {
    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active");
    });

    document.querySelectorAll(".nav-btn").forEach(btn => {
        btn.classList.remove("active");
    });

    document.getElementById(pageId).classList.add("active");

    const activeButton = document.querySelector(
        `[data-page="${pageId}"]`
    );

    if (activeButton) {
        activeButton.classList.add("active");
    }

    const titles = {
        dashboard: "Dashboard",
        daily: "Daily Tasks",
        monthly: "Monthly Goals",
        yearly: "Yearly Goals",
        analytics: "Analytics"
    };

    document.getElementById("pageTitle").textContent =
        titles[pageId];
}

document.querySelectorAll(".nav-btn").forEach(button => {
    button.addEventListener("click", () => {
        showPage(button.dataset.page);
    });
});

// =====================================
// DAILY TASKS
// =====================================

document.getElementById("taskForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const input = document.getElementById("taskInput");
    const title = input.value.trim();

    if (!title) return;

    data.tasks.push({
        id: Date.now(),
        title: title,
        date: todayKey,
        completed: false,
        completedAt: null
    });

    input.value = "";
    saveData();
});

function toggleTask(id) {
    const task = data.tasks.find(t => t.id === id);
    if (!task) return;

    task.completed = !task.completed;
    task.completedAt = task.completed ? todayKey : null;

    saveData();
}

function editTask(id) {
    const task = data.tasks.find(t => t.id === id);
    if (!task) return;

    const updated = prompt("Edit your task:", task.title);

    if (updated !== null && updated.trim()) {
        task.title = updated.trim();
        saveData();
    }
}

function deleteTask(id) {
    if (!confirm("Are you sure you want to delete this task?")) {
        return;
    }

    data.tasks = data.tasks.filter(t => t.id !== id);
    saveData();
}

function renderTasks() {
    const tasks = data.tasks.filter(t => t.date === todayKey);

    const completed = tasks.filter(t => t.completed).length;

    const percent = tasks.length
        ? Math.round((completed / tasks.length) * 100)
        : 0;

    document.getElementById("taskCount").textContent =
        `${completed} completed out of ${tasks.length} tasks`;

    document.getElementById("dailyPercent").textContent =
        percent + "%";

    document.getElementById("dailyBar").style.width =
        percent + "%";

    const taskHTML = tasks.map(task => `
        <div class="task-item ${task.completed ? "completed" : ""}">
            <input
                type="checkbox"
                class="task-check"
                ${task.completed ? "checked" : ""}
                onchange="toggleTask(${task.id})"
            >

            <div class="item-info">
                <strong>${escapeHTML(task.title)}</strong>
                <small>${task.completed ? "✓ Completed" : "Pending"}</small>
            </div>

            <div class="item-actions">
                <button class="action-btn" onclick="editTask(${task.id})">Edit</button>
                <button class="action-btn delete" onclick="deleteTask(${task.id})">Delete</button>
            </div>
        </div>
    `).join("");

    document.getElementById("taskList").innerHTML =
        taskHTML || `<div class="empty-state">No tasks added yet. Start planning your day! ✨</div>`;

    document.getElementById("dashboardTasks").innerHTML =
        tasks.length
        ? tasks.slice(0, 4).map(task => `
            <div class="task-item ${task.completed ? "completed" : ""}">
                <input type="checkbox" class="task-check"
                    ${task.completed ? "checked" : ""}
                    onchange="toggleTask(${task.id})">
                <div class="item-info">
                    <strong>${escapeHTML(task.title)}</strong>
                    <small>${task.completed ? "Completed" : "Pending"}</small>
                </div>
            </div>
        `).join("")
        : `<div class="empty-state">Your daily tasks will appear here.</div>`;

    document.getElementById("dashDaily").textContent =
        `${completed}/${tasks.length}`;
}

// =====================================
// MONTHLY GOALS
// =====================================

document.getElementById("monthlyForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const input = document.getElementById("monthlyInput");
    const deadline = document.getElementById("monthlyDeadline");

    const title = input.value.trim();
    if (!title) return;

    data.monthly.push({
        id: Date.now(),
        title: title,
        period: monthKey,
        deadline: deadline.value,
        completed: false
    });

    input.value = "";
    deadline.value = "";

    saveData();
});

function toggleMonthly(id) {
    const goal = data.monthly.find(g => g.id === id);
    if (!goal) return;

    goal.completed = !goal.completed;
    saveData();
}

function editMonthly(id) {
    const goal = data.monthly.find(g => g.id === id);
    if (!goal) return;

    const updated = prompt("Edit monthly goal:", goal.title);

    if (updated !== null && updated.trim()) {
        goal.title = updated.trim();
        saveData();
    }
}

function deleteMonthly(id) {
    if (!confirm("Delete this monthly goal?")) return;

    data.monthly = data.monthly.filter(g => g.id !== id);
    saveData();
}

function renderMonthly() {
    const goals = data.monthly.filter(g => g.period === monthKey);

    const completed = goals.filter(g => g.completed).length;

    const percent = goals.length
        ? Math.round((completed / goals.length) * 100)
        : 0;

    document.getElementById("monthlyPercent").textContent =
        percent + "%";

    document.getElementById("monthlyBar").style.width =
        percent + "%";

    document.getElementById("dashMonthly").textContent =
        percent + "%";

    document.getElementById("monthlyList").innerHTML =
        goals.length
        ? goals.map(goal => `
            <div class="goal-item ${goal.completed ? "completed" : ""}">
                <input type="checkbox" class="task-check"
                    ${goal.completed ? "checked" : ""}
                    onchange="toggleMonthly(${goal.id})">

                <div class="item-info">
                    <strong>${escapeHTML(goal.title)}</strong>
                    <small>${goal.deadline ? "Deadline: " + goal.deadline : "No deadline set"}</small>
                </div>

                <div class="item-actions">
                    <button class="action-btn" onclick="editMonthly(${goal.id})">Edit</button>
                    <button class="action-btn delete" onclick="deleteMonthly(${goal.id})">Delete</button>
                </div>
            </div>
        `).join("")
        : `<div class="empty-state">No monthly goals yet. Add your first goal! 🎯</div>`;
}

// =====================================
// YEARLY GOALS
// =====================================

document.getElementById("yearlyForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const input = document.getElementById("yearlyInput");
    const deadline = document.getElementById("yearlyDeadline");

    const title = input.value.trim();
    if (!title) return;

    data.yearly.push({
        id: Date.now(),
        title: title,
        year: currentYear,
        deadline: deadline.value,
        completed: false
    });

    input.value = "";
    deadline.value = "";

    saveData();
});

function toggleYearly(id) {
    const goal = data.yearly.find(g => g.id === id);
    if (!goal) return;

    goal.completed = !goal.completed;
    saveData();
}

function editYearly(id) {
    const goal = data.yearly.find(g => g.id === id);
    if (!goal) return;

    const updated = prompt("Edit yearly goal:", goal.title);

    if (updated !== null && updated.trim()) {
        goal.title = updated.trim();
        saveData();
    }
}

function deleteYearly(id) {
    if (!confirm("Delete this yearly goal?")) return;

    data.yearly = data.yearly.filter(g => g.id !== id);
    saveData();
}

function renderYearly() {
    const goals = data.yearly.filter(g => g.year === currentYear);

    const completed = goals.filter(g => g.completed).length;

    const percent = goals.length
        ? Math.round((completed / goals.length) * 100)
        : 0;

    document.getElementById("yearlyPercent").textContent =
        percent + "%";

    document.getElementById("yearlyBar").style.width =
        percent + "%";

    document.getElementById("dashYearly").textContent =
        percent + "%";

    document.getElementById("yearlyList").innerHTML =
        goals.length
        ? goals.map(goal => `
            <div class="goal-item ${goal.completed ? "completed" : ""}">
                <input type="checkbox" class="task-check"
                    ${goal.completed ? "checked" : ""}
                    onchange="toggleYearly(${goal.id})">

                <div class="item-info">
                    <strong>${escapeHTML(goal.title)}</strong>
                    <small>${goal.deadline ? "Deadline: " + goal.deadline : "No deadline set"}</small>
                </div>

                <div class="item-actions">
                    <button class="action-btn" onclick="editYearly(${goal.id})">Edit</button>
                    <button class="action-btn delete" onclick="deleteYearly(${goal.id})">Delete</button>
                </div>
            </div>
        `).join("")
        : `<div class="empty-state">Your yearly goals will appear here. 🚀</div>`;
}

// =====================================
// OVERALL PROGRESS
// =====================================

function renderOverview() {
    const tasks = data.tasks.filter(t => t.date === todayKey);
    const monthly = data.monthly.filter(g => g.period === monthKey);
    const yearly = data.yearly.filter(g => g.year === currentYear);

    const all = [...tasks, ...monthly, ...yearly];

    const completed = all.filter(item => item.completed).length;

    const percent = all.length
        ? Math.round((completed / all.length) * 100)
        : 0;

    document.getElementById("overallPercent").textContent =
        percent + "%";

    document.getElementById("overallCircle").style.background =
        `conic-gradient(#7958ed ${percent * 3.6}deg, #eeeeF7 ${percent * 3.6}deg)`;

    document.getElementById("overallText").textContent =
        all.length
        ? `${completed} out of ${all.length} targets completed`
        : "Start adding your goals!";

    const overviewItems = [
        { title: "Daily Tasks", items: tasks, label: "Today" },
        { title: "Monthly Goals", items: monthly, label: "This Month" },
        { title: "Yearly Goals", items: yearly, label: "This Year" }
    ];

    document.getElementById("dashboardGoals").innerHTML =
        overviewItems.map(item => {
            const done = item.items.filter(x => x.completed).length;
            const p = item.items.length
                ? Math.round(done / item.items.length * 100)
                : 0;

            return `
                <div class="overview-card">
                    <strong>${item.title}</strong>
                    <p>${done}/${item.items.length} completed · ${item.label}</p>
                    <div class="progress-track">
                        <div class="progress-fill" style="width:${p}%"></div>
                    </div>
                </div>
            `;
        }).join("");
}

// =====================================
// STREAK CALCULATION
// =====================================

function calculateStreak() {
    const activeDates = new Set();

    data.tasks.forEach(task => {
        if (task.completed && task.completedAt) {
            activeDates.add(task.completedAt);
        }
    });

    let streak = 0;
    const date = new Date();

    // Allow today's streak to continue if no task
    // has been completed yet today.
    if (!activeDates.has(todayKey)) {
        date.setDate(date.getDate() - 1);
    }

    while (activeDates.has(getDateKey(date))) {
        streak++;
        date.setDate(date.getDate() - 1);
    }

    return streak;
}

// =====================================
// ANALYTICS
// =====================================

function renderAnalytics() {
    const totalTasks = data.tasks.length;
    const completedTasks = data.tasks.filter(t => t.completed).length;

    const allGoals = [...data.monthly, ...data.yearly];
    const completedGoals = allGoals.filter(g => g.completed).length;

    document.getElementById("totalTasks").textContent = totalTasks;
    document.getElementById("completedTasks").textContent = completedTasks;
    document.getElementById("totalGoals").textContent = allGoals.length;
    document.getElementById("completedGoals").textContent = completedGoals;

    const currentTasks = data.tasks.filter(t => t.date === todayKey);
    const currentMonthly = data.monthly.filter(g => g.period === monthKey);
    const currentYearly = data.yearly.filter(g => g.year === currentYear);

    const groups = [
        { name: "Daily Tasks", items: currentTasks },
        { name: "Monthly Goals", items: currentMonthly },
        { name: "Yearly Goals", items: currentYearly }
    ];

    document.getElementById("analyticsSummary").innerHTML =
        groups.map(group => {
            const done = group.items.filter(x => x.completed).length;
            const p = group.items.length
                ? Math.round(done / group.items.length * 100)
                : 0;

            return `
                <div class="analytics-row">
                    <span>${group.name}</span>
                    <div class="progress-track">
                        <div class="progress-fill" style="width:${p}%"></div>
                    </div>
                    <strong>${p}%</strong>
                </div>
            `;
        }).join("");

    const activities = [];

    data.tasks.filter(t => t.completed).forEach(t => {
        activities.push({
            text: `☑ Completed task: ${t.title}`,
            date: t.completedAt || t.date
        });
    });

    data.monthly.filter(g => g.completed).forEach(g => {
        activities.push({
            text: `🎯 Achieved monthly goal: ${g.title}`,
            date: g.completedAt || monthKey
        });
    });

    data.yearly.filter(g => g.completed).forEach(g => {
        activities.push({
            text: `🏆 Achieved yearly goal: ${g.title}`,
            date: g.completedAt || String(g.year)
        });
    });

    activities.sort((a, b) => b.date.localeCompare(a.date));

    document.getElementById("activityList").innerHTML =
        activities.length
        ? activities.slice(0, 10).map(a => `
            <div class="activity-item">
                ${escapeHTML(a.text)}
                <small style="display:block;color:#999;margin-top:5px">${a.date}</small>
            </div>
        `).join("")
        : `<div class="empty-state">Your completed activities will appear here.</div>`;
}

// =====================================
// SECURITY: ESCAPE USER TEXT
// =====================================

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[char]);
}

// =====================================
// RENDER EVERYTHING
// =====================================

function renderAll() {
    renderTasks();
    renderMonthly();
    renderYearly();
    renderOverview();
    renderAnalytics();

    document.getElementById("dashStreak").textContent =
        calculateStreak() + " 🔥";
}

// =====================================
// START APP
// =====================================

renderAll();
