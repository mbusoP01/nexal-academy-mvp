const SUPABASE_URL = 'https://szqpkxlatzvwcxpwmewt.supabase.co/rest/v1/';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6cXBreGxhdHp2d2N4cHdtZXd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4Njg4MjYsImV4cCI6MjA5NTQ0NDgyNn0.OFvGOyU0bZrDX-48PlXGGZeO7hhWJoXhb37JtTQ9pzY';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const viewIds = ['home-view', 'about-view', 'contact-view', 'login-view', 'dashboard-view', 'arena-view'];
const defaultRoute = '/';
let currentQuestion = null;
let currentSession = null;

const pageSections = viewIds.reduce((map, id) => {
  map[id] = document.getElementById(id);
  return map;
}, {});

function MapsTo(viewId) {
  viewIds.forEach(id => {
    if (pageSections[id]) {
      pageSections[id].classList.add('hidden');
    }
  });
  if (pageSections[viewId]) {
    pageSections[viewId].classList.remove('hidden');
  }
}

const googleBtn = document.getElementById('google-signin-btn');
const consentCheckbox = document.getElementById('popia-consent');
const loginFeedback = document.getElementById('login-feedback');
const logoutBtn = document.getElementById('logout-btn');
const topNav = document.getElementById('top-nav');
const newQuestionBtn = document.getElementById('new-question-btn');
const questionDisplay = document.getElementById('question-display');
const answerButtons = Array.from(document.querySelectorAll('.answer-btn'));
const answerFeedback = document.getElementById('answer-feedback');
const clearCanvasBtn = document.getElementById('clear-canvas-btn');
const canvas = document.getElementById('scratchpad');
const ctx = canvas.getContext('2d');

const routeMap = {
  '/': 'home-view',
  '/home': 'home-view',
  'home': 'home-view',
  'home-view': 'home-view',
  '/about': 'about-view',
  'about': 'about-view',
  'about-view': 'about-view',
  '/contact': 'contact-view',
  'contact': 'contact-view',
  'contact-view': 'contact-view',
  '/login': 'login-view',
  'login': 'login-view',
  'login-view': 'login-view',
  '/dashboard': 'dashboard-view',
  'dashboard': 'dashboard-view',
  'dashboard-view': 'dashboard-view',
  '/arena': 'arena-view',
  'arena': 'arena-view',
  'arena-view': 'arena-view'
};

function resolveRoute(route) {
  const normalized = route.startsWith('#') ? route.slice(1) : route;
  return routeMap[normalized] || 'home-view';
}

function showView(route) {
  const page = resolveRoute(route);
  document.querySelectorAll('a[data-link]').forEach(link => {
    const linkRoute = resolveRoute(link.getAttribute('href'));
    link.classList.toggle('active', linkRoute === page);
  });

  if (page === 'dashboard-view' || page === 'arena-view') {
    if (currentSession && currentSession.user) {
      MapsTo(page);
    } else {
      MapsTo('login-view');
    }
    return;
  }

  if (page === 'login-view') {
    if (currentSession && currentSession.user) {
      MapsTo('dashboard-view');
    } else {
      MapsTo('login-view');
    }
    return;
  }

  MapsTo(page);
}

function navigateTo(viewId) {
  const page = resolveRoute(viewId);
  window.location.hash = page;
}

function routeOnLoad() {
  const hash = window.location.hash || '#home-view';
  showView(hash);
}

function updateLoginButtonState() {
  const enabled = consentCheckbox.checked;
  if (enabled) {
    googleBtn.disabled = false;
    googleBtn.classList.remove('opacity-50', 'cursor-not-allowed', 'pointer-events-none');
    googleBtn.classList.add('hover:bg-gray-50', 'cursor-pointer');
    googleBtn.setAttribute('aria-disabled', 'false');
    loginFeedback.classList.add('hidden');
  } else {
    googleBtn.disabled = true;
    googleBtn.classList.add('opacity-50', 'cursor-not-allowed', 'pointer-events-none');
    googleBtn.classList.remove('hover:bg-gray-50', 'cursor-pointer');
    googleBtn.setAttribute('aria-disabled', 'true');
  }
}

async function signInWithGoogle() {
  if (!consentCheckbox.checked) {
    loginFeedback.textContent = 'Parental / Guardian consent is required before continuing.';
    loginFeedback.classList.remove('hidden');
    return;
  }
  loginFeedback.classList.add('hidden');

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      queryParams: { prompt: 'select_account' }
    }
  });

  if (error) {
    loginFeedback.textContent = error.message;
    loginFeedback.classList.remove('hidden');
  }
}

async function handleLogout() {
  await supabase.auth.signOut();
  loginFeedback.classList.add('hidden');
  consentCheckbox.checked = false;
  navigateTo('home-view');
}

function pluralize(value, label) {
  return `${value} ${label}${value === 1 ? '' : 's'}`;
}

