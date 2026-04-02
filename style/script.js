// ===== DATA LAYER =====
const STORAGE_KEY = "productiv_data";

const defaultData = {
  tasks: [],
  habits: [],
  generalNotes: [],
  secretNotes: [],
  longTermGoals: [],
  pomodoroMinutes: 25,
  totalPoints: 0,
  pomodoroSessions: 0,
  pointsHistory: [],
  settings: {
    theme: "dark",
    accentColor: "#f59e0b",
    accentSecondary: "#f97316",
    appLock: false,
    secretMethod: "dot",
    defaultHabitPoints: 5,
    breakMinutes: 5,
  },
  auth: {
    username: "",
    passwordHash: "",
    dotPattern: [],
    emojiPattern: [],
    colorPattern: [],
    dynamicBase: "",
    secretKey: "",
  },
};

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return JSON.parse(JSON.stringify(defaultData));

    const d = JSON.parse(raw);

    const key = d.auth?.secretKey || "";

    // 🔓 Decrypt auth fields safely
    if (d.auth && key) {
      try {
        d.auth.dotPattern = d.auth.dotPattern
          ? JSON.parse(decryptText(d.auth.dotPattern, key))
          : [];
      } catch {
        d.auth.dotPattern = [];
      }

      try {
        d.auth.emojiPattern = d.auth.emojiPattern
          ? JSON.parse(decryptText(d.auth.emojiPattern, key))
          : [];
      } catch {
        d.auth.emojiPattern = [];
      }

      try {
        d.auth.colorPattern = d.auth.colorPattern
          ? JSON.parse(decryptText(d.auth.colorPattern, key))
          : [];
      } catch {
        d.auth.colorPattern = [];
      }

      try {
        d.auth.dynamicBase = d.auth.dynamicBase
          ? decryptText(d.auth.dynamicBase, key)
          : "";
      } catch {
        d.auth.dynamicBase = "";
      }
    }

    // ✅ Merge defaults (important)
    d.settings = { ...defaultData.settings, ...(d.settings || {}) };
    d.auth = { ...defaultData.auth, ...(d.auth || {}) };

    return { ...defaultData, ...d };
  } catch {
    return JSON.parse(JSON.stringify(defaultData));
  }
}
function saveData(data) {
  // 🧠 Deep copy (avoid modifying original APP)
  const copy = JSON.parse(JSON.stringify(data));

  // 🔑 Ensure secret key exists
  if (!copy.auth.secretKey) {
    copy.auth.secretKey = uid() + uid();
  }

  const key = copy.auth.secretKey;

  // 🔐 Encrypt auth fields
  copy.auth.dotPattern = encryptText(
    JSON.stringify(copy.auth.dotPattern || []),
    key,
  );

  copy.auth.emojiPattern = encryptText(
    JSON.stringify(copy.auth.emojiPattern || []),
    key,
  );

  copy.auth.colorPattern = encryptText(
    JSON.stringify(copy.auth.colorPattern || []),
    key,
  );

  copy.auth.dynamicBase = encryptText(copy.auth.dynamicBase || "", key);

  // ✅ SAVE ENCRYPTED DATA (IMPORTANT FIX)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(copy));
}
let APP = loadData();

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
function today() {
  return new Date().toISOString().slice(0, 10);
}

// ===== TOAST =====
function showToast(msg, type = "success") {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.className = "toast show " + type;
  setTimeout(() => (t.className = "toast"), 2500);
}

// ===== SIMPLE HASH =====
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash.toString(36);
}

// ===== SIMPLE ENCRYPTION (XOR-based with key) =====
function encryptText(text, key) {
  if (!key) return text;
  let result = "";
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(
      text.charCodeAt(i) ^ key.charCodeAt(i % key.length),
    );
  }
  return btoa(result);
}

function decryptText(encoded, key) {
  if (!key) return encoded;
  try {
    const text = atob(encoded);
    let result = "";
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(
        text.charCodeAt(i) ^ key.charCodeAt(i % key.length),
      );
    }
    return result;
  } catch {
    return "";
  }
}

// ===== MOTIVATIONAL QUOTES =====
const quotes = [
  {
    text: "The secret of getting ahead is getting started.",
    author: "Mark Twain",
  },
  {
    text: "It always seems impossible until it's done.",
    author: "Nelson Mandela",
  },
  {
    text: "Don't watch the clock; do what it does. Keep going.",
    author: "Sam Levenson",
  },
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
  },
  {
    text: "Believe you can and you're halfway there.",
    author: "Theodore Roosevelt",
  },
  { text: "Your limitation—it's only your imagination.", author: "Unknown" },
  {
    text: "Push yourself, because no one else is going to do it for you.",
    author: "Unknown",
  },
  { text: "Great things never come from comfort zones.", author: "Unknown" },
  {
    text: "Success is not final, failure is not fatal: it is the courage to continue.",
    author: "Winston Churchill",
  },
  {
    text: "The future depends on what you do today.",
    author: "Mahatma Gandhi",
  },
  {
    text: "Hardships often prepare ordinary people for an extraordinary destiny.",
    author: "C.S. Lewis",
  },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  {
    text: "A goal without a plan is just a wish.",
    author: "Antoine de Saint-Exupéry",
  },
  {
    text: "The way to get started is to quit talking and begin doing.",
    author: "Walt Disney",
  },
  {
    text: "Don't count the days, make the days count.",
    author: "Muhammad Ali",
  },
];

function showQuote() {
  const q = quotes[Math.floor(Math.random() * quotes.length)];
  const qt = document.getElementById("quoteText");
  const qa = document.getElementById("quoteAuthor");
  if (qt) qt.textContent = `"${q.text}"`;
  if (qa) qa.textContent = `— ${q.author}`;
}

// ===== THEME =====
function applyTheme() {
  document.documentElement.setAttribute("data-theme", APP.settings.theme);
  const icon = document.getElementById("themeIcon");
  const label = document.getElementById("themeLabel");
  const btn = document.getElementById("settingsThemeBtn");
  if (icon) icon.textContent = APP.settings.theme === "dark" ? "🌙" : "☀️";
  if (label)
    label.textContent =
      APP.settings.theme === "dark" ? "Dark Mode" : "Light Mode";
  if (btn)
    btn.textContent = APP.settings.theme === "dark" ? "🌙 Dark" : "☀️ Light";
}

function toggleTheme() {
  APP.settings.theme = APP.settings.theme === "dark" ? "light" : "dark";
  saveData(APP);
  applyTheme();
}

function setAccentColor(primary, secondary) {
  APP.settings.accentColor = primary;
  APP.settings.accentSecondary = secondary;
  document.documentElement.style.setProperty("--primary", primary);
  document.documentElement.style.setProperty("--primary-secondary", secondary);
  document.documentElement.style.setProperty("--primary-glow", primary + "26");
  saveData(APP);
  // highlight active accent dot
  document.querySelectorAll(".accent-dot").forEach((d) => {
    d.classList.toggle("active", d.style.background === primary);
  });
}

function applyAccentColor() {
  if (APP.settings.accentColor) {
    document.documentElement.style.setProperty(
      "--primary",
      APP.settings.accentColor,
    );
    document.documentElement.style.setProperty(
      "--primary-secondary",
      APP.settings.accentSecondary,
    );
    document.documentElement.style.setProperty(
      "--primary-glow",
      APP.settings.accentColor + "26",
    );
  }
}

// ===== LOGIN SYSTEM =====
let isLoggedIn = false;
let secretNotesUnlocked = false;

const EMOJIS = [
  "😀",
  "😎",
  "🔥",
  "⭐",
  "💎",
  "🎯",
  "🚀",
  "💪",
  "🌈",
  "🍕",
  "🎮",
  "❤️",
  "🦊",
  "🌙",
  "🎵",
];
const COLORS = [
  "#ef4444",
  "#f59e0b",
  "#22c55e",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#f97316",
  "#a855f7",
  "#14b8a6",
  "#f43f5e",
  "#84cc16",
  "#6366f1",
  "#eab308",
  "#0ea5e9",
  "#d946ef",
];

let currentDotPattern = [];
let currentEmojiPattern = [];
let currentColorPattern = [];

function switchLoginTab(tab) {
  document
    .querySelectorAll(".login-tab")
    .forEach((t) => t.classList.remove("active"));
  document
    .querySelectorAll(".login-panel")
    .forEach((p) => p.classList.remove("active"));
  document
    .querySelector(`.login-tab:nth-child(${tab === "normal" ? 1 : 2})`)
    .classList.add("active");
  document
    .getElementById(tab === "normal" ? "loginNormal" : "loginCrazy")
    .classList.add("active");
}

function switchCrazyMethod(method) {
  document
    .querySelectorAll("#loginCrazy .crazy-tab")
    .forEach((t) => t.classList.remove("active"));
  document
    .querySelectorAll("#loginCrazy .crazy-panel")
    .forEach((p) => p.classList.remove("active"));
  const methods = ["dot", "emoji", "color", "dynamic"];
  const idx = methods.indexOf(method);
  document
    .querySelectorAll("#loginCrazy .crazy-tab")
    [idx].classList.add("active");
  document
    .getElementById("crazy" + method.charAt(0).toUpperCase() + method.slice(1))
    .classList.add("active");
  if (method === "dynamic") startDynamicClock();
}

function initDotGrid(containerId, clickHandler) {
  const grid = document.getElementById(containerId);
  grid.innerHTML = "";
  for (let i = 0; i < 16; i++) {
    const cell = document.createElement("button");
    cell.className = "dot-cell";
    cell.textContent = "";
    cell.dataset.index = i;
    cell.onclick = () => clickHandler(i, cell);
    grid.appendChild(cell);
  }
}

