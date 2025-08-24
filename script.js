// --- DOM Elements ---
const taskList = document.getElementById('task-list');
const toggleThemeBtn = document.getElementById('toggle-theme');

const addModal = document.getElementById('addModal');
const openAddModalBtn = document.getElementById('openAddModal');
const cancelAddBtn = document.getElementById('cancel-add');
const addBtn = document.getElementById('add-btn');
const input = document.getElementById('new-task');
const taskDescription = document.getElementById('task-desc');
const dateInput = document.getElementById('task-date');
const priorityInput = document.getElementById('task-priority');

const editModal = document.getElementById('editModal');
const editInput = document.getElementById('edit-input');
const saveEditBtn = document.getElementById('save-edit');
const cancelEditBtn = document.getElementById('cancel-edit');

const projectList = document.getElementById('project-list');
const addProjectBtn = document.getElementById('add-project-btn');

// --- Data ---
let projects = JSON.parse(localStorage.getItem('projects')) || [{ name: "General", description: "" }];
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentProject = "General";
let currentEditIndex = null;

// --- Render Projects Sidebar ---
function renderProjects() {
  projectList.innerHTML = '';
  projects.forEach((proj) => {
    const li = document.createElement('li');
    li.textContent = proj.name;
    li.className = proj.name === currentProject ? 'active' : '';
    li.addEventListener('click', () => switchProject(proj.name));
    projectList.appendChild(li);
  });
}

function switchProject(projectName) {
  currentProject = projectName;
  renderProjects();
  renderTasks();
}

// --- Add New Project ---
addProjectBtn.addEventListener('click', () => {
  const name = prompt("Enter project name:");
  if (!name) return;
  const description = prompt("Optional description:");
  projects.push({ name, description });
  saveProjects();
  renderProjects();
});