function generateMathQuestion() {
  const rootA = Math.floor(Math.random() * 5) + 1;
  const rootB = Math.floor(Math.random() * 9) - 4;
  const signA = Math.random() > 0.5 ? 1 : -1;
  const signB = Math.random() > 0.5 ? 1 : -1;
  const x1 = rootA * signA;
  const x2 = rootB * signB;
  const a = 1;
  const b = -(x1 + x2);
  const c = x1 * x2;

  function formatTerm(coef, variable = 'x') {
    if (coef === 0) return '';
    const abs = Math.abs(coef);
    const sign = coef > 0 ? '+' : '-';
    const body = abs === 1 ? variable : `${abs}${variable}`;
    return `${sign}${body}`;
  }

  const equation = `x^{2}${formatTerm(b)}${formatTerm(c, '')}=0`;
  const correct = `x=${x1},\ x=${x2}`;

  const options = new Set([correct]);
  while (options.size < 4) {
    const delta1 = Math.floor(Math.random() * 4) - 1;
    const delta2 = Math.floor(Math.random() * 4) - 1;
    const wrongA = x1 + delta1;
    const wrongB = x2 + delta2;
    if (wrongA === x1 && wrongB === x2) continue;
    options.add(`x=${wrongA},\ x=${wrongB}`);
  }

  const shuffled = Array.from(options).sort(() => Math.random() - 0.5);
  const correctIndex = shuffled.indexOf(correct);

  return {
    equation,
    choices: shuffled,
    correctIndex
  };
}

function renderMath(text, element) {
  katex.render(text, element, {
    throwOnError: false,
    displayMode: true
  });
}

function updateArena() {
  currentQuestion = generateMathQuestion();
  questionDisplay.innerHTML = '';
  renderMath(currentQuestion.equation, questionDisplay);
  answerButtons.forEach((button, index) => {
    button.textContent = `(${String.fromCharCode(65 + index)}) ${currentQuestion.choices[index].replace(/\\/g, '\\')}`;
    button.dataset.index = index;
    button.classList.remove('border-emerald-400', 'border-rose-400', 'bg-emerald-50', 'bg-rose-50');
  });
  answerFeedback.textContent = '';
}

function handleAnswerClick(event) {
  const button = event.target.closest('.answer-btn');
  if (!button || !currentQuestion) return;
  const selected = Number(button.dataset.index);
  const correct = selected === currentQuestion.correctIndex;
  answerFeedback.textContent = correct ? 'Correct! Well done — your quadratic instincts are strong.' : 'Not quite — revisit the roots and try factoring again.';
  answerFeedback.className = correct ? 'mt-5 text-base font-semibold text-emerald-700' : 'mt-5 text-base font-semibold text-rose-700';
  button.classList.toggle('border-emerald-400', correct);
  button.classList.toggle('bg-emerald-50', correct);
  if (!correct) {
    button.classList.add('border-rose-400', 'bg-rose-50');
  }
}

function bindNavigation() {
  document.querySelectorAll('a[data-link]').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      const href = link.getAttribute('href');
      navigateTo(href);
    });
  });

  const ctaStart = document.getElementById('cta-start-learning');
  if (ctaStart) {
    ctaStart.addEventListener('click', event => {
      event.preventDefault();
      navigateTo('login-view');
    });
  }

  window.addEventListener('hashchange', () => {
    routeOnLoad();
  });
}

function setupCanvas() {
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * window.devicePixelRatio;
  canvas.height = rect.height * window.devicePixelRatio;
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#0f172a';

  let drawing = false;

  const pointerDown = event => {
    drawing = true;
    ctx.beginPath();
    const x = event.offsetX;
    const y = event.offsetY;
    ctx.moveTo(x, y);
  };
  const pointerMove = event => {
    if (!drawing) return;
    ctx.lineTo(event.offsetX, event.offsetY);
    ctx.stroke();
  };
  const pointerUp = () => {
    drawing = false;
  };

  canvas.addEventListener('pointerdown', pointerDown);
  canvas.addEventListener('pointermove', pointerMove);
  canvas.addEventListener('pointerup', pointerUp);
  canvas.addEventListener('pointerleave', pointerUp);

  clearCanvasBtn.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  });
}

async function restoreSession() {
  const { data } = await supabase.auth.getSession();
  currentSession = data.session;
  routeOnLoad();
}

function bindButtons() {
  googleBtn.addEventListener('click', signInWithGoogle);
  consentCheckbox.addEventListener('change', updateLoginButtonState);
  logoutBtn.addEventListener('click', handleLogout);
  newQuestionBtn.addEventListener('click', updateArena);
  answerButtons.forEach(button => button.addEventListener('click', handleAnswerClick));
}

async function init() {
  bindNavigation();
  bindButtons();
  setupCanvas();
  googleBtn.disabled = true;
  googleBtn.classList.add('opacity-50', 'cursor-not-allowed', 'pointer-events-none');
  updateLoginButtonState();
  await restoreSession();
  updateArena();
}

init();