function initEmojiGrid(containerId, clickHandler) {
  const grid = document.getElementById(containerId);
  grid.innerHTML = "";
  EMOJIS.forEach((em, i) => {
    const cell = document.createElement("button");
    cell.className = "emoji-cell";
    cell.textContent = em;
    cell.onclick = () => clickHandler(i, em, cell);
    grid.appendChild(cell);
  });
}

function initColorGrid(containerId, clickHandler) {
  const grid = document.getElementById(containerId);
  grid.innerHTML = "";
  COLORS.forEach((c, i) => {
    const cell = document.createElement("button");
    cell.className = "color-cell";
    cell.style.background = c;
    cell.onclick = () => clickHandler(i, c, cell);
    grid.appendChild(cell);
  });
}

// Login dot handlers
function loginDotClick(index, cell) {
  currentDotPattern.push(index);
  cell.classList.add("selected");
  cell.textContent = currentDotPattern.length;
}

function clearDotPattern() {
  currentDotPattern = [];
  document.querySelectorAll("#dotGrid .dot-cell").forEach((c) => {
    c.classList.remove("selected");
    c.textContent = "";
  });
}

function submitDotLogin() {
  if (currentDotPattern.length < 3)
    return showToast("Pattern too short", "error");
  if (!APP.auth.dotPattern.length)
    return showToast("No pattern set. Go to Settings first.", "error");
  if (
    JSON.stringify(currentDotPattern) === JSON.stringify(APP.auth.dotPattern)
  ) {
    loginSuccess();
  } else {
    showToast("Wrong pattern!", "error");
    clearDotPattern();
    renderSecretAuth();
  }
}

// Login emoji handlers
function loginEmojiClick(index, em, cell) {
  currentEmojiPattern.push(index);
  cell.classList.add("selected");
  const seq = document.getElementById("emojiSequence");
  seq.innerHTML += `<span style="font-size:1.2rem">${em}</span>`;
}

function clearEmojiPattern() {
  currentEmojiPattern = [];
  document
    .querySelectorAll("#emojiGrid .emoji-cell")
    .forEach((c) => c.classList.remove("selected"));
  document.getElementById("emojiSequence").innerHTML = "";
}

function submitEmojiLogin() {
  if (currentEmojiPattern.length < 3)
    return showToast("Sequence too short", "error");
  if (!APP.auth.emojiPattern.length)
    return showToast("No sequence set. Go to Settings first.", "error");
  if (
    JSON.stringify(currentEmojiPattern) ===
    JSON.stringify(APP.auth.emojiPattern)
  ) {
    loginSuccess();
  } else {
    showToast("Wrong sequence!", "error");
    clearEmojiPattern();
  }
}

// Login color handlers
function loginColorClick(index, color, cell) {
  currentColorPattern.push(index);
  cell.classList.add("selected");
  const seq = document.getElementById("colorSequence");
  seq.innerHTML += `<span style="display:inline-block;width:20px;height:20px;border-radius:4px;background:${color}"></span>`;
}

function clearColorPattern() {
  currentColorPattern = [];
  document
    .querySelectorAll("#colorGrid .color-cell")
    .forEach((c) => c.classList.remove("selected"));
  document.getElementById("colorSequence").innerHTML = "";
}

function submitColorLogin() {
  if (currentColorPattern.length < 3)
    return showToast("Pattern too short", "error");
  if (!APP.auth.colorPattern.length)
    return showToast("No pattern set. Go to Settings first.", "error");
  if (
    JSON.stringify(currentColorPattern) ===
    JSON.stringify(APP.auth.colorPattern)
  ) {
    loginSuccess();
  } else {
    showToast("Wrong pattern!", "error");
    clearColorPattern();
  }
}

// Dynamic time password
let dynamicClockInterval;
function startDynamicClock() {
  clearInterval(dynamicClockInterval);
  updateDynamicClock();
  dynamicClockInterval = setInterval(updateDynamicClock, 1000);
}

function updateDynamicClock() {
  const now = new Date();
  const el = document.getElementById("dynamicClock");
  if (el) el.textContent = now.toLocaleTimeString("en-US", { hour12: false });
}

function submitDynamicLogin() {
  const input = document.getElementById("dynamicPassInput").value;
  if (!APP.auth.dynamicBase)
    return showToast("No base password set. Go to Settings first.", "error");
  const now = new Date();
  const hhmm =
    now.getHours().toString().padStart(2, "0") +
    now.getMinutes().toString().padStart(2, "0");
  const expected = hhmm + APP.auth.dynamicBase;
  if (input === expected) {
    loginSuccess();
  } else {
    showToast("Wrong password! Hint: HHMM + your base", "error");
  }
}

function normalLogin() {
  const user = document.getElementById("loginUser").value.trim();
  const pass = document.getElementById("loginPass").value;
  if (!user || !pass) return showToast("Fill all fields", "error");
  if (!APP.auth.username)
    return showToast("No account exists. Create one first.", "error");
  if (
    user === APP.auth.username &&
    simpleHash(pass) === APP.auth.passwordHash
  ) {
    loginSuccess();
  } else {
    showToast("Wrong credentials!", "error");
  }
}

function normalSignup() {
  const user = document.getElementById("loginUser").value.trim();
  const pass = document.getElementById("loginPass").value;
  if (!user || !pass) return showToast("Fill all fields", "error");
  if (pass.length < 4) return showToast("Password too short (min 4)", "error");
  APP.auth.username = user;
  APP.auth.passwordHash = simpleHash(pass);
  if (!APP.auth.secretKey) APP.auth.secretKey = uid() + uid();
  saveData(APP);
  showToast("Account created! 🎉");
  loginSuccess();
}

function loginSuccess() {
  isLoggedIn = true;
  document.getElementById("loginScreen").style.display = "none";
  document.getElementById("appWrapper").style.display = "flex";
  document.getElementById("fabBtn").style.display = "flex";
  showToast("Welcome back! 🚀");
  initApp();
}

function skipLogin() {
  isLoggedIn = false;
  document.getElementById("loginScreen").style.display = "none";
  document.getElementById("appWrapper").style.display = "flex";
  document.getElementById("fabBtn").style.display = "flex";
  initApp();
}

function logoutApp() {
  isLoggedIn = false;
  secretNotesUnlocked = false;
  document.getElementById("loginScreen").style.display = "flex";
  document.getElementById("appWrapper").style.display = "none";
  document.getElementById("fabBtn").style.display = "none";
  // Reset login forms
  currentDotPattern = [];
  currentEmojiPattern = [];
  currentColorPattern = [];
  initLoginGrids();
}

function initLoginGrids() {
  initDotGrid("dotGrid", loginDotClick);
  initEmojiGrid("emojiGrid", loginEmojiClick);
  initColorGrid("colorGrid", loginColorClick);
  startDynamicClock();
}

// ===== NAVIGATION =====
document.querySelectorAll(".nav-item").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".nav-item")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const page = btn.dataset.page;
    document
      .querySelectorAll(".page")
      .forEach((p) => p.classList.remove("active"));
    document.getElementById("page-" + page).classList.add("active");
    renderPage(page);
  });
});

function renderPage(page) {
  if (page !== "secret-notes") {
    secretNotesUnlocked = false;
  }
  switch (page) {
    case "dashboard":
      renderDashboard();
      break;
    case "tasks":
      renderTasks();
      break;
    case "habits":
      renderHabits();
      break;
    case "notes":
      renderNotes();
      break;
    case "secret-notes":
      renderSecretNotes();
      break;
    case "goals":
      renderGoals();
      break;
    case "analytics":
      renderAnalytics();
      break;
    case "calendar":
      renderCalendar();
      break;
    case "pomodoro":
      renderPomodoro();
      break;
    case "settings":
      renderSettings();
      break;
  }
}

// ===== MODAL =====
function openModal(html) {
  document.getElementById("modalContent").innerHTML = html;
  document.getElementById("modalOverlay").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("modalOverlay").classList.add("hidden");
}

