const STORAGE_KEY = 'todo-list-items';

const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const taskCount = document.getElementById('task-count');
const filterButtons = document.querySelectorAll('.filter-btn');
const clearCompletedBtn = document.getElementById('clear-completed');

let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let currentFilter = 'all';

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function getFilteredTasks() {
  switch (currentFilter) {
    case 'active':
      return tasks.filter((task) => !task.completed);
    case 'completed':
      return tasks.filter((task) => task.completed);
    default:
      return tasks;
  }
}

function updateTaskCount() {
  const remaining = tasks.filter((task) => !task.completed).length;
  const label = remaining === 1 ? 'task left' : 'tasks left';
  taskCount.textContent = `${remaining} ${label}`;
}

function renderTasks() {
  const filteredTasks = getFilteredTasks();

  if (filteredTasks.length === 0) {
    todoList.innerHTML = '<li class="empty-state">No tasks found.</li>';
    updateTaskCount();
    return;
  }

  todoList.innerHTML = filteredTasks
    .map(
      (task) => `
        <li class="todo-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
          <div class="todo-main">
            <input type="checkbox" data-action="toggle" ${task.completed ? 'checked' : ''} />
            <span class="todo-text">${escapeHtml(task.text)}</span>
          </div>
          <button class="delete-btn" data-action="delete" type="button">Delete</button>
        </li>
      `
    )
    .join('');

  updateTaskCount();
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function addTask(text) {
  const trimmed = text.trim();
  if (!trimmed) return;

  tasks.unshift({
    id: Date.now(),
    text: trimmed,
    completed: false,
  });

  saveTasks();
  renderTasks();
}

function toggleTask(taskId) {
  tasks = tasks.map((task) =>
    task.id === taskId ? { ...task, completed: !task.completed } : task
  );

  saveTasks();
  renderTasks();
}

function deleteTask(taskId) {
  tasks = tasks.filter((task) => task.id !== taskId);
  saveTasks();
  renderTasks();
}

function clearCompleted() {
  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  renderTasks();
}

todoForm.addEventListener('submit', (event) => {
  event.preventDefault();
  addTask(todoInput.value);
  todoInput.value = '';
  todoInput.focus();
});

todoList.addEventListener('click', (event) => {
  const action = event.target.dataset.action;
  const item = event.target.closest('.todo-item');

  if (!item) return;

  const taskId = Number(item.dataset.id);

  if (action === 'delete') {
    deleteTask(taskId);
  }
});

todoList.addEventListener('change', (event) => {
  if (event.target.matches('input[type="checkbox"]')) {
    const item = event.target.closest('.todo-item');
    if (!item) return;

    const taskId = Number(item.dataset.id);
    toggleTask(taskId);
  }
});

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    currentFilter = button.dataset.filter;

    filterButtons.forEach((btn) => {
      btn.classList.toggle('active', btn === button);
    });

    renderTasks();
  });
});

clearCompletedBtn.addEventListener('click', () => {
  clearCompleted();
});

renderTasks();
