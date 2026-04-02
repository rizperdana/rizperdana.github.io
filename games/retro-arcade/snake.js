class SnakeGame {
  constructor(canvas, onScore) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.onScore = onScore;
    this.name = 'snake';
    this.grid = 20;
    this.running = false;
    this.frameId = null;
    this.speed = 120;

    canvas.width = 600;
    canvas.height = 400;
    this.cols = canvas.width / this.grid;
    this.rows = canvas.height / this.grid;

    this.snake = [];
    this.dir = { x: 1, y: 0 };
    this.nextDir = { x: 1, y: 0 };
    this.food = { x: 0, y: 0 };
    this.score = 0;

    this._onKey = this._onKey.bind(this);
  }

  start() {
    this.snake = [{ x: 5, y: 10 }, { x: 4, y: 10 }, { x: 3, y: 10 }];
    this.dir = { x: 1, y: 0 };
    this.nextDir = { x: 1, y: 0 };
    this.score = 0;
    this.onScore(0);
    this._placeFood();
    this.running = true;
    document.addEventListener('keydown', this._onKey);
    this._tick();
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.frameId);
    document.removeEventListener('keydown', this._onKey);
  }

  _onKey(e) {
    const k = e.key;
    if ((k === 'ArrowUp' || k === 'w') && this.dir.y !== 1) this.nextDir = { x: 0, y: -1 };
    if ((k === 'ArrowDown' || k === 's') && this.dir.y !== -1) this.nextDir = { x: 0, y: 1 };
    if ((k === 'ArrowLeft' || k === 'a') && this.dir.x !== 1) this.nextDir = { x: -1, y: 0 };
    if ((k === 'ArrowRight' || k === 'd') && this.dir.x !== -1) this.nextDir = { x: 1, y: 0 };
  }

  _placeFood() {
    do {
      this.food = { x: Math.floor(Math.random() * this.cols), y: Math.floor(Math.random() * this.rows) };
    } while (this.snake.some(s => s.x === this.food.x && s.y === this.food.y));
  }

  _tick() {
    if (!this.running) return;

    this.dir = { ...this.nextDir };
    const head = { x: this.snake[0].x + this.dir.x, y: this.snake[0].y + this.dir.y };

    // Wall collision
    if (head.x < 0 || head.x >= this.cols || head.y < 0 || head.y >= this.rows) {
      this._die(); return;
    }
    // Self collision
    if (this.snake.some(s => s.x === head.x && s.y === head.y)) {
      this._die(); return;
    }

    this.snake.unshift(head);

    if (head.x === this.food.x && head.y === this.food.y) {
      this.score += 10;
      this.onScore(this.score);
      this._placeFood();
      if (this.speed > 60) this.speed -= 2;
    } else {
      this.snake.pop();
    }

    this._draw();
    setTimeout(() => { this.frameId = requestAnimationFrame(() => this._tick()); }, this.speed);
  }

  _die() {
    this.running = false;
    this.ctx.fillStyle = 'rgba(255,0,0,0.3)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = '#ff3333';
    this.ctx.font = '24px "Press Start 2P"';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2);
  }

  _draw() {
    const ctx = this.ctx;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Grid dots
    ctx.fillStyle = '#111';
    for (let x = 0; x < this.cols; x++)
      for (let y = 0; y < this.rows; y++)
        ctx.fillRect(x * this.grid, y * this.grid, this.grid - 1, this.grid - 1);

    // Snake
    this.snake.forEach((seg, i) => {
      ctx.fillStyle = i === 0 ? '#33ff33' : '#22aa22';
      ctx.fillRect(seg.x * this.grid + 1, seg.y * this.grid + 1, this.grid - 2, this.grid - 2);
    });

    // Food
    ctx.fillStyle = '#ff3333';
    ctx.beginPath();
    ctx.arc(
      this.food.x * this.grid + this.grid / 2,
      this.food.y * this.grid + this.grid / 2,
      this.grid / 2 - 2, 0, Math.PI * 2
    );
    ctx.fill();
  }
}
