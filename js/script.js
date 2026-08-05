const projects = [
  {
    name: 'Calculator',
    description: 'A fully functional calculator with support for basic arithmetic operations, keyboard input, and a clean, responsive interface.',
    techs: ['HTML5', 'CSS3', 'JavaScript'],
    link: 'calculator/',
    icon: 'fa-calculator',
    color: '#6366f1'
  },
  {
    name: 'Weather App',
    description: 'Real-time weather application that displays current conditions, forecasts, and weather data using a public API.',
    techs: ['HTML5', 'CSS3', 'JavaScript', 'API'],
    link: 'weather-app/',
    icon: 'fa-cloud-sun',
    color: '#06b6d4'
  },
  {
    name: 'To-Do List',
    description: 'A task management app with add, edit, delete, and filter functionality. Features local storage persistence and drag-and-drop.',
    techs: ['HTML5', 'CSS3', 'JavaScript', 'LocalStorage'],
    link: 'todo-app/',
    icon: 'fa-list-check',
    color: '#10b981'
  },
  {
    name: 'Password Generator',
    description: 'Generate secure, customizable passwords with options for length, character types, and copy-to-clipboard functionality.',
    techs: ['HTML5', 'CSS3', 'JavaScript'],
    link: 'password-generator/',
    icon: 'fa-lock',
    color: '#f59e0b'
  },
  {
    name: 'Random Quote Generator',
    description: 'Displays inspiring random quotes with the ability to fetch new quotes, tweet them, and filter by categories.',
    techs: ['HTML5', 'CSS3', 'JavaScript', 'API'],
    link: 'quote-generator/',
    icon: 'fa-quote-right',
    color: '#ef4444'
  }
];

const skills = [
  { name: 'HTML5', icon: 'fa-brands fa-html5', level: 95 },
  { name: 'CSS3', icon: 'fa-brands fa-css3-alt', level: 90 },
  { name: 'JavaScript (ES6+)', icon: 'fa-brands fa-js', level: 88 },
  { name: 'React', icon: 'fa-brands fa-react', level: 80 },
  { name: 'Responsive Design', icon: 'fa-solid fa-mobile-screen', level: 92 },
  { name: 'Git/GitHub', icon: 'fa-brands fa-git-alt', level: 85 },
  { name: 'APIs', icon: 'fa-solid fa-plug', level: 82 },
  { name: 'Web Performance', icon: 'fa-solid fa-gauge-high', level: 78 }
];

const header = document.getElementById('header');
const navList = document.getElementById('nav-list');
const hamburger = document.getElementById('nav-hamburger');
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const skillsGrid = document.getElementById('skills-grid');
const projectsGrid = document.getElementById('projects-grid');
const contactForm = document.getElementById('contact-form');
const footerYear = document.getElementById('footer-year');
const animatedStats = document.querySelectorAll('.stat__number');

function getInitialTheme() {
  const stored = localStorage.getItem('theme');
  if (stored) return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function setTheme(theme) {
  const isDark = theme === 'dark';
  document.body.classList.toggle('dark', isDark);
  themeIcon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
  localStorage.setItem('theme', theme);
}

function toggleTheme() {
  const next = document.body.classList.contains('dark') ? 'light' : 'dark';
  setTheme(next);
}

setTheme(getInitialTheme());
themeToggle.addEventListener('click', toggleTheme);

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  navList.classList.toggle('active');
});

document.querySelectorAll('.nav__link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navList.classList.remove('active');
  });
});

function handleNavScroll() {
  header.classList.toggle('scrolled', window.scrollY > 50);
}

window.addEventListener('scroll', handleNavScroll, { passive: true });
handleNavScroll();

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

function renderSkills() {
  skillsGrid.innerHTML = skills.map(skill => {
    const iconHtml = '<span class="skill-card__icon"><i class="' + skill.icon + '"></i></span>';
    const titleHtml = '<h3 class="skill-card__title">' + skill.name + '</h3>';
    const barHtml = '<div class="skill-card__bar"><div class="skill-card__bar-fill" data-level="' + skill.level + '"></div></div>';
    return '<article class="skill-card">' + iconHtml + titleHtml + barHtml + '</article>';
  }).join('');
}

