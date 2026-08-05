(function () {
  'use strict';

  const STORAGE_KEY = 'todoApp_tasks';
  const CATEGORIES = ['Personal', 'Work', 'Shopping', 'Health'];

  const DOM = {
    taskForm: document.getElementById('taskForm'),
    taskInput: document.getElementById('taskInput'),
    categorySelect: document.getElementById('categorySelect'),
    dueDateInput: document.getElementById('dueDateInput'),
    taskList: document.getElementById('taskList'),
    taskCounter: document.getElementById('taskCounter'),
    progressFill: document.getElementById('progressFill'),
    progressPercent: document.getElementById('progressPercent'),
    emptyState: document.getElementById('emptyState'),
    searchInput: document.getElementById('searchInput'),
    filterBtns: document.querySelectorAll('.filter-btn'),
    clearCompletedBtn: document.getElementById('clearCompletedBtn'),
  };

  let tasks = [];
  let currentFilter = 'all';
  let searchQuery = '';
  let dragSrcIndex = null;

  /* ─── Utils ─── */
  function formatDate(dateStr) {
    if (!dateStr) return null;
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function isOverdue(dateStr) {
    if (!dateStr) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dateStr + 'T00:00:00');
    return due < today;
  }

  function getCategoryClass(cat) {
    return 'cat-' + cat;
  }

  /* ─── Storage ─── */
  function loadTasks() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) tasks = JSON.parse(data);
      else tasks = [];
    } catch {
      tasks = [];
    }
  }

  function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }

  /* ─── Render ─── */
  function getFilteredTasks() {
    let filtered = [...tasks];

    if (currentFilter === 'active') {
      filtered = filtered.filter((t) => !t.completed);
    } else if (currentFilter === 'completed') {
      filtered = filtered.filter((t) => t.completed);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      filtered = filtered.filter((t) => t.text.toLowerCase().includes(q));
    }

    return filtered;
  }

  function render() {
    const filtered = getFilteredTasks();
    const total = tasks.length;
    const completedCount = tasks.filter((t) => t.completed).length;
    const percent = total === 0 ? 0 : Math.round((completedCount / total) * 100);

    DOM.taskCounter.textContent = total;
    DOM.progressFill.style.width = percent + '%';
    DOM.progressPercent.textContent = percent + '%';

    if (filtered.length === 0) {
      DOM.taskList.innerHTML = '';
      DOM.emptyState.classList.add('visible');
      return;
    }

    DOM.emptyState.classList.remove('visible');

    let html = '';
    filtered.forEach((task, index) => {
      const realIndex = tasks.indexOf(task);
      const completedClass = task.completed ? 'completed' : '';
      const overdueClass = !task.completed && isOverdue(task.dueDate) ? 'overdue' : '';
      const dueDisplay = task.dueDate ? formatDate(task.dueDate) : null;

      html += `
        <li class="task-item ${completedClass}" draggable="true" data-index="${realIndex}">
          <span class="drag-handle" draggable="false"><i class="fas fa-grip-vertical"></i></span>
          <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
          <div class="task-content">
            <div class="task-text">${escapeHtml(task.text)}</div>
            <div class="task-meta">
              <span class="category-badge ${getCategoryClass(task.category)}">${task.category}</span>
              ${dueDisplay ? `<span class="due-date ${overdueClass}"><i class="far fa-calendar-alt"></i> ${dueDisplay}</span>` : ''}
            </div>
          </div>
          <button class="task-delete-btn" title="Delete task"><i class="fas fa-times"></i></button>
        </li>
      `;
    });

    DOM.taskList.innerHTML = html;
    attachTaskEvents();
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /* ─── Event Attachment ─── */
  function attachTaskEvents() {
    const items = DOM.taskList.querySelectorAll('.task-item');

    items.forEach((item) => {
      const index = parseInt(item.dataset.index, 10);

      const checkbox = item.querySelector('.task-checkbox');
      const deleteBtn = item.querySelector('.task-delete-btn');

      checkbox.addEventListener('change', () => toggleComplete(index));
      deleteBtn.addEventListener('click', () => deleteTask(index));

      /* Drag events */
      item.addEventListener('dragstart', onDragStart);
      item.addEventListener('dragend', onDragEnd);
      item.addEventListener('dragover', onDragOver);
      item.addEventListener('dragenter', onDragEnter);
      item.addEventListener('dragleave', onDragLeave);
      item.addEventListener('drop', onDrop);
    });
  }

  /* ─── CRUD ─── */
  function addTask(text, category, dueDate) {
    const task = {
      id: Date.now() + Math.random(),
      text: text.trim(),
      category: category || 'Personal',
      dueDate: dueDate || '',
      completed: false,
      createdAt: Date.now(),
    };
    tasks.unshift(task);
    saveTasks();
    render();
  }

  function toggleComplete(index) {
    if (index < 0 || index >= tasks.length) return;
    tasks[index].completed = !tasks[index].completed;
    saveTasks();
    render();
  }

  function deleteTask(index) {
    if (index < 0 || index >= tasks.length) return;
    tasks.splice(index, 1);
    saveTasks();
    render();
  }

  function clearCompleted() {
    tasks = tasks.filter((t) => !t.completed);
    saveTasks();
    render();
  }

  /* ─── Drag & Drop ─── */
  function onDragStart(e) {
    const item = e.target.closest('.task-item');
    if (!item) return;
    dragSrcIndex = parseInt(item.dataset.index, 10);
    item.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', dragSrcIndex);
  }

  function onDragEnd(e) {
    const item = e.target.closest('.task-item');
    if (item) item.classList.remove('dragging');
    DOM.taskList.querySelectorAll('.task-item').forEach((el) => el.classList.remove('drag-over'));
    dragSrcIndex = null;
  }

  function onDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  function onDragEnter(e) {
    const item = e.target.closest('.task-item');
    if (item) item.classList.add('drag-over');
  }

  function onDragLeave(e) {
    const item = e.target.closest('.task-item');
    if (item) item.classList.remove('drag-over');
  }

  function onDrop(e) {
    e.preventDefault();
    const targetItem = e.target.closest('.task-item');
    if (!targetItem) return;

    const targetIndex = parseInt(targetItem.dataset.index, 10);
    if (dragSrcIndex === null || dragSrcIndex === targetIndex) {
      targetItem.classList.remove('drag-over');
      return;
    }

    const [movedTask] = tasks.splice(dragSrcIndex, 1);
    tasks.splice(targetIndex, 0, movedTask);
    saveTasks();
    render();
  }

  /* ─── Handlers ─── */
  function handleFormSubmit(e) {
    e.preventDefault();
    const text = DOM.taskInput.value.trim();
    if (!text) {
      DOM.taskInput.focus();
      return;
    }

    const category = DOM.categorySelect.value;
    const dueDate = DOM.dueDateInput.value;
    addTask(text, category, dueDate);
    DOM.taskInput.value = '';
    DOM.dueDateInput.value = '';
    DOM.taskInput.focus();
  }

  function handleFilterClick(e) {
    const btn = e.currentTarget;
    DOM.filterBtns.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    render();
  }

  function handleSearchInput() {
    searchQuery = DOM.searchInput.value;
    render();
  }

  /* ─── Init ─── */
  function init() {
    loadTasks();
    render();

    DOM.taskForm.addEventListener('submit', handleFormSubmit);
    DOM.searchInput.addEventListener('input', handleSearchInput);
    DOM.clearCompletedBtn.addEventListener('click', clearCompleted);

    DOM.filterBtns.forEach((btn) => {
      btn.addEventListener('click', handleFilterClick);
    });

    /* Set min date for due date picker */
    const today = new Date().toISOString().split('T')[0];
    DOM.dueDateInput.setAttribute('min', today);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
