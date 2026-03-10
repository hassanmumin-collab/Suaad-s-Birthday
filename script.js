/* ============================================================
   Birthday Website — script.js
   ============================================================ */

const PHOTO_KEY = 'suaad_portrait_photo';

/* ----------------------------------------------------------
   handlePhotoUpload(event)
   Reads the chosen image file, injects it into the portrait,
   and saves the data-URL to localStorage so it persists.
   ---------------------------------------------------------- */
function handlePhotoUpload(event) {
  const file = event.target.files[0];
  if (!file || !file.type.startsWith('image/')) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const dataUrl = e.target.result;
    const img = document.getElementById('portrait-img');
    img.src = dataUrl;

    // Save to localStorage so it survives page refreshes
    try {
      localStorage.setItem(PHOTO_KEY, dataUrl);
    } catch (err) {
      // Storage quota exceeded — photo still shows for this session
      console.warn('Could not save photo to localStorage:', err);
    }
  };
  reader.readAsDataURL(file);

  // Reset so the same file can be re-selected if needed
  event.target.value = '';
}

/* ----------------------------------------------------------
   restorePhoto()
   Called on DOMContentLoaded — swaps in the saved portrait
   if one exists in localStorage.
   ---------------------------------------------------------- */
function restorePhoto() {
  const saved = localStorage.getItem(PHOTO_KEY);
  if (saved) {
    const img = document.getElementById('portrait-img');
    if (img) img.src = saved;
  }
}

document.addEventListener('DOMContentLoaded', restorePhoto);

/* ----------------------------------------------------------
   startExperience()
   Hides the intro screen and reveals the main site.
   ---------------------------------------------------------- */
function startExperience() {
  const intro = document.getElementById('intro-screen');
  const main  = document.getElementById('main-site');

  intro.classList.add('fade-out');

  // Wait for the CSS fade transition to finish, then fully hide
  intro.addEventListener('transitionend', () => {
    intro.classList.add('hidden');
  }, { once: true });

  main.classList.remove('hidden');
}

/* ----------------------------------------------------------
   startJourney()
   Scrolls smoothly to the lantern section and creates lanterns.
   ---------------------------------------------------------- */
function startJourney() {
  const lanternSection = document.getElementById('lantern-section');
  lanternSection.scrollIntoView({ behavior: 'smooth' });
  createLanterns();
}

/* ----------------------------------------------------------
   createLanterns()
   Dynamically generates floating lantern elements and injects
   them into #lantern-container.
   ---------------------------------------------------------- */
function createLanterns() {
  const container = document.getElementById('lantern-container');
  container.innerHTML = '';

  const count = 35;

  for (let i = 0; i < count; i++) {
    const lantern = document.createElement('div');
    lantern.classList.add('lantern');

    const body   = document.createElement('div');
    body.classList.add('lantern-body');

    const string = document.createElement('div');
    string.classList.add('lantern-string');

    lantern.appendChild(body);
    lantern.appendChild(string);

    // Random horizontal position
    lantern.style.left = `${Math.random() * 96}%`;

    // Stagger launch times
    const delay    = Math.random() * 6;
    const duration = 4 + Math.random() * 4;

    lantern.style.animation = `floatUp ${duration}s ${delay}s ease-in infinite`;

    // Warm hue variation: orange → gold
    const hue = 28 + Math.random() * 32;
    const sat = 85 + Math.random() * 15;
    const lit = 52 + Math.random() * 22;
    body.style.background =
      `radial-gradient(ellipse at 40% 35%, hsl(${hue+30},100%,82%), hsl(${hue},${sat}%,${lit}%))`;
    body.style.boxShadow =
      `0 0 ${16+Math.random()*12}px ${6+Math.random()*8}px hsla(${hue+10},100%,62%,0.75),` +
      `0 0 ${36+Math.random()*20}px ${10+Math.random()*10}px hsla(${hue},100%,55%,0.3)`;

    container.appendChild(lantern);
  }
}

/* Auto-light lanterns when the section scrolls into view */
(function () {
  let launched = false;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !launched) {
        launched = true;
        createLanterns();
      }
    });
  }, { threshold: 0.15 });

  document.addEventListener('DOMContentLoaded', () => {
    const section = document.getElementById('lantern-section');
    if (section) observer.observe(section);
  });
}());

