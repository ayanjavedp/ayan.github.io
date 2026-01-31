const state = {
  projects: [],
  filtered: [],
  activeCategory: 'All',
  searchTerm: ''
};

const projectGrid = document.getElementById('project-grid');
const featuredContainer = document.getElementById('featured-project');
const searchInput = document.getElementById('project-search');
const modal = document.getElementById('project-modal');
const modalBody = document.getElementById('modal-body');
const yearSpan = document.getElementById('year');
const themeToggle = document.querySelector('.theme-toggle');
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

const formatTags = (tags = []) =>
  tags.map((tag) => `<span class="tag">${tag}</span>`).join('');

const renderFeatured = (project) => {
  if (!project) {
    featuredContainer.innerHTML = '';
    return;
  }

  featuredContainer.innerHTML = `
    <div class="featured-card">
      <img src="${project.image}" alt="${project.title} preview" />
      <div>
        <p class="eyebrow">Featured project</p>
        <h3>${project.title}</h3>
        <p class="muted">${project.description}</p>
        <div class="tag-list">${formatTags(project.tags)}</div>
        <div class="modal-links">
          ${project.links
            .map(
              (link) =>
                `<a class="btn ghost" href="${link.url}" target="_blank" rel="noreferrer">${link.label}</a>`
            )
            .join('')}
          <button class="btn primary" data-open="${project.id}">View details</button>
        </div>
      </div>
    </div>
  `;
};

const renderProjects = () => {
  if (!state.filtered.length) {
    projectGrid.innerHTML = '<p class="muted">No projects match this filter yet.</p>';
    return;
  }

  projectGrid.innerHTML = state.filtered
    .map(
      (project) => `
        <article class="project-card" data-open="${project.id}">
          <p class="eyebrow">${project.category}</p>
          <h3>${project.title}</h3>
          <p class="muted">${project.summary}</p>
          <div class="tag-list">${formatTags(project.tags)}</div>
        </article>
      `
    )
    .join('');
};

const applyFilters = () => {
  const term = state.searchTerm.toLowerCase();
  state.filtered = state.projects.filter((project) => {
    const matchesCategory =
      state.activeCategory === 'All' || project.category === state.activeCategory;
    const matchesSearch =
      !term ||
      [project.title, project.summary, project.description, project.category, ...project.tags]
        .join(' ')
        .toLowerCase()
        .includes(term);
    return matchesCategory && matchesSearch;
  });
  renderProjects();
};

const openModal = (projectId) => {
  const project = state.projects.find((item) => item.id === projectId);
  if (!project) return;

  modalBody.innerHTML = `
    <img src="${project.image}" alt="${project.title} visual" />
    <p class="eyebrow">${project.category}</p>
    <h3>${project.title}</h3>
    <p class="muted">${project.description}</p>
    <div class="tag-list">${formatTags(project.tags)}</div>
    <div class="modal-links">
      ${project.links
        .map(
          (link) =>
            `<a class="btn ghost" href="${link.url}" target="_blank" rel="noreferrer">${link.label}</a>`
        )
        .join('')}
    </div>
  `;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
};

const closeModal = () => {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
};

const setTheme = (mode) => {
  document.body.classList.toggle('theme-light', mode === 'light');
  document.body.classList.toggle('theme-dark', mode === 'dark');
  themeToggle.querySelector('.toggle-icon').textContent = mode === 'light' ? '☀' : '☾';
  localStorage.setItem('theme', mode);
};

const initTheme = () => {
  const saved = localStorage.getItem('theme');
  if (saved) {
    setTheme(saved);
  }
};

const initNavigation = () => {
  navToggle.addEventListener('click', () => {
    const open = navLinks.dataset.open === 'true';
    navLinks.dataset.open = String(!open);
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.dataset.open = 'false';
    });
  });
};

const initReveal = () => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { threshold: 0.2 }
  );

  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
};

fetch('./projects.json')
  .then((response) => response.json())
  .then((projects) => {
    state.projects = projects;
    const featured = projects.find((project) => project.featured);
    renderFeatured(featured);
    applyFilters();
  })
  .catch(() => {
    projectGrid.innerHTML = '<p class="muted">Unable to load projects right now.</p>';
  });

searchInput.addEventListener('input', (event) => {
  state.searchTerm = event.target.value;
  applyFilters();
});

document.querySelectorAll('.filter').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.filter').forEach((btn) => btn.classList.remove('active'));
    button.classList.add('active');
    state.activeCategory = button.dataset.category;
    applyFilters();
  });
});

document.body.addEventListener('click', (event) => {
  const target = event.target.closest('[data-open]');
  if (target) {
    openModal(target.dataset.open);
  }
});

modal.addEventListener('click', (event) => {
  if (event.target.dataset.close) {
    closeModal();
  }
});

themeToggle.addEventListener('click', () => {
  const isLight = document.body.classList.contains('theme-light');
  setTheme(isLight ? 'dark' : 'light');
});

yearSpan.textContent = new Date().getFullYear();
initTheme();
initNavigation();
initReveal();
