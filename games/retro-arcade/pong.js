class PongGame {
  constructor(canvas, onScore) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.onScore = onScore;
    this.name = 'pong';
    this.running = false;
    this.frameId = null;

    canvas.width = 600;
    canvas.height = 400;

    this.paddleW = 10;
    this.paddleH = 80;
    this.ballSize = 8;

    this.player = { x: 20, y: 160, score: 0 };
    this.ai = { x: canvas.width - 30, y: 160, score: 0 };
    this.ball = { x: 300, y: 200, vx: 4, vy: 2 };

    this.keys = {};
    this._onKey = (e) => { this.keys[e.key] = e.type === 'keydown'; };
  }

  start() {
    this.player.y = this.canvas.height / 2 - this.paddleH / 2;
    this.ai.y = this.canvas.height / 2 - this.paddleH / 2;
    this.ball = { x: this.canvas.width / 2, y: this.canvas.height / 2, vx: (Math.random() > 0.5 ? 4 : -4), vy: (Math.random() - 0.5) * 4 };
    this.player.score = 0;
    this.onScore(0);
    this.running = true;
    document.addEventListener('keydown', this._onKey);
    document.addEventListener('keyup', this._onKey);
    this._loop();
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.frameId);
    document.removeEventListener('keydown', this._onKey);
    document.removeEventListener('keyup', this._onKey);
  }

  _loop() {
    if (!this.running) return;
    this._update();
    this._draw();
    this.frameId = requestAnimationFrame(() => this._loop());
  }

  _update() {
    const h = this.canvas.height;
    const w = this.canvas.width;

    // Player movement
    if (this.keys['ArrowUp'] || this.keys['w']) this.player.y -= 6;
    if (this.keys['ArrowDown'] || this.keys['s']) this.player.y += 6;
    this.player.y = Math.max(0, Math.min(h - this.paddleH, this.player.y));

    // AI movement
    const aiCenter = this.ai.y + this.paddleH / 2;
    if (this.ball.y < aiCenter - 10) this.ai.y -= 4;
    if (this.ball.y > aiCenter + 10) this.ai.y += 4;
    this.ai.y = Math.max(0, Math.min(h - this.paddleH, this.ai.y));

    // Ball movement
    this.ball.x += this.ball.vx;
    this.ball.y += this.ball.vy;

    // Top/bottom bounce
    if (this.ball.y <= 0 || this.ball.y >= h - this.ballSize) this.ball.vy *= -1;

    // Paddle collision
    if (this.ball.x <= this.player.x + this.paddleW &&
        this.ball.y >= this.player.y && this.ball.y <= this.player.y + this.paddleH &&
        this.ball.vx < 0) {
      this.ball.vx = Math.abs(this.ball.vx) * 1.05;
      this.ball.vy += (this.ball.y - (this.player.y + this.paddleH / 2)) * 0.1;
    }

    if (this.ball.x >= this.ai.x - this.ballSize &&
        this.ball.y >= this.ai.y && this.ball.y <= this.ai.y + this.paddleH &&
        this.ball.vx > 0) {
      this.ball.vx = -Math.abs(this.ball.vx) * 1.05;
    }

    // Scoring
    if (this.ball.x < 0) {
      this.player.score += 1;
      this.onScore(this.player.score);
      this._resetBall(1);
    }
    if (this.ball.x > w) {
      this._resetBall(-1);
    }
  }

  _resetBall(dir) {
    this.ball = {
      x: this.canvas.width / 2,
      y: this.canvas.height / 2,
      vx: dir * 4,
      vy: (Math.random() - 0.5) * 4
    };
  }

  _draw() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, w, h);

    // Center line
    ctx.setLineDash([10, 10]);
    ctx.strokeStyle = '#333';
    ctx.beginPath();
    ctx.moveTo(w / 2, 0);
    ctx.lineTo(w / 2, h);
    ctx.stroke();
    ctx.setLineDash([]);

    // Paddles
    ctx.fillStyle = '#00ffff';
    ctx.fillRect(this.player.x, this.player.y, this.paddleW, this.paddleH);
    ctx.fillRect(this.ai.x, this.ai.y, this.paddleW, this.paddleH);

    // Ball
    ctx.fillStyle = '#fff';
    ctx.fillRect(this.ball.x, this.ball.y, this.ballSize, this.ballSize);

    // Scores
    ctx.font = '32px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#333';
    ctx.fillText(this.player.score, w / 4, 50);
    ctx.fillText(this.ai.score, (3 * w) / 4, 50);
  }
}
