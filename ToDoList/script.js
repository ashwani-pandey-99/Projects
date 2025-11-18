// Select elements
const input = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const listEl = document.getElementById('list');
const stats = document.getElementById('stats');
const clearAllBtn = document.getElementById('clearAll');
const clearCompletedBtn = document.getElementById('clearCompleted');

// Key for saving data in localStorage
const STORAGE_KEY = 'todo.tasks.v1';

// Load saved tasks
let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

// ---------- Render Tasks ----------
function render() {
  listEl.innerHTML = '';

  if (tasks.length === 0) {
    listEl.innerHTML = `
      <li style="text-align:center;color:#777;padding:20px;border-radius:10px;">
        No tasks yet — add one above ✨
      </li>`;
  } else {
    tasks.forEach(task => {
      const li = document.createElement('li');
      li.className = 'task';
      li.dataset.id = task.id;

      li.innerHTML = `
        <div class="left">
          <div class="checkbox ${task.done ? 'checked' : ''}">
            ${task.done ? '✓' : ''}
          </div>
          <div class="text ${task.done ? 'done' : ''}">
            ${escapeHtml(task.text)}
          </div>
        </div>

        <div class="actions">
          <button class="icon-btn edit">✎</button>
          <button class="icon-btn delete">🗑</button>
        </div>
      `;

      // Mark Done / Not Done
      li.querySelector('.checkbox').addEventListener('click', () => {
        toggleDone(task.id);
      });

      // Delete Task
      li.querySelector('.delete').addEventListener('click', () => {
        removeTask(task.id);
      });

      // Edit Task
      li.querySelector('.edit').addEventListener('click', () => {
        startEdit(task.id);
      });

      listEl.appendChild(li);
    });
  }

  updateStats();
  save();
}

// ---------- Add Task ----------
function addTask(text) {
  const trimmed = text.trim();
  if (!trimmed) return;

  const newTask = {
    id: Date.now().toString(),
    text: trimmed,
    done: false
  };

  tasks.unshift(newTask);
  input.value = '';
  render();
}

// ---------- Remove Task ----------
function removeTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  render();
}

// ---------- Toggle Complete ----------
function toggleDone(id) {
  tasks = tasks.map(t =>
    t.id === id ? { ...t, done: !t.done } : t
  );
  render();
}

// ---------- Edit Task ----------
function startEdit(id) {
  const li = listEl.querySelector(`li[data-id="${id}"]`);
  const textEl = li.querySelector('.text');
  const oldText = textEl.textContent;

  // Replace with input field
  const editInput = document.createElement('input');
  editInput.type = 'text';
  editInput.value = oldText;
  editInput.style.padding = "6px 8px";
  editInput.style.fontSize = "15px";
  editInput.style.border = "1px solid #ddd";
  editInput.style.borderRadius = "6px";

  textEl.replaceWith(editInput);
  editInput.focus();

  function finishEdit(saveChanges) {
    if (saveChanges) {
      const newText = editInput.value.trim();
      if (newText) {
        tasks = tasks.map(t =>
          t.id === id ? { ...t, text: newText } : t
        );
      }
    }
    render();
  }

  // Save on blur or Enter
  editInput.addEventListener('blur', () => finishEdit(true));
  editInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') finishEdit(true);
    if (e.key === 'Escape') finishEdit(false);
  });
}

// ---------- Clear Completed ----------
function clearCompleted() {
  tasks = tasks.filter(t => !t.done);
  render();
}

// ---------- Clear All ----------
function clearAll() {
  if (confirm('Clear ALL tasks?')) {
    tasks = [];
    render();
  }
}

// ---------- Update Stats ----------
function updateStats() {
  stats.textContent = `${tasks.length} tasks`;
}

// ---------- Save to Local Storage ----------
function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// ---------- Escape HTML Helper ----------
function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ---------- Event Listeners ----------
addBtn.addEventListener('click', () => addTask(input.value));
input.addEventListener('keydown', e => {
  if (e.key === 'Enter') addTask(input.value);
});

clearCompletedBtn.addEventListener('click', clearCompleted);
clearAllBtn.addEventListener('click', clearAll);

// Initial Render
render();
