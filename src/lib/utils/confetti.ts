/**
 * Taskify Celebratory Confetti Engine
 * Zero-dependency, lightweight, high-performance HTML5 Canvas confetti.
 * Can emit outward from an exact click location or burst across the screen.
 */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  shape: "rect" | "circle" | "strip";
  rotation: number;
  rotationSpeed: number;
  wobble: number;
  wobbleSpeed: number;
  alpha: number;
  decay: number;
}

const BRAND_CONFETTI_COLORS = [
  "#10b981", // Emerald
  "#34d399", // Mint
  "#14b8a6", // Teal
  "#06b6d4", // Cyan
  "#3b82f6", // Electric Blue
  "#8b5cf6", // Violet
  "#ec4899", // Pink / Rose
  "#f59e0b", // Amber
  "#eab308", // Sun Gold
];

class ConfettiEngine {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private particles: Particle[] = [];
  private animationFrameId: number | null = null;

  private initCanvas(): boolean {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return false;
    }

    if (!this.canvas) {
      let existing = document.getElementById("taskify-confetti-canvas") as HTMLCanvasElement | null;
      if (!existing) {
        existing = document.createElement("canvas");
        existing.id = "taskify-confetti-canvas";
        existing.style.position = "fixed";
        existing.style.inset = "0";
        existing.style.width = "100vw";
        existing.style.height = "100vh";
        existing.style.pointerEvents = "none";
        existing.style.zIndex = "999999";
        document.body.appendChild(existing);
      }
      this.canvas = existing;
      this.ctx = existing.getContext("2d");
      this.resize();
      window.addEventListener("resize", this.handleResize);
    }
    return Boolean(this.ctx);
  }

  private handleResize = () => {
    this.resize();
  };

  private resize() {
    if (!this.canvas) return;
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    if (this.ctx) {
      this.ctx.resetTransform?.();
      this.ctx.scale(dpr, dpr);
    }
  }

  public burst(
    clientX?: number,
    clientY?: number,
    options?: {
      particleCount?: number;
      spread?: number;
      colors?: string[];
    }
  ) {
    if (!this.initCanvas() || !this.ctx) return;

    const count = options?.particleCount || 48;
    const colors = options?.colors || BRAND_CONFETTI_COLORS;

    // Origin: client click or center-bottom
    const originX = clientX !== undefined ? clientX : window.innerWidth / 2;
    const originY = clientY !== undefined ? clientY : window.innerHeight * 0.65;

    const shapes: ("rect" | "circle" | "strip")[] = ["rect", "circle", "strip"];

    for (let i = 0; i < count; i++) {
      // Angle: either radial burst or upward fountain if near bottom
      const angle = clientY !== undefined
        ? Math.random() * Math.PI * 2
        : -Math.PI / 2 + (Math.random() - 0.5) * 1.5;

      const speed = 4 + Math.random() * 8;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const shape = shapes[Math.floor(Math.random() * shapes.length)];

      this.particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 2,
        vy: Math.sin(angle) * speed - (clientY !== undefined ? 1.5 : 4),
        size: shape === "strip" ? 8 + Math.random() * 6 : 5 + Math.random() * 5,
        color,
        shape,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        wobble: Math.random() * 10,
        wobbleSpeed: 0.08 + Math.random() * 0.1,
        alpha: 1,
        decay: 0.012 + Math.random() * 0.014,
      });
    }

    if (!this.animationFrameId) {
      this.render();
    }
  }

  private render = () => {
    if (!this.ctx || !this.canvas) return;

    this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      // Physics
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.28; // Gravity
      p.vx *= 0.98; // Air drag
      p.vy *= 0.98;
      p.rotation += p.rotationSpeed;
      p.wobble += p.wobbleSpeed;
      p.alpha -= p.decay;

      if (p.alpha <= 0 || p.y > window.innerHeight + 50) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, p.alpha);
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);

      // 3D rotation wobble along Y-axis
      const scaleX = Math.cos(p.wobble);
      this.ctx.scale(scaleX, 1);

      this.ctx.fillStyle = p.color;

      if (p.shape === "circle") {
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        this.ctx.fill();
      } else if (p.shape === "strip") {
        this.ctx.fillRect(-p.size / 4, -p.size, p.size / 2, p.size * 1.8);
      } else {
        this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      }

      this.ctx.restore();
    }

    if (this.particles.length > 0) {
      this.animationFrameId = requestAnimationFrame(this.render);
    } else {
      this.animationFrameId = null;
      this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
  };
}

export const confetti = new ConfettiEngine();

/**
 * Global helper to trigger celebratory confetti on task completion.
 */
export function triggerConfetti(clientX?: number, clientY?: number, particleCount?: number) {
  confetti.burst(clientX, clientY, { particleCount });
}