// ===== DASHBOARD =====
function renderDashboard() {
  showQuote();

  const todayStr = today();

  const completedToday = APP.tasks.filter(
    (t) => t.completed && t.completedAt && t.completedAt.startsWith(todayStr)
  ).length;

  // ✅ removed archived condition
  const pending = APP.tasks.filter((t) => !t.completed).length;

  const activeStreaks = APP.habits.filter((h) => h.streak > 0).length;

  const bestStreak = APP.habits.reduce(
    (max, h) => Math.max(max, h.bestStreak || 0),
    0
  );

  // ===== STATS =====
  document.getElementById("dashPoints").textContent = APP.totalPoints;
  document.getElementById("dashCompleted").textContent = completedToday;
  document.getElementById("dashPending").textContent = pending;
  document.getElementById("dashStreaks").textContent = activeStreaks;
  document.getElementById("sidebarPoints").textContent = APP.totalPoints;
  document.getElementById("sidebarStreak").textContent = bestStreak;

  // ===== TODAY TASKS =====
  const todayTasks = APP.tasks
    .filter((t) => !t.completed) // ✅ removed archived
    .slice(0, 5);

  const dashTasks = document.getElementById("dashTasks");

  if (!todayTasks.length) {
    dashTasks.innerHTML =
      '<div class="empty-state"><div class="empty-icon">✅</div><p>No pending tasks!</p></div>';
  } else {
    dashTasks.innerHTML = todayTasks
      .map(
        (t) => `
      <div class="task-item">
        <button class="task-check" onclick="toggleTask('${t.id}')"></button>

        <div class="task-info">
          <div class="task-title">${esc(t.title)}</div>

          ${
            t.deadline
              ? `<div class="task-meta">Due: ${t.deadline}</div>`
              : ""
          }
        </div>
      </div>
    `
      )
      .join("");
  }

  // ===== CHART =====
  renderDashChart();

  // ===== HABITS =====
  const dashHabits = document.getElementById("dashHabits");

  if (!APP.habits.length) {
    dashHabits.innerHTML =
      '<div class="empty-state" style="padding:16px"><p>No habits yet</p></div>';
  } else {
    dashHabits.innerHTML = APP.habits
      .slice(0, 4)
      .map(
        (h) => `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border)">
        <span style="font-size:0.85rem">${esc(h.title)}</span>
        <span style="font-family:var(--font-mono);color:var(--streak);font-weight:700">🔥 ${h.streak}</span>
      </div>
    `
      )
      .join("");
  }

  // ===== GOALS =====
  const dashGoals = document.getElementById("dashGoals");

  if (!APP.longTermGoals.length) {
    dashGoals.innerHTML =
      '<div class="empty-state" style="padding:16px"><p>No goals yet</p></div>';
  } else {
    dashGoals.innerHTML = APP.longTermGoals
      .slice(0, 3)
      .map(
        (g) => `
      <div style="margin-bottom:12px">
        <div style="display:flex;justify-content:space-between;font-size:0.85rem;margin-bottom:4px">
          <span>${esc(g.title)}</span>
          <span style="font-family:var(--font-mono);color:var(--primary);font-weight:600">${g.progress}%</span>
        </div>

        <div class="progress-bar">
          <div class="fill gold" style="width:${g.progress}%"></div>
        </div>
      </div>
    `
      )
      .join("");
  }
}

function renderDashChart() {
  const chart = document.getElementById("dashChart");
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const counts = days.map(
    (d) =>
      APP.tasks.filter((t) => t.completedAt && t.completedAt.startsWith(d))
        .length,
  );
  const max = Math.max(...counts, 1);
  chart.innerHTML = counts
    .map((c, i) => {
      const pct = (c / max) * 100;
      const dayIdx = new Date(days[i]).getDay();
      return `<div class="mini-bar" style="height:${Math.max(pct, 4)}%"><span class="mini-bar-label">${dayNames[dayIdx]}</span></div>`;
    })
    .join("");
}

// ===== TASKS =====
let taskFilter = "all";

document.querySelectorAll(".filter-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".filter-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    taskFilter = btn.dataset.filter;
    renderTasks();
  });
});

function renderTasks() {
  const quadrants = [
    "urgent-important",
    "not-urgent-important",
    "urgent-not-important",
    "not-urgent-not-important",
  ];

  const countIds = ["count-ui", "count-nui", "count-uni", "count-nuni"];

  quadrants.forEach((q, i) => {
    let tasks = APP.tasks.filter((t) => t.quadrant === q);

    // ✅ FILTER LOGIC
    if (taskFilter === "all") {
      tasks = tasks.filter((t) =>
        isWithinLast7Days(t.deadline)
      );
    }

    else if (taskFilter === "completed") {
      tasks = tasks.filter((t) =>
        t.completed && isWithinLast7Days(t.deadline)
      );
    }

    else if (taskFilter === "incomplete") {
      tasks = tasks.filter((t) =>
        !t.completed &&
        (
          isWithinLast7Days(t.deadline) ||
          isFuture(t.deadline)
        )
      );
    }

    // ✅ SORT BY DEADLINE (ASC)
    tasks.sort((a, b) => {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline) - new Date(b.deadline);
    });

    const container = document.getElementById("tasks-" + q);

    // ✅ COUNT (only incomplete)
    document.getElementById(countIds[i]).textContent = tasks.filter(
      (t) => !t.completed
    ).length;

    if (!tasks.length) {
      container.innerHTML =
        '<div class="empty-state"><p style="font-size:0.8rem">No tasks</p></div>';
      return;
    }

    // ✅ RENDER
    container.innerHTML = tasks
      .map((t) => {

        const showStrike =
          taskFilter === "all" && t.completed;

        const overdue = isOverdue(t.deadline, t.completed);

        return `
        <div class="matrix-task ${showStrike ? "completed" : ""}" 
             draggable="true" 
             data-id="${t.id}"
             ondragstart="dragTask(event,'${t.id}')">

          <!-- ✔ CHECK -->
          <button class="task-check ${t.completed ? "checked" : ""}" 
                  onclick="toggleTask('${t.id}')">
            ${t.completed ? "✓" : ""}
          </button>

          <!-- TITLE -->
          <span class="matrix-task-title ${overdue ? "overdue-text" : ""}">
            ${esc(t.title)}
          </span>

          <!-- DEADLINE + OVERDUE -->
          <span class="matrix-task-deadline">
            ${
              overdue
                ? `<span class="overdue-label">Overdue</span> ${t.deadline}`
                : (t.deadline || "")
            }
          </span>

          <!-- ACTIONS -->
          <div class="task-actions" style="opacity:1;">
           <button class="btn-icon" onclick="editTask('${t.id}')" title="Edit">✏️</button>
<button class="btn-icon" onclick="deleteTask('${t.id}')" title="Delete">🗑️</button>
          </div>

        </div>
        `;
      })
      .join("");
  });
}

function isOverdue(dateStr, completed) {
  if (!dateStr || completed) return false;

  const today = new Date();
  today.setHours(0,0,0,0);

  const taskDate = new Date(dateStr);
  taskDate.setHours(0,0,0,0);

  return taskDate < today;
}

function isWithinLast7Days(dateStr) {
  if (!dateStr) return false;

  const today = new Date();
  today.setHours(0,0,0,0);

  const taskDate = new Date(dateStr);
  taskDate.setHours(0,0,0,0);

  const diff = (today - taskDate) / (1000 * 60 * 60 * 24);

  return diff >= 0 && diff <= 6; // last 7 days incl today
}

function isFuture(dateStr) {
  if (!dateStr) return false;

  const today = new Date();
  today.setHours(0,0,0,0);

  const taskDate = new Date(dateStr);
  taskDate.setHours(0,0,0,0);

  return taskDate > today;
}

// Drag & Drop
function dragTask(e, id) {
  e.dataTransfer.setData("taskId", id);
}

document.querySelectorAll(".matrix-col").forEach((col) => {
  col.addEventListener("dragover", (e) => {
    e.preventDefault();
    col.style.borderColor = "var(--primary)";
  });
  col.addEventListener("dragleave", () => {
    col.style.borderColor = "var(--border)";
  });
  col.addEventListener("drop", (e) => {
    e.preventDefault();
    col.style.borderColor = "var(--border)";
    const id = e.dataTransfer.getData("taskId");
    const q = col.dataset.quadrant;
    const task = APP.tasks.find((t) => t.id === id);
    if (task) {
      task.quadrant = q;
      saveData(APP);
      renderTasks();
    }
  });
});

function toggleTask(id) {
  const t = APP.tasks.find((t) => t.id === id);
  if (!t) return;
  t.completed = !t.completed;
  t.completedAt = t.completed ? new Date().toISOString() : undefined;
  if (t.completed) {
    APP.totalPoints += 10;
    logPoints(10, "Task completed");
    showToast("+10 points! 🎉");
  } else {
    APP.totalPoints = Math.max(0, APP.totalPoints - 10);
  }
  saveData(APP);
  renderTasks();
  renderDashboard();
}

function archiveTask(id) {
  const t = APP.tasks.find((t) => t.id === id);
  if (t) {
    t.archived = true;
    saveData(APP);
    renderTasks();
    showToast("Task archived 📦");
  }
}

function deleteTask(id) {
  APP.tasks = APP.tasks.filter((t) => t.id !== id);
  saveData(APP);
  renderTasks();
  showToast("Task deleted");
}

function openTaskModal(editId) {
  const task = editId ? APP.tasks.find((t) => t.id === editId) : null;
  openModal(`
    <h3>${task ? "Edit" : "New"} Task</h3>
    <div class="form-group">
      <label>Title</label>
      <input type="text" id="taskTitle" value="${task ? esc(task.title) : ""}" placeholder="What needs to be done?">
    </div>
    <div class="form-group">
      <label>Quadrant</label>
      <select id="taskQuadrant">
        <option value="urgent-important" ${task?.quadrant === "urgent-important" ? "selected" : ""}>Urgent & Important</option>
        <option value="not-urgent-important" ${task?.quadrant === "not-urgent-important" ? "selected" : ""}>Not Urgent & Important</option>
        <option value="urgent-not-important" ${task?.quadrant === "urgent-not-important" ? "selected" : ""}>Urgent & Not Important</option>
        <option value="not-urgent-not-important" ${task?.quadrant === "not-urgent-not-important" ? "selected" : ""}>Not Urgent & Not Important</option>
      </select>
    </div>
    <div class="form-group">
      <label>Deadline</label>
      <input type="date" id="taskDeadline" value="${task?.deadline || ""}">
    </div>
    <div class="form-actions">
      <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveTask('${editId || ""}')">${task ? "Update" : "Create"}</button>
    </div>
  `);
}

