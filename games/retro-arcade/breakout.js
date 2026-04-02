class BreakoutGame {
  constructor(canvas, onScore) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.onScore = onScore;
    this.name = 'breakout';
    this.running = false;
    this.frameId = null;

    canvas.width = 600;
    canvas.height = 400;

    this.paddleW = 80;
    this.paddleH = 10;
    this.ballR = 5;
    this.brickRows = 5;
    this.brickCols = 10;
    this.brickW = 54;
    this.brickH = 16;
    this.brickPad = 4;
    this.brickOffsetTop = 40;
    this.brickOffsetLeft = 10;

    this.paddle = { x: 0, y: 0 };
    this.ball = { x: 0, y: 0, vx: 0, vy: 0 };
    this.bricks = [];
    this.score = 0;

    this.keys = {};
    this._onKey = (e) => { this.keys[e.key] = e.type === 'keydown'; };
  }

  start() {
    this.score = 0;
    this.onScore(0);
    this.paddle = { x: this.canvas.width / 2 - this.paddleW / 2, y: this.canvas.height - 30 };
    this.ball = { x: this.canvas.width / 2, y: this.canvas.height - 50, vx: 3, vy: -3 };

    this.bricks = [];
    const colors = ['#ff3333','#ff8800','#ffff00','#00ff00','#00ffff'];
    for (let r = 0; r < this.brickRows; r++)
      for (let c = 0; c < this.brickCols; c++)
        this.bricks.push({
          x: this.brickOffsetLeft + c * (this.brickW + this.brickPad),
          y: this.brickOffsetTop + r * (this.brickH + this.brickPad),
          color: colors[r],
          alive: true
        });

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
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Paddle
    if (this.keys['ArrowLeft'] || this.keys['a']) this.paddle.x -= 6;
    if (this.keys['ArrowRight'] || this.keys['d']) this.paddle.x += 6;
    this.paddle.x = Math.max(0, Math.min(w - this.paddleW, this.paddle.x));

    // Ball
    this.ball.x += this.ball.vx;
    this.ball.y += this.ball.vy;

    // Wall bounce
    if (this.ball.x <= this.ballR || this.ball.x >= w - this.ballR) this.ball.vx *= -1;
    if (this.ball.y <= this.ballR) this.ball.vy *= -1;

    // Paddle bounce
    if (this.ball.y + this.ballR >= this.paddle.y &&
        this.ball.x >= this.paddle.x && this.ball.x <= this.paddle.x + this.paddleW &&
        this.ball.vy > 0) {
      this.ball.vy *= -1;
      this.ball.vx += (this.ball.x - (this.paddle.x + this.paddleW / 2)) * 0.05;
    }

    // Bottom - death
    if (this.ball.y > h) {
      this.running = false;
      this.ctx.fillStyle = 'rgba(255,0,0,0.3)';
      this.ctx.fillRect(0, 0, w, h);
      this.ctx.fillStyle = '#ff3333';
      this.ctx.font = '20px "Press Start 2P"';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('GAME OVER', w / 2, h / 2);
      return;
    }

    // Brick collision
    for (const brick of this.bricks) {
      if (!brick.alive) continue;
      if (this.ball.x >= brick.x && this.ball.x <= brick.x + this.brickW &&
          this.ball.y >= brick.y && this.ball.y <= brick.y + this.brickH) {
        brick.alive = false;
        this.ball.vy *= -1;
        this.score += 10;
        this.onScore(this.score);
        break;
      }
    }

    // Win
    if (this.bricks.every(b => !b.alive)) {
      this.running = false;
      this.ctx.fillStyle = '#00ff00';
      this.ctx.font = '20px "Press Start 2P"';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('YOU WIN!', w / 2, h / 2);
    }
  }

  _draw() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, w, h);

    // Bricks
    for (const brick of this.bricks) {
      if (!brick.alive) continue;
      ctx.fillStyle = brick.color;
      ctx.fillRect(brick.x, brick.y, this.brickW, this.brickH);
      ctx.strokeStyle = 'rgba(0,0,0,0.3)';
      ctx.strokeRect(brick.x, brick.y, this.brickW, this.brickH);
    }

    // Paddle
    ctx.fillStyle = '#ffb000';
    ctx.fillRect(this.paddle.x, this.paddle.y, this.paddleW, this.paddleH);

    // Ball
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(this.ball.x, this.ball.y, this.ballR, 0, Math.PI * 2);
    ctx.fill();
  }
}
