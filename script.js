const workflows = {
  video: {
    command: 'smoosh launch-campaign --preset web',
    heading: 'Converting to MP4. Keeping the detail.',
    preset: 'Optimized for the web',
    files: [
      { name: 'launch-film', from: 'mov', to: 'mp4', size: '248', output: '18.6' },
      { name: 'behind-the-scenes', from: 'mov', to: 'mp4', size: '186', output: '13.9' },
      { name: 'product-cut', from: 'mov', to: 'mp4', size: '92', output: '6.9' },
    ],
    total: '526 MB', output: '39.4 MB', savings: '92.5% lighter',
  },
  audio: {
    command: 'smoosh podcast-series --preset audio',
    heading: 'Converting to MP3. Every word intact.',
    preset: 'Optimized for listening',
    files: [
      { name: 'episode-01', from: 'wav', to: 'mp3', size: '64', output: '8.0' },
      { name: 'episode-02', from: 'wav', to: 'mp3', size: '72', output: '9.0' },
      { name: 'episode-03', from: 'wav', to: 'mp3', size: '56', output: '7.0' },
    ],
    total: '192 MB', output: '24 MB', savings: '87.5% lighter',
  },
  image: {
    command: 'smoosh brand-assets --preset images',
    heading: 'Converting to WebP. Every pixel counts.',
    preset: 'Optimized for the screen',
    files: [
      { name: 'cover-art', from: 'png', to: 'webp', size: '4.0', output: '0.8' },
      { name: 'campaign-header', from: 'png', to: 'webp', size: '6.0', output: '1.2' },
      { name: 'product-photo', from: 'png', to: 'webp', size: '5.0', output: '1.0' },
    ],
    total: '15 MB', output: '3 MB', savings: '80% lighter',
  },
};

const screen = document.querySelector('.workflow-screen');
const mediaButtons = document.querySelectorAll('[data-media]');
const rows = [...document.querySelectorAll('.queue-row')];
const toggle = document.querySelector('#workflow-toggle');
const film = document.querySelector('#product-film');
const filmToggle = document.querySelector('#film-toggle');
film.controls = false;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const text = id => document.getElementById(id);
let activeMedia = 'video';
let userPaused = false;
let filmPaused = false;
let inView = true;
let elapsed = 0;
let lastTime = performance.now();
let lastRender = -100;
const cycleDuration = 11400;

function setText(id, value) {
  if (text(id).textContent !== value) text(id).textContent = value;
}

function render(time) {
  const workflow = workflows[activeMedia];
  const progress = Math.max(0, Math.min(1, (time - 1400) / 4500));
  const complete = progress === 1;
  screen.dataset.stage = complete ? 'complete' : 'processing';
  setText('typed-command', workflow.command.slice(0, Math.min(workflow.command.length, Math.floor(time / 23))));
  setText('terminal-heading', time < 1000 ? 'Watching /media/inbox…' : complete ? "3 files found. All taken care of." : workflow.heading);
  rows.forEach((row, index) => {
    const file = workflow.files[index];
    const fileProgress = Math.max(0, Math.min(1, progress * 3 - index));
    const state = fileProgress >= 1 ? 'done' : fileProgress > 0 ? 'active' : 'queued';
    row.dataset.state = state;
    row.querySelector('.file-name').textContent = `${file.name}.${state === 'done' ? file.to : file.from}`;
    row.querySelector('.queue-size').textContent = `${state === 'done' ? file.output : file.size} MB`;
    row.querySelector('.row-marker').textContent = state === 'done' ? '✓' : state === 'active' ? '›' : '·';
    row.querySelector('.queue-state').textContent = state === 'done' ? 'Done' : state === 'active' ? `${Math.floor(fileProgress * 100)}%` : 'Queued';
  });
  setText('encoding-status', complete ? workflow.preset : progress > 0 ? 'Converting + compressing' : 'Getting everything ready');
  setText('encoding-percent', `${Math.floor(progress * 100)}%`);
  text('encoding-progress').style.width = `${progress * 100}%`;
  setText('delivery-status', complete ? '3 files delivered to /media/ready' : 'Destination: /media/ready');
  setText('original-total', workflow.total);
  setText('output-total', complete ? workflow.output : '…');
  setText('saved-label', complete ? workflow.savings : 'Working on it');
  setText('terminal-finish', complete ? 'Same content. A lot less file.' : 'You keep creating. We’ll take care of this.');
}