/* ----------------------------------------------------------
   YouTube IFrame Player API
   Pre-loads the player silently so playVideo() works
   immediately inside the button-click handler.
   ---------------------------------------------------------- */
var ytPlayer;
function onYouTubeIframeAPIReady() {
  ytPlayer = new YT.Player('birthday-song', {
    height: '0',
    width:  '0',
    videoId: 'byxFUKxhT3s',
    playerVars: {
      autoplay: 0,
      controls: 0,
      loop:     1,
      playlist: 'byxFUKxhT3s'
    }
  });
}

/* ----------------------------------------------------------
   blowCandle()
   Hides the flame, reveals the birthday message, and starts
   the confetti animation.
   ---------------------------------------------------------- */
function blowCandle() {
  const flameWrapper = document.getElementById('flame-wrapper');
  const message      = document.getElementById('birthday-message');
  const blowBtn      = document.getElementById('blow-btn');

  // Extinguish all flames
  flameWrapper.style.opacity    = '0';
  flameWrapper.style.transition = 'opacity 0.4s ease';

  // Hide each individual flame element so they don't re-appear
  flameWrapper.querySelectorAll('.flame').forEach(f => {
    setTimeout(() => { f.style.display = 'none'; }, 450);
  });

  // Disable the button so it can't be clicked again
  blowBtn.disabled    = true;
  blowBtn.textContent = '🕯️ Candles blown!';

  // Start music immediately on button press
  if (ytPlayer && typeof ytPlayer.playVideo === 'function') {
    ytPlayer.playVideo();
  }

  // Reveal message and confetti after short delay
  setTimeout(() => {
    message.classList.remove('hidden');
    startConfetti();
  }, 500);
}

/* ----------------------------------------------------------
   startConfetti()
   Runs a particle confetti animation on #confetti-canvas.
   ---------------------------------------------------------- */
function startConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  const ctx    = canvas.getContext('2d');

  // Size the canvas to its parent section
  const section = document.getElementById('cake-section');
  canvas.width  = section.offsetWidth;
  canvas.height = section.offsetHeight;

  const PARTICLE_COUNT = 200;
  const COLORS = [
    '#f9d784', '#e8955e', '#f07090', '#a0d8ef',
    '#b8f5b0', '#ffffff', '#ffc3e0', '#c3b8ff'
  ];

  // Build particle pool
  const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
    x:     Math.random() * canvas.width,
    y:     Math.random() * canvas.height * -1,   // start above visible area
    w:     6 + Math.random() * 8,
    h:     10 + Math.random() * 6,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    speed: 1.5 + Math.random() * 3.5,
    drift: (Math.random() - 0.5) * 1.2,          // horizontal drift
    spin:  (Math.random() - 0.5) * 0.12,          // rotation speed
    angle: Math.random() * Math.PI * 2,
    opacity: 0.8 + Math.random() * 0.2,
  }));

  let animId;
  let elapsed = 0;
  const MAX_MS = 7000; // stop after 7 seconds

  function draw(timestamp) {
    if (!draw.start) draw.start = timestamp;
    elapsed = timestamp - draw.start;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let allGone = true;

    particles.forEach(p => {
      p.y     += p.speed;
      p.x     += p.drift;
      p.angle += p.spin;

      // Wrap horizontally
      if (p.x > canvas.width + p.w)  p.x = -p.w;
      if (p.x < -p.w) p.x = canvas.width + p.w;

      if (p.y < canvas.height + p.h) allGone = false;

      ctx.save();
      ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
      ctx.rotate(p.angle);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle   = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });

    if (!allGone && elapsed < MAX_MS) {
      animId = requestAnimationFrame(draw);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      cancelAnimationFrame(animId);
    }
  }

  animId = requestAnimationFrame(draw);

  // Keep canvas sized if window is resized mid-animation
  window.addEventListener('resize', () => {
    canvas.width  = section.offsetWidth;
    canvas.height = section.offsetHeight;
  }, { once: true });
}
