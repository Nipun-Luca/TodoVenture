const input = document.getElementById('new-task');
const addBtn = document.getElementById('add-btn');
const taskList = document.getElementById('task-list');
const toggleThemeBtn = document.getElementById('toggle-theme');

// Modal elements
const editModal = document.getElementById('editModal');
const editInput = document.getElementById('edit-input');
const saveEditBtn = document.getElementById('save-edit');
const cancelEditBtn = document.getElementById('cancel-edit');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentEditIndex = null;

// --- Task Functions ---
function renderTasks() {
  taskList.innerHTML = '';
  tasks.forEach((task, index) => {
    const li = document.createElement('li');
    if (task.completed) li.classList.add('completed');

    // Task text
    const span = document.createElement('span');
    span.textContent = task.text;
    span.addEventListener('click', () => toggleTask(index));

    // Buttons container
    const btnContainer = document.createElement('div');
    btnContainer.className = 'btn-container'; // for CSS styling

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

    // Append buttons to container
    btnContainer.appendChild(editBtn);
    btnContainer.appendChild(deleteBtn);

    // Append text and button container to li
    li.appendChild(span);
    li.appendChild(btnContainer);

    taskList.appendChild(li);
  });
}


function addTask() {
  const taskText = input.value.trim();
  if (!taskText) return;

  tasks.push({ text: taskText, completed: false });
  saveTasks();
  renderTasks();

  input.value = '';
}

function toggleTask(index) {
  tasks[index].completed = !tasks[index].completed;
  saveTasks();
  renderTasks();
}

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

  // Remove existing stars
  document.querySelectorAll('.star').forEach(star => star.remove());

  // Only create stars if night theme is active
  if (!document.body.classList.contains('night-theme')) return;

  for (let i = 0; i < count; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    star.style.top = `${Math.random() * 50}%`;  // upper half
    star.style.left = `${Math.random() * 100}%`;
    star.style.animationDuration = `${Math.random() * 2 + 1}s`;
    star.style.width = star.style.height = `${Math.random() * 2 + 1}px`;
    sky.appendChild(star);
  }
}

// Initial render of stars only if night mode
createStars();

// Theme toggle
toggleThemeBtn.addEventListener('click', () => {
  document.body.classList.toggle('day-theme');
  document.body.classList.toggle('night-theme');

  // Update toggle button icon
  if (document.body.classList.contains('night-theme')) {
    toggleThemeBtn.textContent = '☀️';
  } else {
    toggleThemeBtn.textContent = '🌙';
  }

  // Update stars
  createStars();
});

// --- Local Storage ---
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

addBtn.addEventListener('click', addTask);
input.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addTask();
});

// Initial render
renderTasks();