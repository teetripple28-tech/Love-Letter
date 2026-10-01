// Small interactions that make the story feel personal without needing a framework.
const progressFill = document.querySelector(".progress-fill");
const revealItems = document.querySelectorAll(".reveal");
const heartField = document.querySelector(".heart-field");
const celebrationField = document.querySelector(".celebration-field");
const music = document.querySelector(".background-music");
const musicButton = document.querySelector(".music-button");
const envelopeButton = document.querySelector(".envelope-button");
const envelopeHint = document.querySelector(".envelope-hint");
const dialogs = [...document.querySelectorAll(".dialog-backdrop")];
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let lastFocusedElement = null;
let celebrationTimers = [];

// Reveal each story beat as it enters the viewport.
if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14, rootMargin: "0px 0px -35px 0px" });
  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

// Keep the slim story indicator in sync with the page position.
let scrollQueued = false;
function updateProgress() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const amount = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  progressFill.style.width = `${Math.min(100, Math.max(0, amount))}%`;
  scrollQueued = false;
}
window.addEventListener("scroll", () => {
  if (!scrollQueued) {
    window.requestAnimationFrame(updateProgress);
    scrollQueued = true;
  }
}, { passive: true });
updateProgress();

// Keep ambient hearts sparse, and skip them for visitors who prefer less motion.
function addAmbientHeart() {
  if (prefersReducedMotion.matches || document.hidden) return;
  const heart = document.createElement("span");
  heart.className = "ambient-heart";
  heart.textContent = Math.random() > 0.5 ? "♥" : "♡";
  heart.style.left = `${Math.random() * 100}%`;
  heart.style.fontSize = `${10 + Math.random() * 13}px`;
  heart.style.animationDuration = `${12 + Math.random() * 9}s`;
  heartField.append(heart);
  window.setTimeout(() => heart.remove(), 22000);
}
if (!prefersReducedMotion.matches) window.setInterval(addAmbientHeart, 2600);

// The envelope is a real button so it works equally well on touch and keyboard.
envelopeButton.addEventListener("click", () => {
  const opening = envelopeButton.getAttribute("aria-expanded") !== "true";
  envelopeButton.setAttribute("aria-expanded", String(opening));
  envelopeButton.classList.toggle("is-open", opening);
  envelopeHint.textContent = opening ? "A little something, from my heart" : "Tap the letter to open it";
  if (opening) {
    window.setTimeout(() => document.querySelector("#letter").scrollIntoView({ behavior: prefersReducedMotion.matches ? "auto" : "smooth" }), 500);
  }
});

// Desktop-only pointer movement adds a very restrained shift to the opening rings.
if (window.matchMedia("(hover: hover) and (pointer: fine)").matches && !prefersReducedMotion.matches) {
  const hero = document.querySelector(".hero");
  hero.addEventListener("pointermove", (event) => {
    const bounds = hero.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 12;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 12;
    hero.style.setProperty("--parallax-x", `${x}px`);
    hero.style.setProperty("--parallax-y", `${y}px`);
  });
}

// Music never starts until the visitor explicitly presses this control.
musicButton.addEventListener("click", async () => {
  if (music.paused) {
    try {
      await music.play();
      musicButton.querySelector("span").textContent = "🔊";
      musicButton.setAttribute("aria-label", "Pause music");
      musicButton.title = "Pause music";
      musicButton.setAttribute("aria-pressed", "true");
      musicButton.classList.add("is-playing");
    } catch {
      musicButton.setAttribute("aria-label", "Music file unavailable");
      musicButton.title = "Add music.mp3 to the project folder";
    }
  } else {
    music.pause();
    musicButton.querySelector("span").textContent = "🎵";
    musicButton.setAttribute("aria-label", "Play music");
    musicButton.title = "Play music";
    musicButton.setAttribute("aria-pressed", "false");
    musicButton.classList.remove("is-playing");
  }
});
music.addEventListener("ended", () => musicButton.click());

function openDialog(name) {
  const backdrop = document.querySelector(`[data-dialog="${name}"]`);
  if (!backdrop) return;
  lastFocusedElement = document.activeElement;
  backdrop.hidden = false;
  document.body.classList.add("dialog-open");
  backdrop.querySelector(".dialog").focus();
}

function closeDialog(backdrop) {
  backdrop.hidden = true;
  if (dialogs.every((dialog) => dialog.hidden)) document.body.classList.remove("dialog-open");
  if (lastFocusedElement instanceof HTMLElement) lastFocusedElement.focus();
}

function stopCelebration() {
  celebrationTimers.forEach(window.clearTimeout);
  celebrationTimers = [];
  celebrationField.replaceChildren();
}

function celebrate() {
  if (prefersReducedMotion.matches) return;
  const colors = ["#f3ccd1", "#e99aab", "#d78584", "#f0c49c", "#fff0e4"];
  for (let index = 0; index < 90; index += 1) {
    const piece = document.createElement("span");
    piece.className = "celebration-piece";
    piece.textContent = ["✦", "•", "✧"][index % 3];
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.color = colors[index % colors.length];
    piece.style.fontSize = `${8 + Math.random() * 12}px`;
    piece.style.setProperty("--drift", `${Math.random() * 180 - 90}px`);
    piece.style.setProperty("--spin", `${Math.random() * 540 - 270}deg`);
    piece.style.animationDuration = `${3.5 + Math.random() * 3}s`;
    piece.style.animationDelay = `${Math.random() * 1.2}s`;
    celebrationField.append(piece);
  }
  for (let index = 0; index < 24; index += 1) {
    const heart = document.createElement("span");
    heart.className = "celebration-heart";
    heart.textContent = index % 2 ? "♥" : "♡";
    heart.style.left = `${Math.random() * 100}%`;
    heart.style.color = colors[index % colors.length];
    heart.style.fontSize = `${13 + Math.random() * 20}px`;
    heart.style.setProperty("--drift", `${Math.random() * 120 - 60}px`);
    heart.style.setProperty("--spin", `${Math.random() * 80 - 40}deg`);
    heart.style.animationDuration = `${4 + Math.random() * 3}s`;
    heart.style.animationDelay = `${Math.random() * 1.5}s`;
    celebrationField.append(heart);
  }
  celebrationTimers.push(window.setTimeout(stopCelebration, 10000));
}

document.querySelector('[data-action="yes"]').addEventListener("click", () => {
  celebrate();
  openDialog("success");
});
document.querySelector('[data-action="moment"]').addEventListener("click", () => openDialog("moment"));
document.querySelector('[data-action="close-moment"]').addEventListener("click", () => closeDialog(document.querySelector('[data-dialog="moment"]')));

dialogs.forEach((backdrop) => {
  backdrop.addEventListener("click", (event) => {
    if (event.target === backdrop || event.target.closest(".dialog-close")) closeDialog(backdrop);
  });
  backdrop.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeDialog(backdrop);
    if (event.key === "Tab") {
      const focusable = [...backdrop.querySelectorAll("a[href], button:not([disabled])")];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
});

document.querySelector('[data-dialog="success"] .dialog-close').addEventListener("click", stopCelebration);