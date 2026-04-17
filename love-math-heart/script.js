const canvas = document.getElementById("heartCanvas");
const ctx = canvas.getContext("2d");

const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const statusEl = document.getElementById("status");

// Sem vloz svoj endpoint (napr. Formspree, Make.com webhook, Apps Script)
const WEBHOOK_URL = "";

const GRAPH = {
  xMin: -1.6,
  xMax: 1.6,
  yMin: -1.6,
  yMax: 1.6,
};

let noClickCount = 0;
const noMessages = [
  "Prepáč, ale nie neberiem ako odpoveď",
  "Naozaj?",
  "Si si istá?",
  "Myslíš to vážne?",
  "Dobre premysli si to ešte raz.",
  "Ja by som dal ešte jednu šancu.",
  "Srdiečko hovorí, že má byť Áno.",
  "No tak, prosím pekne.",
  "Stále verím, že povieš Áno.",
  "Posledná šanca... určite Nie?",
];
const finalNoMessage = "smola aj tak ano";

const heartPoints = [];
const pointStep = 0.01;
for (let t = 0; t <= Math.PI * 2 + pointStep; t += pointStep) {
  const x = 1.03 * Math.sin(t) ** 3;
  const y =
    0.9 *
    ((13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 16);
  heartPoints.push({ x, y });
}

function getCanvasSize() {
  const size = Math.floor(canvas.clientWidth);
  canvas.width = size;
  canvas.height = size;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  return size;
}

function toPixelX(x, w) {
  return ((x - GRAPH.xMin) / (GRAPH.xMax - GRAPH.xMin)) * w;
}

function toPixelY(y, h) {
  return h - ((y - GRAPH.yMin) / (GRAPH.yMax - GRAPH.yMin)) * h;
}

function drawGrid(w, h) {
  ctx.clearRect(0, 0, w, h);

  ctx.strokeStyle = "rgba(255,255,255,0.05)";
  ctx.lineWidth = 1;
  for (let gx = -1.6; gx <= 1.6; gx += 0.1) {
    const x = toPixelX(gx, w);
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let gy = -1.6; gy <= 1.6; gy += 0.1) {
    const y = toPixelY(gy, h);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(255,255,255,0.17)";
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(toPixelX(0, w), 0);
  ctx.lineTo(toPixelX(0, w), h);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, toPixelY(0, h));
  ctx.lineTo(w, toPixelY(0, h));
  ctx.stroke();
}

function drawHeartOutline(w, h, progress) {
  const maxPoints = Math.max(2, Math.floor(heartPoints.length * progress));
  ctx.strokeStyle = "#ff5959";
  ctx.lineWidth = 3;
  ctx.beginPath();

  for (let i = 0; i < maxPoints; i++) {
    const p = heartPoints[i];
    const px = toPixelX(p.x, w);
    const py = toPixelY(p.y, h);
    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }

  if (progress >= 1) {
    ctx.closePath();
  }
  ctx.stroke();
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function startSlowAnimation() {
  const size = getCanvasSize();
  const duration = 8000;
  let start = null;

  function frame(timestamp) {
    if (!start) {
      start = timestamp;
    }

    const elapsed = timestamp - start;
    const t = Math.min(elapsed / duration, 1);
    const eased = easeInOutCubic(t);

    drawGrid(size, size);
    drawHeartOutline(size, size, eased);

    if (t < 1) {
      requestAnimationFrame(frame);
    }
  }

  requestAnimationFrame(frame);
}

async function sendDecision(answer) {
  const payload = {
    answer,
    page: window.location.href,
    at: new Date().toISOString(),
    userAgent: navigator.userAgent,
  };

  if (!WEBHOOK_URL) {
    return false;
  }

  const res = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return res.ok;
}

async function handleAnswer(answer) {
  statusEl.textContent = "Odosielam odpoveď...";

  try {
    const ok = await sendDecision(answer);

    if (answer === "ano") {
      yesBtn.disabled = true;
      noBtn.disabled = true;
      statusEl.textContent = "Ha, ja to vidím už to nezmeníš";
      return;
    }

    if (noClickCount >= noMessages.length) {
      statusEl.textContent = finalNoMessage;
    } else {
      const msgIndex = noClickCount;
      statusEl.textContent = noMessages[msgIndex];
      noClickCount += 1;
    }

    if (!ok && WEBHOOK_URL) {
      statusEl.textContent = `${statusEl.textContent} (odoslanie zlyhalo)`;
    }
  } catch (error) {
    if (answer === "ano") {
      yesBtn.disabled = true;
      noBtn.disabled = true;
      statusEl.textContent = "Ha, ja to vidím už to nezmeníš";
      return;
    }

    if (noClickCount >= noMessages.length) {
      statusEl.textContent = finalNoMessage;
    } else {
      const msgIndex = noClickCount;
      statusEl.textContent = noMessages[msgIndex];
      noClickCount += 1;
    }
  }
}

yesBtn.addEventListener("click", () => handleAnswer("ano"));
noBtn.addEventListener("click", () => handleAnswer("nie"));

let resizeTimeout;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(startSlowAnimation, 140);
});

startSlowAnimation();