function editTask(id) {
  openTaskModal(id);
}
function saveTask(editId) {
  const title = document.getElementById('taskTitle').value.trim();
  const quadrant = document.getElementById('taskQuadrant').value;
  const deadline = document.getElementById('taskDeadline').value;

  // ✅ VALIDATION
  if (!title) {
    return showToast('Title is required', 'error');
  }

  if (!quadrant) {
    return showToast('Please select a quadrant', 'error');
  }

  if (!deadline) {
    return showToast('Deadline is required', 'error');
  }

  // ✅ SAVE LOGIC
  if (editId) {
    const t = APP.tasks.find(t => t.id === editId);
    if (t) {
      t.title = title;
      t.quadrant = quadrant;
      t.deadline = deadline;
    }
  } else {
    APP.tasks.push({
      id: uid(),
      title,
      quadrant,
      completed: false,
      archived: false,
      deadline,
      createdAt: new Date().toISOString()
    });
  }

  saveData(APP);
  closeModal();
  renderTasks();
  showToast(editId ? 'Task updated' : 'Task created! 🚀');
}


// ===== HABITS =====
function renderHabits() {
  const list = document.getElementById("habitsList");
  if (!APP.habits.length) {
    list.innerHTML =
      '<div class="empty-state"><div class="empty-icon">💪</div><p>No habits yet. Start building good habits!</p></div>';
    return;
  }
  const todayStr = today();
  list.innerHTML = APP.habits
    .map((h) => {
      const doneToday = h.completedDates && h.completedDates.includes(todayStr);
      const skippedToday = h.skippedDates && h.skippedDates.includes(todayStr);
      return `
      <div class="habit-item">
        <button class="habit-check-btn ${doneToday ? "done" : skippedToday ? "skipped" : ""}" 
                onclick="completeHabit('${h.id}')">
          ${doneToday ? "✓" : skippedToday ? "—" : ""}
        </button>
        <div class="habit-info">
          <h4>${esc(h.title)}</h4>
          <p>${h.frequency} · ${h.points} pts per completion</p>
        </div>
        <div class="habit-stats">
          <div class="habit-stat"><div class="value streak">🔥 ${h.streak}</div><div class="label">Streak</div></div>
          <div class="habit-stat"><div class="value points">${h.points * (h.completedDates?.length || 0)}</div><div class="label">Points</div></div>
        </div>
        <div class="habit-actions">
          <button class="btn-icon" onclick="skipHabit('${h.id}')" title="Skip" style="width:28px;height:28px;font-size:11px">⏭</button>
          <button class="btn-icon" onclick="editHabit('${h.id}')" style="width:28px;height:28px;font-size:12px">✎</button>
          <button class="btn-icon" onclick="deleteHabit('${h.id}')" style="width:28px;height:28px;font-size:12px">✕</button>
        </div>
      </div>
    `;
    })
    .join("");
}

function completeHabit(id) {
  const h = APP.habits.find((h) => h.id === id);
  if (!h) return;
  if (!h.completedDates) h.completedDates = [];
  if (!h.skippedDates) h.skippedDates = [];
  const todayStr = today();
  if (h.completedDates.includes(todayStr))
    return showToast("Already done today!");
  h.skippedDates = h.skippedDates.filter((d) => d !== todayStr);
  h.completedDates.push(todayStr);
  h.streak = (h.streak || 0) + 1;
  h.bestStreak = Math.max(h.bestStreak || 0, h.streak);
  APP.totalPoints += h.points;
  logPoints(h.points, "Habit: " + h.title);
  saveData(APP);
  renderHabits();
  renderDashboard();
  showToast(`+${h.points} points! Streak: ${h.streak} 🔥`);
}

function skipHabit(id) {
  const h = APP.habits.find((h) => h.id === id);
  if (!h) return;
  if (!h.skippedDates) h.skippedDates = [];
  const todayStr = today();
  if (h.completedDates?.includes(todayStr) || h.skippedDates.includes(todayStr))
    return;
  h.skippedDates.push(todayStr);
  saveData(APP);
  renderHabits();
  showToast("Habit skipped");
}

function deleteHabit(id) {
  APP.habits = APP.habits.filter((h) => h.id !== id);
  saveData(APP);
  renderHabits();
  showToast("Habit deleted");
}

function openHabitModal(editId) {
  const h = editId ? APP.habits.find((h) => h.id === editId) : null;
  const defaultPts = APP.settings.defaultHabitPoints || 5;
  openModal(`
    <h3>${h ? "Edit" : "New"} Habit</h3>
    <div class="form-group">
      <label>Habit Name</label>
      <input type="text" id="habitTitle" value="${h ? esc(h.title) : ""}" placeholder="e.g. Drink 8 glasses of water">
    </div>
    <div class="form-group">
      <label>Frequency</label>
      <select id="habitFreq">
        <option value="daily" ${h?.frequency === "daily" ? "selected" : ""}>Daily</option>
        <option value="weekly" ${h?.frequency === "weekly" ? "selected" : ""}>Weekly</option>
      </select>
    </div>
    <div class="form-group">
      <label>Points per completion</label>
      <input type="number" id="habitPoints" value="${h?.points || defaultPts}" min="1" max="100">
    </div>
    <div class="form-actions">
      <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveHabit('${editId || ""}')">${h ? "Update" : "Create"}</button>
    </div>
  `);
}

function editHabit(id) {
  openHabitModal(id);
}

function saveHabit(editId) {
  const title = document.getElementById("habitTitle").value.trim();
  if (!title) return showToast("Name required", "error");
  const frequency = document.getElementById("habitFreq").value;
  const points = parseInt(document.getElementById("habitPoints").value) || 5;

  if (editId) {
    const h = APP.habits.find((h) => h.id === editId);
    if (h) {
      h.title = title;
      h.frequency = frequency;
      h.points = points;
    }
  } else {
    APP.habits.push({
      id: uid(),
      title,
      frequency,
      points,
      streak: 0,
      bestStreak: 0,
      completedDates: [],
      skippedDates: [],
      createdAt: new Date().toISOString(),
    });
  }
  saveData(APP);
  closeModal();
  renderHabits();
  showToast(editId ? "Habit updated" : "Habit created! 💪");
}

// ===== NOTES (Full WYSIWYG) =====
let currentNoteId = null;
let autoSaveTimer = null;

function renderNotes() {
  renderNotesSidebar();
}

function renderNotesSidebar() {
  const sidebar = document.getElementById("notesSidebar");
  if (!APP.generalNotes.length) {
    sidebar.innerHTML =
      '<div style="text-align:center;padding:20px;color:var(--text-muted);font-size:0.8rem">No notes yet</div>';
    return;
  }
  sidebar.innerHTML = APP.generalNotes
    .map(
      (n) => `
    <div class="note-sidebar-item ${currentNoteId === n.id ? "active" : ""}" onclick="selectNote('${n.id}')" style="border-left-color:${n.color || "#f59e0b"}">
      <h5>${esc(n.title) || "Untitled"}</h5>
      <p>${new Date(n.updatedAt).toLocaleDateString()}</p>
    </div>
  `,
    )
    .join("");
}

function selectNote(id) {
  currentNoteId = id;
  const n = APP.generalNotes.find((n) => n.id === id);
  if (!n) return;
  document.getElementById("editorPlaceholder").style.display = "none";
  document.getElementById("editorWrapper").classList.remove("hidden");
  document.getElementById("editorTitle").value = n.title || "";
  document.getElementById("editorContent").innerHTML = n.content || "";
  document.getElementById("editorNoteColor").value = n.color || "#f59e0b";
  renderNotesSidebar();
}

