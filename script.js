// --- DOM Elements ---
const taskList = document.getElementById('task-list');

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
let currentEditProjectIndex = null;

// --- Render Projects Sidebar ---
function renderProjects() {
  projectList.innerHTML = '';
  projects.forEach((proj, index) => {
    const li = document.createElement('li');
    
    li.textContent = proj.name;
    
    // Set active based on currentView
    if (currentView.type === 'project' && currentView.value === proj.name) {
      li.className = 'active';
    }

    li.addEventListener('click', () => switchProject(proj.name));

    // Add edit + delete icons if not "General"
    if (proj.name !== "General") {
      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'project-actions';

      // Edit button SVG
      const editBtn = document.createElement('button');
      editBtn.className = 'project-edit';
      editBtn.innerHTML = `
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 20h9"/>
  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
</svg>

      `;
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // prevent switching project
        openEditProjectModal(index);
      });

      // Delete button SVG
      const delBtn = document.createElement('button');
      delBtn.className = 'project-delete';
      delBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 16 16">
  <line x1="3" y1="3" x2="13" y2="13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  <line x1="13" y1="3" x2="3" y2="13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
</svg>`;
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // prevent switching project
        if (confirm(`Delete project "${proj.name}"? All its tasks will also be removed.`)) {
          deleteProject(index);
        }
      });

      // group buttons
      actionsDiv.appendChild(editBtn);
      actionsDiv.appendChild(delBtn);
      li.appendChild(actionsDiv);
    }

    projectList.appendChild(li);
  });
}

// Projects
function openEditProjectModal(index) {
  const proj = projects[index];
  if (proj.name === "General") {
    alert("The 'General' project cannot be renamed.");
    return;
  }

  currentEditProjectIndex = index;

  const input = document.getElementById('edit-project-name');
  const errorEl = document.getElementById('edit-project-error');

  input.value = proj.name;
  errorEl.textContent = '';
  errorEl.style.display = 'none';

  openModal('editProjectModal');

  // focus on input field
  input.focus();

  // Enter key acts like confirm
  input.onkeydown = (e) => {
    if (e.key === 'Enter') {
      document.getElementById('confirm-edit-project').click();
    }
  };
}

// Confirm Edit
document.getElementById('confirm-edit-project').addEventListener('click', () => {
  const nameInput = document.getElementById('edit-project-name');
  const errorEl = document.getElementById('edit-project-error');
  let name = nameInput.value.trim();

  // reset error
  errorEl.style.display = 'none';
  errorEl.textContent = '';

  if (!name) {
    errorEl.textContent = "Project name cannot be empty.";
    errorEl.style.display = 'block';
    return;
  }

  // Check duplicate (ignore same project being edited)
  if (projects.some((p, idx) => p.name.toLowerCase() === name.toLowerCase() && idx !== currentEditProjectIndex)) {
    errorEl.textContent = "A project with this name already exists.";
    errorEl.style.display = 'block';
    return;
  }

  projects[currentEditProjectIndex].name = name;
  saveProjects();
  renderProjects();
  closeModal('editProjectModal');
  nameInput.value = '';
});

// Cancel button listener
document.getElementById('cancel-edit-project').addEventListener('click', () => {
  closeModal('editProjectModal');
});

const editProjectModal = document.getElementById('editProjectModal');

window.addEventListener('click', (e) => {
  if (e.target === editProjectModal) {
    closeModal('editProjectModal');
  }
});

// --- Delete Project ---
function deleteProject(index) {
  const projName = projects[index].name;

  // Remove all tasks in this project
  tasks = tasks.filter(t => t.project !== projName);
  saveTasks();

  // Remove project
  projects.splice(index, 1);
  saveProjects();

  // If deleted project was active, switch view to General
  if (currentView.type === 'project' && currentView.value === projName) {
    switchView('project', 'General');
  } else {
    renderProjects();
    renderTasks();
  }
}

function switchProject(projectName) {
  currentProject = projectName;
  switchView('project', projectName);
}

// --- Add New Project ---
addProjectBtn.addEventListener('click', () => {
  openModal('addProjectModal');
  document.getElementById('new-project-name').focus();
});

// Cancel add button
document.getElementById('cancel-add-project').addEventListener('click', () => closeModal('addProjectModal'));
window.addEventListener('click', e => {
  if (e.target === document.getElementById('addProjectModal')) closeModal('addProjectModal');
});

// Confirm adding a new project
const nameInput = document.getElementById('new-project-name');
const errorEl = document.getElementById('project-error');
const confirmBtn = document.getElementById('confirm-add-project');

function addProjectHandler() {
    let name = nameInput.value.trim();

    // Reset error
    errorEl.style.display = 'none';
    errorEl.textContent = '';

    if (!name) {
        errorEl.textContent = "Project name cannot be empty.";
        errorEl.style.display = 'block';
        return;
    }

    if (projects.some(p => p.name.toLowerCase() === name.toLowerCase())) {
        errorEl.textContent = "A project with this name already exists.";
        errorEl.style.display = 'block';
        return;
    }

    projects.push({ name });
    saveProjects();
    renderProjects();
    closeModal('addProjectModal');

    // Reset input
    nameInput.value = '';
}

// Button click
confirmBtn.addEventListener('click', addProjectHandler);

// Press Enter inside the input
nameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        addProjectHandler();
    }
});


// ---------- New: View state ----------
let currentView = { type: 'project', value: 'General' }; // default view

// ---------- Smart list rendering ----------
const smartListEl = document.getElementById('smart-list');

function renderSmartLists() {
  if (!smartListEl) return;
  const lists = [
    { key: 'all', label: 'All Tasks' },
    { key: 'today', label: 'Today' },
    { key: 'week', label: 'This Week' },
    { key: 'overdue', label: 'Overdue' }
  ];

  smartListEl.innerHTML = '';
  lists.forEach(item => {
    const li = document.createElement('li');
    li.dataset.smart = item.key;
    li.textContent = item.label;

    // optional: count badge (you can omit if not wanted)
    const badge = document.createElement('span');
    badge.className = 'smart-badge';
    badge.textContent = countForSmartList(item.key);
    li.appendChild(badge);

    // active class
    if (currentView.type === 'smart' && currentView.value === item.key) {
      li.classList.add('active');
    }

    li.addEventListener('click', () => switchView('smart', item.key));
    smartListEl.appendChild(li);
  });
}

function updateSmartBadges() {
  document.querySelectorAll('.smart-badge').forEach(badge => {
    const key = badge.parentElement.dataset.smart;
    badge.textContent = countForSmartList(key);
  });
}

// ---------- Helper: counts for smart lists (used for badges) ----------
function countForSmartList(key) {
  const now = new Date();
  return tasks.reduce((acc, t) => {
    const d = t.dueDate;
    if (key === 'all') return acc + 1;
    if (!d) return acc; // tasks without due date don't count for date-based lists
    const date = new Date(d + 'T00:00:00');
    if (key === 'today') {
      return isSameDay(date, now) ? acc + 1 : acc;
    }
    if (key === 'week') {
      return isWithinNextDays(date, 7) ? acc + 1 : acc;
    }
    if (key === 'overdue') {
      return (date < startOfDay(now) && !t.completed) ? acc + 1 : acc;
    }
    return acc;
  }, 0);
}

// ---------- Utilities for date checks ----------
function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth() === b.getMonth() &&
         a.getDate() === b.getDate();
}
function isWithinNextDays(date, days) {
  const today = startOfDay(new Date());
  const end = new Date(today);
  end.setDate(end.getDate() + days);
  return date >= today && date < end;
}

// ---------- switchView: toggles between project/smart ----------
function switchView(type, value) {
  currentView = { type, value };
  renderProjects();    // updates active class
  renderSmartLists();  // updates smart list active class
  renderTasks();
  localStorage.setItem('currentView', JSON.stringify(currentView));
}

// --- Render Tasks ---
function renderTasks() {
  taskList.innerHTML = '';

  // Choose tasks depending on view
  let visibleTasks = tasks.map((t, i) => ({ task: t, index: i }));

  if (currentView.type === 'project') {
    visibleTasks = visibleTasks.filter(item => item.task.project === currentView.value);
  } else if (currentView.type === 'smart') {
    const now = new Date();
    visibleTasks = visibleTasks.filter(({ task }) => {
      const d = task.dueDate;
      if (currentView.value === 'all') return true;
      if (!d) return false;
      const date = new Date(d + 'T00:00:00');
      if (currentView.value === 'today') return isSameDay(date, now);
      if (currentView.value === 'week') return isWithinNextDays(date, 7);
      if (currentView.value === 'overdue') return date < startOfDay(now) && !task.completed;
      return false;
    });
  }

  visibleTasks.forEach(({ task, index }) => {
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

    // Right: priority + date + delete
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

    // Delete button (unchanged SVG)
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

function populateProjectSelect() {
    const addSelect = document.getElementById('add-task-project');
    addSelect.innerHTML = ''; // clear old options
    projects.forEach(p => {
        const option = document.createElement('option');
        option.value = p.name;
        option.textContent = p.name;
        if (p.name === currentProject) option.selected = true; // preselect current project
        addSelect.appendChild(option);
    });
}

// ==========================
// --- ADD TASK MODAL ---
// ==========================
openAddModalBtn.addEventListener('click', () => {
    currentProject = currentView.type === 'project' ? currentView.value : 'General';
    populateProjectSelect();
    openModal('addModal');
    document.getElementById('new-task').focus();
});
cancelAddBtn.addEventListener('click', () => closeModal('addModal'));
window.addEventListener('click', e => {
  if (e.target === addModal) closeModal('addModal');
});

addBtn.addEventListener('click', addTask);
input.addEventListener('keypress', e => { if (e.key === 'Enter') addTask(); });

function addTask() {
    const taskText = input.value.trim();
    const descText = taskDescription.value.trim();
    const selectedProject = document.getElementById('add-task-project').value; // use unique ID

    if (!taskText) return;

    tasks.push({
        text: taskText,
        description: descText || null,
        completed: false,
        dueDate: dateInput.value || new Date().toISOString().split("T")[0],
        priority: priorityInput.value,
        project: selectedProject
    });

    saveTasks();
    renderTasks();
    updateSmartBadges();

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

    const editProjectSelect = document.getElementById('edit-task-project');
    editProjectSelect.innerHTML = ''; // clear old options
    projects.forEach(p => {
        const option = document.createElement('option');
        option.value = p.name;
        option.textContent = p.name;
        if (p.name === task.project) option.selected = true; // preselect current project
        editProjectSelect.appendChild(option);
    });

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
    const newProject = document.getElementById('edit-task-project').value; // <-- NEW

    if (newText) {
        tasks[currentEditIndex].text = newText;
        tasks[currentEditIndex].description = newDesc || null;
        tasks[currentEditIndex].dueDate = newDate || new Date().toISOString().split("T")[0];
        tasks[currentEditIndex].priority = newPriority;
        tasks[currentEditIndex].project = newProject; // <-- NEW

        saveTasks();
        renderTasks();
    }

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
  updateSmartBadges();
  applyTaskFilter();
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

const taskSearchInput = document.getElementById('task-search');
const taskListEl = document.getElementById('task-list');

taskSearchInput.addEventListener('input', () => {
    const filter = taskSearchInput.value.toLowerCase();
    const tasks = taskListEl.querySelectorAll('li');
    
    tasks.forEach(task => {
        const text = task.textContent.toLowerCase();
        task.style.display = text.includes(filter) ? '' : 'none';
    });
});

function applyTaskFilter() {
  const filter = taskSearchInput.value.trim().toLowerCase();
  if (!filter) return; // no filter, show all

  const tasks = taskList.querySelectorAll('li');
  tasks.forEach(task => {
    const text = task.textContent.toLowerCase();
    task.style.display = text.includes(filter) ? '' : 'none';
  });
}

taskSearchInput.addEventListener('input', applyTaskFilter);


// ==========================
// --- THEME TOGGLE & STARS ---
// ==========================
const sunSVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-sun" viewBox="0 0 16 16">
  <path d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6m0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8M8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0m0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13m8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5M3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8m10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0m-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0m9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707M4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708"/>
</svg>
`;

const moonSVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-moon-stars" viewBox="0 0 16 16">
  <path d="M6 .278a.77.77 0 0 1 .08.858 7.2 7.2 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277q.792-.001 1.533-.16a.79.79 0 0 1 .81.316.73.73 0 0 1-.031.893A8.35 8.35 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.75.75 0 0 1 6 .278M4.858 1.311A7.27 7.27 0 0 0 1.025 7.71c0 4.02 3.279 7.276 7.319 7.276a7.32 7.32 0 0 0 5.205-2.162q-.506.063-1.029.063c-4.61 0-8.343-3.714-8.343-8.29 0-1.167.242-2.278.681-3.286"/>
  <path d="M10.794 3.148a.217.217 0 0 1 .412 0l.387 1.162c.173.518.579.924 1.097 1.097l1.162.387a.217.217 0 0 1 0 .412l-1.162.387a1.73 1.73 0 0 0-1.097 1.097l-.387 1.162a.217.217 0 0 1-.412 0l-.387-1.162A1.73 1.73 0 0 0 9.31 6.593l-1.162-.387a.217.217 0 0 1 0-.412l1.162-.387a1.73 1.73 0 0 0 1.097-1.097zM13.863.099a.145.145 0 0 1 .274 0l.258.774c.115.346.386.617.732.732l.774.258a.145.145 0 0 1 0 .274l-.774.258a1.16 1.16 0 0 0-.732.732l-.258.774a.145.145 0 0 1-.274 0l-.258-.774a1.16 1.16 0 0 0-.732-.732l-.774-.258a.145.145 0 0 1 0-.274l.774-.258c.346-.115.617-.386.732-.732z"/>
</svg>
`;

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

function createRaindrops(count = 60) {
  const sky = document.querySelector('.sky');
  document.querySelectorAll('.raindrop').forEach(r => r.remove());
  if (!document.body.classList.contains('rain-theme')) return;

  for (let i = 0; i < count; i++) {
    const drop = document.createElement('div');
    drop.className = 'raindrop';
    drop.style.left = `${Math.random() * 100}%`;
    drop.style.top = `${Math.random() * -100}%`; // start above screen
    drop.style.animationDuration = `${Math.random() * 0.5 + 0.75}s`; // varied speed
    sky.appendChild(drop);
  }
}

function createSnowflakes(count = 50) {
  const sky = document.querySelector('.sky');
  document.querySelectorAll('.snowflake-wrap').forEach(s => s.remove());
  if (!document.body.classList.contains('snow-theme')) return;

  for (let i = 0; i < count; i++) {
    const wrap = document.createElement('div');
    wrap.className = 'snowflake-wrap';

    const flake = document.createElement('div');
    flake.className = 'snowflake';
    flake.textContent = '❄';

    // randomize layout + timing
    const left = Math.random() * 100; // vw
    const size = Math.random() * 10 + 8; // px
    const fallDuration = Math.random() * 6 + 6; // 6 - 12s
    const driftDuration = Math.random() * 4 + 3; // 3 - 7s
    const delay = Math.random() * 5; // stagger only first run

    wrap.style.left = `${left}vw`;
    wrap.style.animationDuration = `${fallDuration}s`;
    wrap.style.animationDelay = `${delay}s`;

    flake.style.fontSize = `${size}px`;
    flake.style.animationDuration = `${driftDuration}s`;
    flake.style.animationDelay = `${delay}s`;

    // After the first loop, remove the delay so it falls continuously
    wrap.addEventListener('animationiteration', () => {
      wrap.style.animationDelay = '0s';
      flake.style.animationDelay = '0s';
    }, { once: true });

    wrap.appendChild(flake);
    sky.appendChild(wrap);
  }
}

function createPetals(count = 15) {
  const sky = document.querySelector('.sky');
  document.querySelectorAll('.petal-wrap').forEach(p => p.remove());
  if (!document.body.classList.contains('sakura-theme')) return;

  for (let i = 0; i < count; i++) {
    const wrap = document.createElement('div');
    wrap.className = 'petal-wrap';

    const petal = document.createElement('div');
    petal.className = 'petal';

    // random style
    const styleIndex = Math.floor(Math.random() * 4) + 1;
    petal.classList.add(`petal-style${styleIndex}`);

    // randomize layout + timing
    const left = Math.random() * 100; // vw
    const fallDuration = Math.random() * 6 + 8; // 8 - 14s
    const driftDuration = Math.random() * 4 + 4; // 4 - 8s

    // negative delays to start petals mid-animation smoothly
    const wrapDelay = -Math.random() * fallDuration;
    const petalDelay = -Math.random() * driftDuration;

    wrap.style.left = `${left}vw`;
    wrap.style.animationDuration = `${fallDuration}s`;
    wrap.style.animationDelay = `${wrapDelay}s`;

    petal.style.animationDuration = `${driftDuration}s`;
    petal.style.animationDelay = `${petalDelay}s`;

    wrap.appendChild(petal);
    sky.appendChild(wrap);
  }
}

// Grimm theme - fiery particles
function createGrimmParticles(count = 50) {
  const sky = document.querySelector('.sky');
  document.querySelectorAll('.grimm-wrap').forEach(n => n.remove());
  if (!document.body.classList.contains('grimm-theme')) return;

  const rand = (min, max) => min + Math.random() * (max - min);

  for (let i = 0; i < count; i++) {
    const wrap = document.createElement('div');
    wrap.className = 'grimm-wrap';

    const particle = document.createElement('div');
    particle.className = 'grimm-particle';

    // mix of dots and streaks
    const isDot = Math.random() < 0.4;
    const size = isDot ? rand(3, 6) : rand(2, 3);     // dot diameter or streak thickness
    const length = isDot ? size : rand(10, 20);       // streak length
    particle.style.width = `${size}px`;
    particle.style.height = `${length}px`;

    // glowing ember style
    const intensity = rand(0.4, 0.9);
    particle.style.background = `radial-gradient(circle, rgba(255,100,60,${intensity}) 0%, rgba(200,30,10,0.3) 70%, transparent 100%)`;
    particle.style.boxShadow = `0 0 ${rand(4, 12)}px rgba(255,80,50,${intensity})`;
    particle.style.borderRadius = isDot ? "50%" : "999px";

    // position along bottom area
    const leftVW = rand(0, 100);
    const topVH  = rand(85, 100); // start near bottom
    wrap.style.left = `${leftVW}vw`;
    wrap.style.top  = `${topVH}vh`;

    // slower rise
    const flowDuration = rand(8, 14);   // slower movement
    const oscDuration  = rand(2, 4);
    const wrapDelay    = -Math.random() * flowDuration;
    const oscDelay     = -Math.random() * oscDuration;

    wrap.style.animationDuration = `${flowDuration}s`;
    wrap.style.animationDelay    = `${wrapDelay}s`;

    particle.style.animationDuration = `${oscDuration}s`;
    particle.style.animationDelay    = `${oscDelay}s`;

    wrap.appendChild(particle);
    sky.appendChild(wrap);
  }
}

function removeGrimmParticles() {
  document.querySelectorAll('.grimm-wrap').forEach(n => n.remove());
}


function applyTheme(theme) {
  document.body.classList.remove('day-theme', 'night-theme', 'rain-theme', 'snow-theme', 'sakura-theme', 'grimm-theme');

  if (theme === 'day') document.body.classList.add('day-theme');
  else if (theme === 'night') document.body.classList.add('night-theme');
  else if (theme === 'rain') document.body.classList.add('rain-theme');
  else if (theme === 'snow') document.body.classList.add('snow-theme');
  else if (theme === 'sakura') document.body.classList.add('sakura-theme');
  else if (theme === 'grimm') document.body.classList.add('grimm-theme');

  localStorage.setItem('theme', theme);

  // refresh visuals
  createStars();
  createRaindrops();
  createSnowflakes();
  createPetals();
  createGrimmParticles();
}


// --- On load ---
const savedTheme = localStorage.getItem('theme') || 'day';
applyTheme(savedTheme);
document.getElementById('themeDropdown').value = savedTheme;

// --- Dropdown listener ---
document.getElementById('themeDropdown').addEventListener('change', e => {
  applyTheme(e.target.value);
});


// ==========================
// --- LOCAL STORAGE ---
// ==========================
function saveTasks() { localStorage.setItem('tasks', JSON.stringify(tasks)); }
function saveProjects() { localStorage.setItem('projects', JSON.stringify(projects)); }


// ==========================
// --- INITIAL RENDER ---
// ==========================
(function initView() {
  // restore view from localStorage if present
  try {
    const saved = JSON.parse(localStorage.getItem('currentView'));
    if (saved && (saved.type === 'project' || saved.type === 'smart')) {
      currentView = saved;
    } else {
      currentView = { type: 'project', value: 'General' };
    }
  } catch (e) {
    currentView = { type: 'project', value: 'General' };
  }

  renderSmartLists();
  renderProjects();
  renderTasks();
})();