function renderProjects() {
  projectsGrid.innerHTML = projects.map(project => {
    const iconHtml = '<div class="project-card__icon" style="background:linear-gradient(135deg,' + project.color + ',' + project.color + 'dd);"><i class="fas ' + project.icon + '"></i></div>';
    const titleHtml = '<h3 class="project-card__title">' + project.name + '</h3>';
    const descHtml = '<p class="project-card__description">' + project.description + '</p>';
    const headerHtml = '<div class="project-card__header">' + iconHtml + titleHtml + descHtml + '</div>';
    const tagsHtml = '<div class="project-card__tags">' + project.techs.map(t => '<span class="project-card__tag">' + t + '</span>').join('') + '</div>';
    const footerHtml = '<div class="project-card__footer"><a href="' + project.link + '" class="project-card__link">Live Demo <i class="fas fa-arrow-right"></i></a></div>';
    return '<article class="project-card">' + headerHtml + tagsHtml + footerHtml + '</article>';
  }).join('');
}

function animateSkillBars() {
  document.querySelectorAll('.skill-card__bar-fill').forEach(bar => {
    const level = bar.getAttribute('data-level');
    bar.style.width = level + '%';
  });
}

const observerOptions = {
  threshold: 0.15,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');

      if (entry.target.classList.contains('stat__number')) {
        animateCounter(entry.target);
      }

      if (entry.target.closest('.skills')) {
        animateSkillBars();
      }

      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
animatedStats.forEach(el => observer.observe(el));

function animateCounter(el) {
  const target = parseInt(el.getAttribute('data-count'), 10);
  if (isNaN(target)) return;
  let current = 0;
  const increment = Math.ceil(target / 40);
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    el.textContent = current;
  }, 30);
}

footerYear.textContent = new Date().getFullYear();

const formFields = {
  name: document.getElementById('form-name'),
  email: document.getElementById('form-email'),
  message: document.getElementById('form-message')
};

const formErrors = {
  name: document.getElementById('form-name-error'),
  email: document.getElementById('form-email-error'),
  message: document.getElementById('form-message-error')
};

function validateField(field) {
  const value = field.value.trim();
  let error = '';

  if (!value) {
    error = 'This field is required.';
  } else if (field === formFields.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      error = 'Please enter a valid email address.';
    }
  } else if (field === formFields.name && value.length < 2) {
    error = 'Name must be at least 2 characters.';
  } else if (field === formFields.message && value.length < 10) {
    error = 'Message must be at least 10 characters.';
  }

  const key = field === formFields.name ? 'name' : field === formFields.email ? 'email' : 'message';
  const errorEl = formErrors[key];
  field.classList.toggle('error', !!error);
  errorEl.textContent = error;
  return !error;
}

function validateForm() {
  let valid = true;
  Object.values(formFields).forEach(field => {
    if (!validateField(field)) valid = false;
  });
  return valid;
}

Object.values(formFields).forEach(field => {
  field.addEventListener('blur', () => validateField(field));
  field.addEventListener('input', () => {
    if (field.classList.contains('error')) validateField(field);
  });
});

contactForm.addEventListener('submit', e => {
  e.preventDefault();
  if (validateForm()) {
    const btn = contactForm.querySelector('.form__submit');
    const original = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    btn.disabled = true;

    setTimeout(() => {
      btn.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
      Object.values(formFields).forEach(f => f.value = '');
      Object.values(formErrors).forEach(e => e.textContent = '');
      Object.values(formFields).forEach(f => f.classList.remove('error'));

      setTimeout(() => {
        btn.innerHTML = original;
        btn.disabled = false;
      }, 3000);
    }, 1500);
  }
});

renderSkills();
renderProjects();
