const input = document.getElementById('new-task');
const taskList = document.getElementById('task-list');
const toggleThemeBtn = document.getElementById('toggle-theme');

// --- Add Modal Elements ---
const addModal = document.getElementById('addModal');
const openAddModalBtn = document.getElementById('openAddModal');
const cancelAddBtn = document.getElementById('cancel-add');
const addBtn = document.getElementById('add-btn');
const dateInput = document.getElementById('task-date');
const priorityInput = document.getElementById('task-priority');

// --- Edit Modal Elements ---
const editModal = document.getElementById('editModal');
const editInput = document.getElementById('edit-input');
const saveEditBtn = document.getElementById('save-edit');
const cancelEditBtn = document.getElementById('cancel-edit');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentEditIndex = null;

// --- Render Tasks ---
function renderTasks() {
  taskList.innerHTML = '';
  tasks.forEach((task, index) => {
    const li = document.createElement('li');
    if (task.completed) li.classList.add('completed');

    // Task text
    const span = document.createElement('span');
    span.textContent = task.text;
    span.addEventListener('click', () => toggleTask(index));

    // Add extra info (due date + priority)
    if (task.dueDate || task.priority) {
      const info = document.createElement('small');
      info.textContent = `${task.dueDate ? "📅 " + task.dueDate : ""} ${task.priority ? "⚡ " + task.priority : ""}`;
      info.style.marginLeft = "10px";
      span.appendChild(info);
    }

    // Buttons container
    const btnContainer = document.createElement('div');
    btnContainer.className = 'btn-container';

    // Edit button
    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.className = 'edit-btn';
    editBtn.addEventListener('click', () => openEditModal(index));

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.className = 'delete-btn';
    deleteBtn.addEventListener('click', () => deleteTask(index));

    btnContainer.appendChild(editBtn);
    btnContainer.appendChild(deleteBtn);

    li.appendChild(span);
    li.appendChild(btnContainer);

    taskList.appendChild(li);
  });
}

// --- Add Task Modal ---
openAddModalBtn.addEventListener('click', () => {
  addModal.style.display = 'block';
  input.focus();
});

cancelAddBtn.addEventListener('click', () => {
  addModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
  if (e.target === addModal) addModal.style.display = 'none';
});

function addTask() {
  const taskText = input.value.trim();
  const dueDate = dateInput.value;
  const priority = priorityInput.value;

  if (!taskText) return;

  tasks.push({ 
    text: taskText, 
    completed: false, 
    dueDate: dueDate || null, 
    priority 
  });

  saveTasks();
  renderTasks();

  // Reset fields
  input.value = '';
  dateInput.value = '';
  priorityInput.value = 'medium';

  // Close modal
  addModal.style.display = 'none';
}

addBtn.addEventListener('click', addTask);
input.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addTask();
});

// --- Toggle Complete ---
function toggleTask(index) {
  tasks[index].completed = !tasks[index].completed;
  saveTasks();
  renderTasks();
}

// --- Delete Task ---
function deleteTask(index) {
  tasks.splice(index, 1);
  saveTasks();
  renderTasks();
}

// --- Edit Modal ---
function openEditModal(index) {
  currentEditIndex = index;
  editInput.value = tasks[index].text;
  editModal.style.display = 'block';
  editInput.focus();
}

function saveEdit() {
  if (currentEditIndex !== null) {
    const newText = editInput.value.trim();
    if (newText !== '') {
      tasks[currentEditIndex].text = newText;
      saveTasks();
      renderTasks();
    }
    closeEditModal();
  }
}

saveEditBtn.addEventListener('click', saveEdit);
editInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') saveEdit();
});
cancelEditBtn.addEventListener('click', closeEditModal);

function closeEditModal() {
  editModal.style.display = 'none';
  currentEditIndex = null;
}
window.addEventListener('click', (e) => {
  if (e.target === editModal) closeEditModal();
});

// --- Theme Toggle ---
function createStars(count = 50) {
  const sky = document.querySelector('.sky');

  document.querySelectorAll('.star').forEach(star => star.remove());

  if (!document.body.classList.contains('night-theme')) return;

  for (let i = 0; i < count; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    star.style.top = `${Math.random() * 50}%`;
    star.style.left = `${Math.random() * 100}%`;
    star.style.animationDuration = `${Math.random() * 2 + 1}s`;
    star.style.width = star.style.height = `${Math.random() * 2 + 1}px`;
    sky.appendChild(star);
  }
}

createStars();

toggleThemeBtn.addEventListener('click', () => {
  document.body.classList.toggle('day-theme');
  document.body.classList.toggle('night-theme');

  if (document.body.classList.contains('night-theme')) {
    toggleThemeBtn.textContent = '☀️';
  } else {
    toggleThemeBtn.textContent = '🌙';
  }

  createStars();
});

// --- Local Storage ---
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Initial render
renderTasks();