function createNewNote() {
  const note = {
    id: uid(),
    title: "New Note",
    content: "",
    color: "#f59e0b",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  APP.generalNotes.unshift(note);
  saveData(APP);
  selectNote(note.id);
  renderNotesSidebar();
}

function autoSaveNote() {
  clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(() => {
    if (!currentNoteId) return;
    const n = APP.generalNotes.find((n) => n.id === currentNoteId);
    if (!n) return;
    n.title = document.getElementById("editorTitle").value;
    n.content = document.getElementById("editorContent").innerHTML;
    n.updatedAt = new Date().toISOString();
    saveData(APP);
    renderNotesSidebar();
  }, 500);
}

function updateNoteColor(color) {
  if (!currentNoteId) return;
  const n = APP.generalNotes.find((n) => n.id === currentNoteId);
  if (n) {
    n.color = color;
    saveData(APP);
    renderNotesSidebar();
  }
}

function deleteCurrentNote() {
  if (!currentNoteId) return;
  APP.generalNotes = APP.generalNotes.filter((n) => n.id !== currentNoteId);
  currentNoteId = null;
  saveData(APP);
  document.getElementById("editorWrapper").classList.add("hidden");
  document.getElementById("editorPlaceholder").style.display = "flex";
  renderNotesSidebar();
  showToast("Note deleted");
}

function execCmd(cmd, val) {
  document.execCommand(cmd, false, val || null);
  document.getElementById("editorContent").focus();
}

function insertHR() {
  document.execCommand(
    "insertHTML",
    false,
    '<hr style="border:none;border-top:1px solid var(--border);margin:12px 0">',
  );
}

function addBorderStyle(val) {
  const sel = window.getSelection();
  if (!sel.rangeCount) return;
  const range = sel.getRangeAt(0);
  let container = range.commonAncestorContainer;
  if (container.nodeType === 3) container = container.parentElement;
  if (val === "none") {
    container.style.border = "none";
    container.style.padding = "";
  } else {
    container.style.border = val;
    container.style.padding = "8px";
    container.style.borderRadius = "6px";
  }
  autoSaveNote();
}

function addShadowStyle(val) {
  const sel = window.getSelection();
  if (!sel.rangeCount) return;
  const range = sel.getRangeAt(0);
  let container = range.commonAncestorContainer;
  if (container.nodeType === 3) container = container.parentElement;
  container.style.boxShadow = val === "none" ? "none" : val;
  autoSaveNote();
}

// ===== SECRET NOTES =====
let currentSecretNoteId = null;
let secretAutoSaveTimer = null;

function renderSecretNotes() {
  if (secretNotesUnlocked) {
    document.getElementById("secretNotesLock").style.display = "none";
    document.getElementById("secretNotesContent").style.display = "block";
    document.getElementById("secretAddBtn").style.display = "inline-flex";
    renderSecretNotesSidebar();
  } else {
    document.getElementById("secretNotesLock").style.display = "block";
    document.getElementById("secretNotesContent").style.display = "none";
    document.getElementById("secretAddBtn").style.display = "none";
    renderSecretAuth();
  }
}

function renderSecretAuth() {
  // ✅ Reset patterns (fix numbering issue)
  secretDotPat = [];
  secretEmojiPat = [];
  secretColorPat = [];

  const area = document.getElementById("secretAuthArea");

  // ✅ Get current method (already forced to dot on refresh)
  const method = APP.settings.secretMethod || "dot";

  // ✅ Fix tab UI
  const tabs = document.querySelectorAll("#secretNotesLock .crazy-tab");
  tabs.forEach((t) => t.classList.remove("active"));

  const methods = ["dot", "emoji", "color", "dynamic"];
  const index = methods.indexOf(method);

  if (index !== -1) {
    tabs[index].classList.add("active");
  } else {
    tabs[0].classList.add("active"); // fallback
  }

  // ✅ Render UI based on method
  if (method === "dot") {
    area.innerHTML = `
      <div class="dot-grid" id="secretDotGrid"></div>
      <div class="crazy-actions">
        <button class="btn btn-secondary btn-sm" onclick="clearSecretDot()">Clear</button>
        <button class="btn btn-primary btn-sm" onclick="submitSecretDot()">Unlock</button>
      </div>`;

    setTimeout(() => initDotGrid("secretDotGrid", secretDotClick), 0);
  } else if (method === "emoji") {
    area.innerHTML = `
      <div class="emoji-grid" id="secretEmojiGrid"></div>
      <div class="crazy-sequence" id="secretEmojiSeq"></div>
      <div class="crazy-actions">
        <button class="btn btn-secondary btn-sm" onclick="clearSecretEmoji()">Clear</button>
        <button class="btn btn-primary btn-sm" onclick="submitSecretEmoji()">Unlock</button>
      </div>`;

    setTimeout(() => initEmojiGrid("secretEmojiGrid", secretEmojiClick), 0);
  } else if (method === "color") {
    area.innerHTML = `
      <div class="color-grid" id="secretColorGrid"></div>
      <div class="crazy-sequence" id="secretColorSeq"></div>
      <div class="crazy-actions">
        <button class="btn btn-secondary btn-sm" onclick="clearSecretColor()">Clear</button>
        <button class="btn btn-primary btn-sm" onclick="submitSecretColor()">Unlock</button>
      </div>`;

    setTimeout(() => initColorGrid("secretColorGrid", secretColorClick), 0);
  } else {
    area.innerHTML = `
      <div class="dynamic-clock" id="secretDynClock">--:--</div>
      <div class="form-group">
        <input type="password" id="secretDynInput" placeholder="HHMM + base password">
      </div>
      <button class="btn btn-primary btn-full" onclick="submitSecretDynamic()">Unlock</button>`;

    setTimeout(() => {
      updateSecretDynClock();
      setInterval(updateSecretDynClock, 1000);
    }, 0);
  }
}

function updateSecretDynClock() {
  const el = document.getElementById("secretDynClock");
  if (el)
    el.textContent = new Date().toLocaleTimeString("en-US", { hour12: false });
}

let secretDotPat = [],
  secretEmojiPat = [],
  secretColorPat = [];

function secretDotClick(i, cell) {
  secretDotPat.push(i);
  cell.classList.add("selected");
  cell.textContent = secretDotPat.length;
}
function clearSecretDot() {
  secretDotPat = [];
  document.querySelectorAll("#secretDotGrid .dot-cell").forEach((c) => {
    c.classList.remove("selected");
    c.textContent = "";
  });
}
function submitSecretDot() {
  if (!APP.auth.dotPattern.length)
    return showToast("No pattern set. Go to Settings.", "error");
  if (JSON.stringify(secretDotPat) === JSON.stringify(APP.auth.dotPattern)) {
    secretNotesUnlocked = true;
    renderSecretNotes();
    showToast("Vault unlocked! 🔓");
  } else {
    showToast("Wrong pattern!", "error");
    clearSecretDot();
  }
}

function secretEmojiClick(i, em, cell) {
  secretEmojiPat.push(i);
  cell.classList.add("selected");
  const s = document.getElementById("secretEmojiSeq");
  if (s) s.innerHTML += `<span style="font-size:1.2rem">${em}</span>`;
}
function clearSecretEmoji() {
  secretEmojiPat = [];
  document
    .querySelectorAll("#secretEmojiGrid .emoji-cell")
    .forEach((c) => c.classList.remove("selected"));
  const s = document.getElementById("secretEmojiSeq");
  if (s) s.innerHTML = "";
}
function submitSecretEmoji() {
  if (!APP.auth.emojiPattern.length)
    return showToast("No sequence set. Go to Settings.", "error");
  if (
    JSON.stringify(secretEmojiPat) === JSON.stringify(APP.auth.emojiPattern)
  ) {
    secretNotesUnlocked = true;
    renderSecretNotes();
    showToast("Vault unlocked! 🔓");
  } else {
    showToast("Wrong sequence!", "error");
    clearSecretEmoji();
  }
}

function secretColorClick(i, c, cell) {
  secretColorPat.push(i);
  cell.classList.add("selected");
  const s = document.getElementById("secretColorSeq");
  if (s)
    s.innerHTML += `<span style="display:inline-block;width:20px;height:20px;border-radius:4px;background:${c}"></span>`;
}
function clearSecretColor() {
  secretColorPat = [];
  document
    .querySelectorAll("#secretColorGrid .color-cell")
    .forEach((c) => c.classList.remove("selected"));
  const s = document.getElementById("secretColorSeq");
  if (s) s.innerHTML = "";
}
function submitSecretColor() {
  if (!APP.auth.colorPattern.length)
    return showToast("No pattern set. Go to Settings.", "error");
  if (
    JSON.stringify(secretColorPat) === JSON.stringify(APP.auth.colorPattern)
  ) {
    secretNotesUnlocked = true;
    renderSecretNotes();
    showToast("Vault unlocked! 🔓");
  } else {
    showToast("Wrong pattern!", "error");
    clearSecretColor();
  }
}

function submitSecretDynamic() {
  const input = document.getElementById("secretDynInput").value;
  if (!APP.auth.dynamicBase)
    return showToast("No base password set. Go to Settings.", "error");
  const now = new Date();
  const hhmm =
    now.getHours().toString().padStart(2, "0") +
    now.getMinutes().toString().padStart(2, "0");
  if (input === hhmm + APP.auth.dynamicBase) {
    secretNotesUnlocked = true;
    renderSecretNotes();
    showToast("Vault unlocked! 🔓");
  } else {
    showToast("Wrong password!", "error");
  }
}
function switchSecretMethod(method) {
  const tabs = document.querySelectorAll("#secretNotesLock .crazy-tab");

  tabs.forEach((t) => t.classList.remove("active"));

  const methods = ["dot", "emoji", "color", "dynamic"];
  const index = methods.indexOf(method);

  if (index !== -1) {
    tabs[index].classList.add("active");
  }

  APP.settings.secretMethod = method;
  saveData(APP);

  renderSecretAuth();
}

function renderSecretNotesSidebar() {
  const sidebar = document.getElementById("secretNotesSidebar");
  if (!APP.secretNotes.length) {
    sidebar.innerHTML =
      '<div style="text-align:center;padding:20px;color:var(--text-muted);font-size:0.8rem">No secret notes yet</div>';
    return;
  }
  sidebar.innerHTML = APP.secretNotes
    .map(
      (n) => `
    <div class="note-sidebar-item ${currentSecretNoteId === n.id ? "active" : ""}" onclick="selectSecretNote('${n.id}')" style="border-left-color:#8b5cf6">
      <h5>🔒 ${esc(n.title) || "Untitled"}</h5>
      <p>${new Date(n.updatedAt).toLocaleDateString()}</p>
    </div>
  `,
    )
    .join("");
}

function selectSecretNote(id) {
  currentSecretNoteId = id;
  const n = APP.secretNotes.find((n) => n.id === id);
  if (!n) return;
  document.getElementById("secretEditorPlaceholder").style.display = "none";
  document.getElementById("secretEditorWrapper").classList.remove("hidden");
  document.getElementById("secretEditorTitle").value = n.title || "";
  const key = APP.auth.secretKey || "";
  document.getElementById("secretEditorContent").innerHTML = n.encrypted
    ? decryptText(n.content, key)
    : n.content || "";
  renderSecretNotesSidebar();
}

function createNewSecretNote() {
  const note = {
    id: uid(),
    title: "Secret Note",
    content: "",
    encrypted: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  APP.secretNotes.unshift(note);
  saveData(APP);
  selectSecretNote(note.id);
}

function autoSaveSecretNote() {
  clearTimeout(secretAutoSaveTimer);
  secretAutoSaveTimer = setTimeout(() => {
    if (!currentSecretNoteId) return;
    const n = APP.secretNotes.find((n) => n.id === currentSecretNoteId);
    if (!n) return;
    n.title = document.getElementById("secretEditorTitle").value;
    const key = APP.auth.secretKey || "";
    n.content = encryptText(
      document.getElementById("secretEditorContent").innerHTML,
      key,
    );
    n.encrypted = true;
    n.updatedAt = new Date().toISOString();
    saveData(APP);
    renderSecretNotesSidebar();
  }, 500);
}

function execCmdSecret(cmd, val) {
  document.execCommand(cmd, false, val || null);
  document.getElementById("secretEditorContent").focus();
}

function deleteCurrentSecretNote() {
  if (!currentSecretNoteId) return;
  APP.secretNotes = APP.secretNotes.filter((n) => n.id !== currentSecretNoteId);
  currentSecretNoteId = null;
  saveData(APP);
  document.getElementById("secretEditorWrapper").classList.add("hidden");
  document.getElementById("secretEditorPlaceholder").style.display = "flex";
  renderSecretNotesSidebar();
  showToast("Secret note deleted");
}

// ===== GOALS =====
function renderGoals() {
  const list = document.getElementById("goalsList");
  if (!APP.longTermGoals.length) {
    list.innerHTML =
      '<div class="empty-state"><div class="empty-icon">🎯</div><p>No goals yet. Set your first long-term goal!</p></div>';
    return;
  }
  list.innerHTML = APP.longTermGoals
    .map(
      (g) => `
    <div class="goal-item">
      <div class="goal-header">
        <h4>${esc(g.title)}</h4>
        <span class="goal-pct">${g.progress}%</span>
      </div>
      <div class="progress-bar"><div class="fill gold" style="width:${g.progress}%"></div></div>
      <div class="goal-deadline">Deadline: ${g.deadline || "Not set"}</div>
      <div class="goal-actions">
        <button class="btn btn-sm btn-secondary" onclick="adjustGoalProgress('${g.id}', -10)">−10%</button>
        <button class="btn btn-sm btn-success" onclick="adjustGoalProgress('${g.id}', 10)">+10%</button>
        <button class="btn btn-sm btn-secondary" onclick="editGoal('${g.id}')">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteGoal('${g.id}')">Delete</button>
      </div>
    </div>
  `,
    )
    .join("");
}

function adjustGoalProgress(id, delta) {
  const g = APP.longTermGoals.find((g) => g.id === id);
  if (!g) return;
  g.progress = Math.max(0, Math.min(100, g.progress + delta));
  if (g.progress === 100) {
    APP.totalPoints += 50;
    logPoints(50, "Goal completed");
    showToast("Goal completed! +50 points! 🏆");
  }
  saveData(APP);
  renderGoals();
  renderDashboard();
}

function deleteGoal(id) {
  APP.longTermGoals = APP.longTermGoals.filter((g) => g.id !== id);
  saveData(APP);
  renderGoals();
  showToast("Goal deleted");
}

function openGoalModal(editId) {
  const g = editId ? APP.longTermGoals.find((g) => g.id === editId) : null;
  openModal(`
    <h3>${g ? "Edit" : "New"} Goal</h3>
    <div class="form-group">
      <label>Goal Title</label>
      <input type="text" id="goalTitle" value="${g ? esc(g.title) : ""}" placeholder="e.g. Learn Spanish">
    </div>
    <div class="form-group">
      <label>Deadline</label>
      <input type="date" id="goalDeadline" value="${g?.deadline || ""}">
    </div>
    <div class="form-group">
      <label>Progress (%)</label>
      <input type="number" id="goalProgress" value="${g?.progress || 0}" min="0" max="100">
    </div>
    <div class="form-actions">
      <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveGoal('${editId || ""}')">${g ? "Update" : "Create"}</button>
    </div>
  `);
}

function editGoal(id) {
  openGoalModal(id);
}

function saveGoal(editId) {
  const title = document.getElementById("goalTitle").value.trim();
  if (!title) return showToast("Title required", "error");
  const deadline = document.getElementById("goalDeadline").value;
  const progress = Math.max(
    0,
    Math.min(100, parseInt(document.getElementById("goalProgress").value) || 0),
  );

  if (editId) {
    const g = APP.longTermGoals.find((g) => g.id === editId);
    if (g) {
      g.title = title;
      g.deadline = deadline;
      g.progress = progress;
    }
  } else {
    APP.longTermGoals.push({
      id: uid(),
      title,
      deadline,
      progress,
      createdAt: new Date().toISOString(),
    });
  }
  saveData(APP);
  closeModal();
  renderGoals();
  showToast(editId ? "Goal updated" : "Goal created! 🎯");
}

// ===== ANALYTICS =====
function logPoints(pts, reason) {
  if (!APP.pointsHistory) APP.pointsHistory = [];
  APP.pointsHistory.push({
    date: new Date().toISOString(),
    points: pts,
    reason,
  });
  if (APP.pointsHistory.length > 500)
    APP.pointsHistory = APP.pointsHistory.slice(-500);
}

function renderAnalytics() {
  document.getElementById("anPoints").textContent = APP.totalPoints;
  document.getElementById("anTasksDone").textContent = APP.tasks.filter(
    (t) => t.completed,
  ).length;
  document.getElementById("anHabitsCount").textContent = APP.habits.length;
  document.getElementById("anPomSessions").textContent =
    APP.pomodoroSessions || 0;

  renderTaskCompletionChart();
  renderHabitStreaksChart();
  renderProductivityScore();
  renderPointsHistoryChart();
}

function renderTaskCompletionChart() {
  const container = document.getElementById("chartTaskCompletion");
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const counts = days.map(
    (d) =>
      APP.tasks.filter((t) => t.completedAt && t.completedAt.startsWith(d))
        .length,
  );
  const max = Math.max(...counts, 1);
  const colors = [
    "#3b82f6",
    "#6366f1",
    "#8b5cf6",
    "#a855f7",
    "#ec4899",
    "#f43f5e",
    "#ef4444",
  ];
  container.innerHTML = counts
    .map((c, i) => {
      const pct = (c / max) * 100;
      const dayIdx = new Date(days[i]).getDay();
      return `<div class="chart-bar" style="height:${Math.max(pct, 4)}%;background:${colors[i]}">
      <span class="chart-bar-value">${c}</span>
      <span class="chart-bar-label">${dayNames[dayIdx]}</span>
    </div>`;
    })
    .join("");
}

function renderHabitStreaksChart() {
  const container = document.getElementById("chartHabitStreaks");
  if (!APP.habits.length) {
    container.innerHTML =
      '<div class="empty-state" style="padding:20px"><p>No habits</p></div>';
    return;
  }
  const max = Math.max(...APP.habits.map((h) => h.bestStreak || 0), 1);
  const colors = [
    "#22c55e",
    "#f59e0b",
    "#3b82f6",
    "#8b5cf6",
    "#ef4444",
    "#ec4899",
    "#06b6d4",
    "#f97316",
  ];
  container.innerHTML = APP.habits
    .slice(0, 8)
    .map((h, i) => {
      const pct = ((h.streak || 0) / max) * 100;
      return `<div class="chart-bar" style="height:${Math.max(pct, 4)}%;background:${colors[i % colors.length]}">
      <span class="chart-bar-value">${h.streak}</span>
      <span class="chart-bar-label" style="max-width:40px;overflow:hidden;text-overflow:ellipsis">${esc(h.title).slice(0, 6)}</span>
    </div>`;
    })
    .join("");
}

function renderProductivityScore() {
  const container = document.getElementById("productivityScore");
  const todayStr = today();
  const tasksToday = APP.tasks.filter(
    (t) => t.completedAt && t.completedAt.startsWith(todayStr),
  ).length;
  const habitsToday = APP.habits.filter((h) =>
    h.completedDates?.includes(todayStr),
  ).length;
  const totalHabits = APP.habits.length || 1;
  const score = Math.min(
    100,
    Math.round(
      tasksToday * 10 +
        (habitsToday / totalHabits) * 50 +
        Math.min(APP.pomodoroSessions || 0, 4) * 10,
    ),
  );

  container.innerHTML = `
    <div class="score-ring" style="border-color: ${score >= 70 ? "var(--success)" : score >= 40 ? "var(--primary)" : "var(--danger)"}">
      <div class="score-ring-value">${score}</div>
      <div class="score-ring-label">Score</div>
    </div>
  `;
}

function renderPointsHistoryChart() {
  const container = document.getElementById("chartPointsHistory");
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  const history = APP.pointsHistory || [];
  const pointsByDay = days.map((d) =>
    history
      .filter((p) => p.date.startsWith(d))
      .reduce((sum, p) => sum + p.points, 0),
  );
  const max = Math.max(...pointsByDay, 1);
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  container.innerHTML = pointsByDay
    .map((p, i) => {
      const pct = (p / max) * 100;
      const dayIdx = new Date(days[i]).getDay();
      return `<div class="chart-bar" style="height:${Math.max(pct, 4)}%;background:linear-gradient(to top, #f59e0b, #f97316)">
      <span class="chart-bar-value">${p}</span>
      <span class="chart-bar-label">${dayNames[dayIdx]}</span>
    </div>`;
    })
    .join("");
}

// ===== CALENDAR =====
let calYear, calMonth;
{
  const now = new Date();
  calYear = now.getFullYear();
  calMonth = now.getMonth();
}

function calNavMonth(delta) {
  calMonth += delta;
  if (calMonth > 11) {
    calMonth = 0;
    calYear++;
  }
  if (calMonth < 0) {
    calMonth = 11;
    calYear--;
  }
  renderCalendar();
}

function renderCalendar() {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  document.getElementById("calMonthLabel").textContent =
    `${monthNames[calMonth]} ${calYear}`;

  const grid = document.getElementById("calendarGrid");
  const dayHeaders = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  let html = dayHeaders
    .map((d) => `<div class="cal-header-cell">${d}</div>`)
    .join("");

  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const todayStr = today();

  // Previous month padding
  const prevMonthDays = new Date(calYear, calMonth, 0).getDate();
  for (let i = firstDay - 1; i >= 0; i--) {
    html += `<div class="cal-cell other-month"><div class="cal-day">${prevMonthDays - i}</div></div>`;
  }

  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${calYear}-${(calMonth + 1).toString().padStart(2, "0")}-${d.toString().padStart(2, "0")}`;
    const isToday = dateStr === todayStr;
    const tasks = APP.tasks.filter(
      (t) =>
        t.deadline === dateStr ||
        (t.completedAt && t.completedAt.startsWith(dateStr)),
    );
    const habits = APP.habits.filter((h) =>
      h.completedDates?.includes(dateStr),
    );
    const goals = APP.longTermGoals.filter((g) => g.deadline === dateStr);

    let dots = "";
    tasks.forEach(() => (dots += '<span class="cal-dot task"></span>'));
    habits.forEach(() => (dots += '<span class="cal-dot habit"></span>'));
    goals.forEach(() => (dots += '<span class="cal-dot goal"></span>'));

    html += `<div class="cal-cell ${isToday ? "today" : ""}" onclick="showCalDay('${dateStr}')">
      <div class="cal-day">${d}</div>
      <div class="cal-dots">${dots}</div>
    </div>`;
  }

  // Next month padding
  const totalCells = firstDay + daysInMonth;
  const remaining = (7 - (totalCells % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    html += `<div class="cal-cell other-month"><div class="cal-day">${i}</div></div>`;
  }

  grid.innerHTML = html;
}

function showCalDay(dateStr) {
  const detail = document.getElementById("calDayDetail");
  detail.style.display = "block";
  document.getElementById("calDayTitle").textContent = dateStr;

  const tasks = APP.tasks.filter(
    (t) =>
      t.deadline === dateStr ||
      (t.completedAt && t.completedAt.startsWith(dateStr)),
  );
  const habits = APP.habits.filter((h) => h.completedDates?.includes(dateStr));

  let html = "";
  if (tasks.length) {
    html +=
      '<h4 style="font-size:0.8rem;color:var(--text-muted);margin-bottom:8px">TASKS</h4>';
    html += tasks
      .map(
        (t) =>
          `<div class="task-item"><div class="task-info"><div class="task-title">${esc(t.title)} ${t.completed ? "✅" : ""}</div></div></div>`,
      )
      .join("");
  }
  if (habits.length) {
    html +=
      '<h4 style="font-size:0.8rem;color:var(--text-muted);margin:12px 0 8px">HABITS COMPLETED</h4>';
    html += habits
      .map(
        (h) =>
          `<div class="task-item"><div class="task-info"><div class="task-title">✅ ${esc(h.title)}</div></div></div>`,
      )
      .join("");
  }
  if (!html)
    html =
      '<div class="empty-state" style="padding:20px"><p>Nothing on this day</p></div>';
  document.getElementById("calDayContent").innerHTML = html;
}

// ===== POMODORO =====
let pomTimer = null;
let pomSeconds = 0;
let pomRunning = false;
let pomBreak = false;

function renderPomodoro() {
  const mins = APP.pomodoroMinutes || 25;
  document.getElementById("pomodoroMinInput").value = mins;
  const settingsEl = document.getElementById("settingsPomMinutes");
  if (settingsEl) settingsEl.value = mins;
  document.getElementById("pomodoroSessions").textContent =
    APP.pomodoroSessions || 0;
  if (!pomRunning) {
    pomSeconds = mins * 60;
    updatePomodoroDisplay();
  }
}

function updatePomodoroDisplay() {
  const m = Math.floor(pomSeconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (pomSeconds % 60).toString().padStart(2, "0");
  document.getElementById("pomodoroTime").textContent = m + ":" + s;
}

function togglePomodoro() {
  if (pomRunning) {
    clearInterval(pomTimer);
    pomRunning = false;
    document.getElementById("pomodoroStartBtn").textContent = "Resume";
    document
      .getElementById("pomodoroCircle")
      .classList.remove("running", "break");
  } else {
    if (pomSeconds <= 0) pomSeconds = (APP.pomodoroMinutes || 25) * 60;
    pomRunning = true;
    document.getElementById("pomodoroStartBtn").textContent = "Pause";
    document
      .getElementById("pomodoroCircle")
      .classList.add(pomBreak ? "break" : "running");
    pomTimer = setInterval(() => {
      pomSeconds--;
      updatePomodoroDisplay();
      if (pomSeconds <= 0) {
        clearInterval(pomTimer);
        pomRunning = false;
        if (!pomBreak) {
          APP.pomodoroSessions = (APP.pomodoroSessions || 0) + 1;
          APP.totalPoints += 15;
          logPoints(15, "Pomodoro session");
          saveData(APP);
          showToast("Session complete! +15 points! 🍅");
          pomBreak = true;
          pomSeconds = (APP.settings.breakMinutes || 5) * 60;
          document.getElementById("pomodoroLabel").textContent = "Break";
        } else {
          pomBreak = false;
          pomSeconds = (APP.pomodoroMinutes || 25) * 60;
          document.getElementById("pomodoroLabel").textContent = "Focus";
          showToast("Break over! Ready for next session.");
        }
        document.getElementById("pomodoroStartBtn").textContent = "Start";
        document
          .getElementById("pomodoroCircle")
          .classList.remove("running", "break");
        document.getElementById("pomodoroSessions").textContent =
          APP.pomodoroSessions || 0;
        updatePomodoroDisplay();
      }
    }, 1000);
  }
}

function resetPomodoro() {
  clearInterval(pomTimer);
  pomRunning = false;
  pomBreak = false;
  pomSeconds = (APP.pomodoroMinutes || 25) * 60;
  document.getElementById("pomodoroStartBtn").textContent = "Start";
  document.getElementById("pomodoroLabel").textContent = "Focus";
  document
    .getElementById("pomodoroCircle")
    .classList.remove("running", "break");
  updatePomodoroDisplay();
}

function skipPomodoro() {
  clearInterval(pomTimer);
  pomRunning = false;
  if (!pomBreak) {
    pomBreak = true;
    pomSeconds = (APP.settings.breakMinutes || 5) * 60;
    document.getElementById("pomodoroLabel").textContent = "Break";
  } else {
    pomBreak = false;
    pomSeconds = (APP.pomodoroMinutes || 25) * 60;
    document.getElementById("pomodoroLabel").textContent = "Focus";
  }
  document.getElementById("pomodoroStartBtn").textContent = "Start";
  document
    .getElementById("pomodoroCircle")
    .classList.remove("running", "break");
  updatePomodoroDisplay();
}

function updatePomodoroSetting(val) {
  APP.pomodoroMinutes = parseInt(val) || 25;
  saveData(APP);
  if (!pomRunning) {
    pomSeconds = APP.pomodoroMinutes * 60;
    updatePomodoroDisplay();
  }
}

document
  .getElementById("pomodoroMinInput")
  .addEventListener("change", function () {
    updatePomodoroSetting(this.value);
  });

// ===== SETTINGS =====
function renderSettings() {
  const isLocked = getAppLock();

  document.getElementById("settingsAppLock").textContent = isLocked
    ? "On"
    : "Off";
  document.getElementById("settingsSecretMethod").value =
    APP.settings.secretMethod || "dot";
  document.getElementById("settingsDefaultPoints").value =
    APP.settings.defaultHabitPoints || 5;
  document.getElementById("settingsBreakMin").value =
    APP.settings.breakMinutes || 5;

  const settingsEl = document.getElementById("settingsPomMinutes");
  if (settingsEl) settingsEl.value = APP.pomodoroMinutes || 25;
}

function toggleAppLock() {
  const current = getAppLock();
  const newValue = !current;

  // encrypt before saving
  APP.settings.appLock = encryptValue(newValue);
  saveData(APP);

  // update UI using decrypted value
  const isLocked = getAppLock();

  document.getElementById("settingsAppLock").textContent = isLocked
    ? "On"
    : "Off";
  showToast(isLocked ? "App lock enabled" : "App lock disabled");
}

function updateSecretMethod(val) {
  // ✅ Save as default method
  APP.settings.secretMethod = val;

  // ✅ Clear temporary tab override (important)
  APP.tempSecretMethod = null;

  // ✅ Save to localStorage
  saveData(APP);

  // ✅ Re-render UI immediately
  renderSecretAuth();
}

function openChangePassword() {
  openModal(`
    <h3>Change Password</h3>
    <div class="form-group"><label>New Password</label><input type="password" id="newPassInput" placeholder="Enter new password"></div>
    <div class="form-group"><label>Confirm</label><input type="password" id="confirmPassInput" placeholder="Confirm password"></div>
    <div class="form-actions">
      <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="changePassword()">Update</button>
    </div>
  `);
}

function changePassword() {
  const p1 = document.getElementById("newPassInput").value;
  const p2 = document.getElementById("confirmPassInput").value;
  if (p1.length < 4) return showToast("Min 4 characters", "error");
  if (p1 !== p2) return showToast("Passwords don't match", "error");
  APP.auth.passwordHash = simpleHash(p1);
  saveData(APP);
  closeModal();
  showToast("Password updated! 🔑");
}

function openSetPattern(type) {
  let inner = "";
  if (type === "dot") {
    inner = `<h3>Set Dot Pattern</h3><p class="crazy-hint">Click dots in your desired secret pattern (min 3)</p><div class="dot-grid" id="setDotGrid"></div>`;
    inner += `<div class="form-actions"><button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveDotPattern()">Save</button></div>`;
  } else if (type === "emoji") {
    inner = `<h3>Set Emoji Sequence</h3><p class="crazy-hint">Tap emojis in your desired secret order (min 3)</p><div class="emoji-grid" id="setEmojiGrid"></div><div class="crazy-sequence" id="setEmojiSeq"></div>`;
    inner += `<div class="form-actions"><button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveEmojiPattern()">Save</button></div>`;
  } else if (type === "color") {
    inner = `<h3>Set Color Pattern</h3><p class="crazy-hint">Click colors in your desired secret order (min 3)</p><div class="color-grid" id="setColorGrid"></div><div class="crazy-sequence" id="setColorSeq"></div>`;
    inner += `<div class="form-actions"><button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveColorPattern()">Save</button></div>`;
  }
  openModal(inner);

  // Initialize grids after DOM update
  setTimeout(() => {
    if (type === "dot") {
      settingDotPat = [];
      initDotGrid("setDotGrid", (i, cell) => {
        settingDotPat.push(i);
        cell.classList.add("selected");
        cell.textContent = settingDotPat.length;
      });
    } else if (type === "emoji") {
      settingEmojiPat = [];
      initEmojiGrid("setEmojiGrid", (i, em, cell) => {
        settingEmojiPat.push(i);
        cell.classList.add("selected");
        document.getElementById("setEmojiSeq").innerHTML +=
          `<span style="font-size:1.2rem">${em}</span>`;
      });
    } else if (type === "color") {
      settingColorPat = [];
      initColorGrid("setColorGrid", (i, c, cell) => {
        settingColorPat.push(i);
        cell.classList.add("selected");
        document.getElementById("setColorSeq").innerHTML +=
          `<span style="display:inline-block;width:20px;height:20px;border-radius:4px;background:${c}"></span>`;
      });
    }
  }, 50);
}

let settingDotPat = [],
  settingEmojiPat = [],
  settingColorPat = [];

function saveDotPattern() {
  if (settingDotPat.length < 3)
    return showToast("Min 3 dots required", "error");
  APP.auth.dotPattern = [...settingDotPat];
  if (!APP.auth.secretKey) APP.auth.secretKey = uid() + uid();
  saveData(APP);
  closeModal();
  showToast("Dot pattern saved! 🔵");
}

function saveEmojiPattern() {
  if (settingEmojiPat.length < 3)
    return showToast("Min 3 emojis required", "error");
  APP.auth.emojiPattern = [...settingEmojiPat];
  if (!APP.auth.secretKey) APP.auth.secretKey = uid() + uid();
  saveData(APP);
  closeModal();
  showToast("Emoji sequence saved! 😎");
}

function saveColorPattern() {
  if (settingColorPat.length < 3)
    return showToast("Min 3 colors required", "error");
  APP.auth.colorPattern = [...settingColorPat];
  if (!APP.auth.secretKey) APP.auth.secretKey = uid() + uid();
  saveData(APP);
  closeModal();
  showToast("Color pattern saved! 🎨");
}

function openSetDynamicBase() {
  openModal(`
    <h3>Set Dynamic Base Password</h3>
    <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:16px">Your login password will be: <strong>HHMM + base</strong><br>e.g. at 14:30 with base "secret" → "1430secret"</p>
    <div class="form-group"><label>Base Password</label><input type="text" id="dynBaseInput" value="${esc(APP.auth.dynamicBase)}" placeholder="Enter your base secret word"></div>
    <div class="form-actions">
      <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveDynamicBase()">Save</button>
    </div>
  `);
}

function saveDynamicBase() {
  const base = document.getElementById("dynBaseInput").value.trim();
  if (!base) return showToast("Base password required", "error");
  APP.auth.dynamicBase = base;
  if (!APP.auth.secretKey) APP.auth.secretKey = uid() + uid();
  saveData(APP);
  closeModal();
  showToast("Dynamic base saved! ⏰");
}

// ===== DATA MANAGEMENT =====
function exportData() {
  const blob = new Blob([JSON.stringify(APP, null, 2)], {
    type: "application/json",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "productiv_backup_" + today() + ".json";
  a.click();
  URL.revokeObjectURL(a.href);
  showToast("Data exported! 📁");
}

function importData(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (ev) {
    try {
      const data = JSON.parse(ev.target.result);
      APP = { ...defaultData, ...data };
      APP.settings = { ...defaultData.settings, ...(data.settings || {}) };
      APP.auth = { ...defaultData.auth, ...(data.auth || {}) };
      saveData(APP);
      renderDashboard();
      showToast("Data imported! 🎉");
    } catch {
      showToast("Invalid JSON file", "error");
    }
  };
  reader.readAsText(file);
  e.target.value = "";
}

function confirmReset() {
  const modal = document.getElementById("modalOverlay");
  const content = document.getElementById("modalContent");

  content.innerHTML = `
    <div style="text-align:center">
      <h3>⚠️ Reset Data</h3>
      <p style="margin:15px 0">
        This will delete all your data permanently.<br><br>
        Are you sure?
      </p>
      <div style="display:flex; gap:10px; justify-content:center">
        <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button class="btn btn-danger" onclick="proceedReset()">Yes, Reset</button>
      </div>
    </div>
  `;

  modal.classList.remove("hidden");
}

function proceedReset() {
  console.log("Clicked Yes Reset"); // DEBUG
  closeModal();
  resetData(); // your original function
}

function resetData() {
  APP = JSON.parse(JSON.stringify(defaultData));
  saveData(APP);
  renderDashboard();
  showToast("All data has been reset");
}

// ===== SEARCH =====
document.getElementById("globalSearch").addEventListener("input", function () {
  const q = this.value.toLowerCase().trim();
  if (!q) return renderDashboard();

  const taskResults = APP.tasks.filter((t) =>
    t.title.toLowerCase().includes(q),
  );
  const noteResults = APP.generalNotes.filter(
    (n) =>
      n.title.toLowerCase().includes(q) ||
      (n.content || "").toLowerCase().includes(q),
  );

  const dashTasks = document.getElementById("dashTasks");
  let html = "";
  if (taskResults.length) {
    html +=
      '<h4 style="font-size:0.8rem;color:var(--text-muted);margin-bottom:8px">TASKS</h4>';
    html += taskResults
      .map(
        (t) => `
      <div class="task-item">
        <button class="task-check ${t.completed ? "checked" : ""}" onclick="toggleTask('${t.id}')">${t.completed ? "✓" : ""}</button>
        <div class="task-info"><div class="task-title">${esc(t.title)}</div></div>
      </div>
    `,
      )
      .join("");
  }
  if (noteResults.length) {
    html +=
      '<h4 style="font-size:0.8rem;color:var(--text-muted);margin:12px 0 8px">NOTES</h4>';
    html += noteResults
      .map(
        (n) => `
      <div class="task-item" onclick="document.querySelector('[data-page=notes]').click();setTimeout(()=>selectNote('${n.id}'),300)" style="cursor:pointer">
        <div class="task-info"><div class="task-title">${esc(n.title)}</div></div>
      </div>
    `,
      )
      .join("");
  }
  if (!html) html = '<div class="empty-state"><p>No results found</p></div>';
  dashTasks.innerHTML = html;
});

// ===== QUICK ADD =====
function quickAdd() {
  openModal(`
    <h3>Quick Add</h3>
    <div style="display:flex;flex-direction:column;gap:10px">
      <button class="btn btn-secondary" onclick="closeModal();openTaskModal()" style="justify-content:center">📋 New Task</button>
      <button class="btn btn-secondary" onclick="closeModal();openHabitModal()" style="justify-content:center">💪 New Habit</button>
      <button class="btn btn-secondary" onclick="closeModal();createNewNote()" style="justify-content:center">📝 New Note</button>
      <button class="btn btn-secondary" onclick="closeModal();openGoalModal()" style="justify-content:center">🎯 New Goal</button>
    </div>
  `);
}

// ===== UTILS =====
function esc(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ===== RECURRING TASKS =====
function processRecurringTasks() {
  const todayStr = today();
  APP.tasks.forEach((t) => {
    if (t.recurring && t.completed && t.completedAt) {
      const completedDate = t.completedAt.slice(0, 10);
      if (t.recurring === "daily" && completedDate !== todayStr) {
        t.completed = false;
        t.completedAt = undefined;
      }
      if (t.recurring === "weekly") {
        const daysDiff =
          (new Date(todayStr) - new Date(completedDate)) / 86400000;
        if (daysDiff >= 7) {
          t.completed = false;
          t.completedAt = undefined;
        }
      }
    }
  });
  saveData(APP);
}

function encryptValue(value) {
  return btoa(JSON.stringify(value));
}

function decryptValue(value) {
  try {
    return JSON.parse(atob(value));
  } catch (e) {
    return value; // fallback if already boolean
  }
}

function getAppLock() {
  return typeof APP.settings.appLock === "string"
    ? decryptValue(APP.settings.appLock)
    : APP.settings.appLock;
}

// ===== INIT =====
function initApp() {
  // ✅ LOAD CORRECT STORAGE KEY
  APP = loadData(); // 🔥 USE THIS (already correct logic)

  // ✅ Safety fallback
  if (!APP.settings) APP.settings = {};
  if (!APP.settings.secretMethod) APP.settings.secretMethod = "dot";

  applyTheme();
  applyAccentColor();
  processRecurringTasks();
  renderDashboard();

  // ✅ Correct method UI
  renderSecretAuth();
}

// Boot
(function boot() {
  initLoginGrids();
  applyTheme();
  applyAccentColor();
  // Check if app lock is off, skip login
  if (!getAppLock()) {
    skipLogin();
  }
})();