// --- Render Tasks ---
function renderTasks() {
  taskList.innerHTML = '';
  tasks
    .filter(t => t.project === currentProject)
    .forEach((task, index) => {
      const li = document.createElement('li');
      li.className = 'task-item';
      if (task.completed) li.classList.add('completed');

      // Left: checkbox + title
      const leftContainer = document.createElement('div');
      leftContainer.className = 'task-left';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'task-check';
      checkbox.checked = task.completed;
      checkbox.addEventListener('click', (e) => {
        e.stopPropagation(); // don’t trigger modal when clicking checkbox
        toggleTask(index);
      });

      const title = document.createElement('span');
      title.className = 'task-title';
      title.textContent = task.text;

      leftContainer.appendChild(checkbox);
      leftContainer.appendChild(title);

      // Right: date + priority
      const rightContainer = document.createElement('div');
      rightContainer.className = 'task-right';

      const priority = document.createElement('span');
      priority.className = `priority ${task.priority}`;
      priority.textContent =
        task.priority.charAt(0).toUpperCase() + task.priority.slice(1);
      rightContainer.appendChild(priority);

      if (task.dueDate) {
        const dueDate = document.createElement('span');
        dueDate.className = 'due-date';
        dueDate.textContent = task.dueDate;
        rightContainer.appendChild(dueDate);
      }

      // Delete button
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-btn';
      deleteBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M5.5 5.5a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0v-6a.5.5 0 0 1 .5-.5zm3 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0v-6a.5.5 0 0 1 .5-.5z"/>
        <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1 0-2H5h6h1.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118z"/>
      </svg>`;
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // don’t open modal when deleting
        deleteTask(index);
      });
      rightContainer.appendChild(deleteBtn);

      li.appendChild(leftContainer);
      li.appendChild(rightContainer);

      // Clicking anywhere on li (except checkbox/delete) opens modal
      li.addEventListener('click', () => openEditModal(index));

      taskList.appendChild(li);
    });
}

// ==========================
// --- ADD TASK MODAL ---
// ==========================
openAddModalBtn.addEventListener('click', () => openModal('addModal'));
cancelAddBtn.addEventListener('click', () => closeModal('addModal'));
window.addEventListener('click', e => {
  if (e.target === addModal) closeModal('addModal');
});

addBtn.addEventListener('click', addTask);
input.addEventListener('keypress', e => { if (e.key === 'Enter') addTask(); });

function addTask() {
  const taskText = input.value.trim();
  const descText = taskDescription.value.trim();
  if (!taskText) return;

  tasks.push({
    text: taskText,
    description: descText || null,
    completed: false,
    dueDate: dateInput.value || new Date().toISOString().split("T")[0],
    priority: priorityInput.value,
    project: currentProject
  });

  saveTasks();
  renderTasks();

  // reset fields instantly
  input.value = '';
  taskDescription.value = '';
  dateInput.value = '';
  priorityInput.value = 'low';
  addModal.style.display = 'none';
}


// ==========================
// --- EDIT TASK MODAL ---
// ==========================
function openEditModal(index) {
  currentEditIndex = index;
  const task = tasks[index];

  // populate fields
  document.getElementById('edit-input').value = task.text;
  document.getElementById('edit-desc').value = task.description || '';
  document.getElementById('edit-date').value = task.dueDate || '';
  document.getElementById('edit-priority').value = task.priority || 'low';

  // use animation helper
  openModal('editModal');

  // focus on title input
  document.getElementById('edit-input').focus();
}

saveEditBtn.addEventListener('click', saveEdit);
editInput.addEventListener('keypress', e => { if (e.key === 'Enter') saveEdit(); });
cancelEditBtn.addEventListener('click', () => closeModal('editModal'));
window.addEventListener('click', e => {
  if (e.target === editModal) closeModal('editModal');
});

function saveEdit() {
  if (currentEditIndex === null) return;

  const newText = document.getElementById('edit-input').value.trim();
  const newDesc = document.getElementById('edit-desc').value.trim();
  const newDate = document.getElementById('edit-date').value;
  const newPriority = document.getElementById('edit-priority').value;

  if (newText) {
    tasks[currentEditIndex].text = newText;
    tasks[currentEditIndex].description = newDesc || null;
    tasks[currentEditIndex].dueDate = newDate || new Date().toISOString().split("T")[0];
    tasks[currentEditIndex].priority = newPriority;

    saveTasks();
    renderTasks();
  }

  // close instantly (no animation)
  closeEditModal();
}

function closeEditModal() {
  editModal.style.display = 'none';
  currentEditIndex = null;

  // clear fields
  document.getElementById('edit-input').value = '';
  document.getElementById('edit-desc').value = '';
  document.getElementById('edit-date').value = '';
  document.getElementById('edit-priority').value = 'low';
}


// ==========================
// --- TASK ACTIONS ---
// ==========================
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


// ==========================
// --- MODAL ANIMATION HELPERS ---
// ==========================
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.style.display = 'block';
  const content = modal.querySelector('.modal-content');

  modal.style.animation = 'fadeInOverlay 0.5s forwards';
  content.style.animation = 'slideInLeft 0.5s forwards';
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  const content = modal.querySelector('.modal-content');

  modal.style.animation = 'fadeOutOverlay 0.5s forwards';
  content.style.animation = 'slideOutRight 0.5s forwards';

  setTimeout(() => {
    modal.style.display = 'none';

    // reset edit modal fields if needed
    if (modalId === 'editModal') {
      currentEditIndex = null;
      document.getElementById('edit-input').value = '';
      document.getElementById('edit-desc').value = '';
      document.getElementById('edit-date').value = '';
      document.getElementById('edit-priority').value = 'low';
    }

    // reset add modal fields if needed
    if (modalId === 'addModal') {
      document.getElementById('new-task').value = '';
      document.getElementById('task-desc').value = '';
      document.getElementById('task-date').value = '';
      document.getElementById('task-priority').value = 'low';
    }
  }, 500);
}


// ==========================
// --- THEME TOGGLE & STARS ---
// ==========================
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
  toggleThemeBtn.textContent = document.body.classList.contains('night-theme') ? '☀️' : '🌙';
  createStars();
});


// ==========================
// --- LOCAL STORAGE ---
// ==========================
function saveTasks() { localStorage.setItem('tasks', JSON.stringify(tasks)); }
function saveProjects() { localStorage.setItem('projects', JSON.stringify(projects)); }


// ==========================
// --- INITIAL RENDER ---
// ==========================
renderProjects();
renderTasks();