function syncFilm() {
  const shouldPause = filmPaused || userPaused || reducedMotion.matches || document.hidden;
  if (shouldPause) film.pause();
  else film.play().catch(() => {
    // Autoplay can be declined by the browser; the play control stays available.
    filmToggle.setAttribute('aria-label', 'Play video');
    filmToggle.querySelector('span').textContent = '▶';
  });
}

function syncMotion() {
  const paused = userPaused || reducedMotion.matches;
  document.body.classList.toggle('motion-paused', paused);
  toggle.disabled = reducedMotion.matches;
  toggle.setAttribute('aria-label', reducedMotion.matches ? 'Animations paused' : paused ? 'Play animations' : 'Pause animations');
  toggle.querySelector('span').textContent = paused ? '▶' : 'Ⅱ';
  syncFilm();
}

function startWorkflow(media = activeMedia) {
  activeMedia = media;
  mediaButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.media === media)));
  elapsed = userPaused || reducedMotion.matches ? 6800 : 0;
  lastTime = performance.now();
  render(elapsed);
}

function tick(now) {
  const delta = Math.min(now - lastTime, 100);
  lastTime = now;
  if (!userPaused && !reducedMotion.matches && !document.hidden && inView) {
    elapsed = (elapsed + delta) % cycleDuration;
    if (now - lastRender > 70) {
      render(elapsed);
      lastRender = now;
    }
  }
  requestAnimationFrame(tick);
}

mediaButtons.forEach(button => button.addEventListener('click', () => startWorkflow(button.dataset.media)));
text('replay').addEventListener('click', () => startWorkflow());
toggle.addEventListener('click', () => {
  // Reduced motion defaults to a finished, readable workflow.
  if (reducedMotion.matches) {
    render(6800);
    return;
  }
  userPaused = !userPaused;
  syncMotion();
});
document.querySelectorAll('a[href="#workflow"]').forEach(link => link.addEventListener('click', () => startWorkflow()));
filmToggle.addEventListener('click', () => {
  if (film.paused) {
    filmPaused = false;
    film.play().catch(() => {});
  } else {
    filmPaused = true;
    film.pause();
  }
});
film.addEventListener('play', () => {
  filmToggle.setAttribute('aria-label', 'Pause video');
  filmToggle.querySelector('span').textContent = 'Ⅱ';
});
film.addEventListener('pause', () => {
  filmToggle.setAttribute('aria-label', 'Play video');
  filmToggle.querySelector('span').textContent = '▶';
});
new IntersectionObserver(entries => {
  inView = entries[0].isIntersecting;
  lastTime = performance.now();
}, { threshold: 0.05 }).observe(screen);
document.addEventListener('visibilitychange', syncFilm);
reducedMotion.addEventListener('change', () => {
  elapsed = reducedMotion.matches ? 6800 : 0;
  render(elapsed);
  syncMotion();
});
startWorkflow();
syncMotion();
requestAnimationFrame(tick);


const filmScenes = ['01 / AUDITION TAPES', '02 / THE ROUGH CUT', '03 / CLIENT DELIVERY', '04 / CREATOR CONTENT'];
function updateFilmScene() {
  setText('film-scene', filmScenes[Math.min(filmScenes.length - 1, Math.floor(film.currentTime / 3))]);
}
film.addEventListener('timeupdate', updateFilmScene);
film.addEventListener('loadedmetadata', updateFilmScene);
