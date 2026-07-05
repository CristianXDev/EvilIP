// --- 1. NUEVA ANIMACIÓN: TÚNEL DE DATOS (WARP SPEED - MEJORADA) ---
const canvas = document.getElementById("speedCanvas");
const ctx = canvas.getContext("2d");
let lines = [];
const numLines = 500;

function resizeCanvas() {
  canvas.width = canvas.parentElement.offsetWidth;
  canvas.height = canvas.parentElement.offsetHeight;
}

class SpeedLine {
  constructor() {
    this.reset();
    this.z = Math.random() * canvas.width;
  }

  reset() {
    this.x = (Math.random() - 0.5) * 2000;
    this.y = (Math.random() - 0.5) * 2000;
    this.z = canvas.width;
    this.speed = Math.random() * 20 + 5;
    const colors = ["#1A1A1A", "#FF7B54", "#FFE359", "#A8D672"];
    this.color = colors[Math.floor(Math.random() * colors.length)];
  }

  update() {
    this.z -= this.speed;
    if (this.z < 1) {
      this.reset();
    }
  }

  draw() {
    let cx = canvas.width / 2;
    let cy = canvas.height / 2;
    let fov = canvas.width;

    let px = (this.x / this.z) * fov + cx;
    let py = (this.y / this.z) * fov + cy;

    let pz = this.z + this.speed;
    let ppx = (this.x / pz) * fov + cx;
    let ppy = (this.y / pz) * fov + cy;

    ctx.beginPath();
    ctx.moveTo(ppx, ppy);
    ctx.lineTo(px, py);
    ctx.strokeStyle = this.color;
    // Sin efectos de resplandor/neón, líneas sólidas
    ctx.lineWidth = Math.max(2.5, 500 / this.z);
    ctx.stroke();
  }
}

function initCanvas() {
  resizeCanvas();
  lines = [];
  for (let i = 0; i < numLines; i++) {
    lines.push(new SpeedLine());
  }
}

function animateCanvas() {
  ctx.fillStyle = "rgba(252, 249, 242, 0.05)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  lines.forEach((line) => {
    line.update();
    line.draw();
  });

  requestAnimationFrame(animateCanvas);
}

window.addEventListener("resize", initCanvas);
initCanvas();
animateCanvas();

// --- 2. CONTROL DE SCROLL PARA LA NAVBAR ---
window.addEventListener("scroll", () => {
  const navbar = document.querySelector(".navbar");
  if (window.scrollY > 20) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
});

// --- 3. INICIALIZACIÓN DEL SERVICIO DE IP ---
document.addEventListener("DOMContentLoaded", () => {
  initIPService();
});
