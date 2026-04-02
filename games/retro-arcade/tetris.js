class TetrisGame {
  constructor(canvas, onScore) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.onScore = onScore;
    this.name = 'tetris';
    this.running = false;
    this.frameId = null;

    this.cols = 10;
    this.rows = 20;
    this.block = 20;
    canvas.width = this.cols * this.block;
    canvas.height = this.rows * this.block;

    this.board = [];
    this.piece = null;
    this.score = 0;
    this.dropInterval = 800;
    this.lastDrop = 0;

    this.shapes = [
      [[1,1,1,1]],                          // I
      [[1,1],[1,1]],                          // O
      [[0,1,0],[1,1,1]],                      // T
      [[1,0,0],[1,1,1]],                      // L
      [[0,0,1],[1,1,1]],                      // J
      [[0,1,1],[1,1,0]],                      // S
      [[1,1,0],[0,1,1]],                      // Z
    ];
    this.colors = ['#00ffff','#ffff00','#aa00ff','#ff8800','#0000ff','#00ff00','#ff0000'];

    this.keys = {};
    this._onKey = this._onKey.bind(this);
  }

  start() {
    this.board = Array.from({ length: this.rows }, () => Array(this.cols).fill(0));
    this.score = 0;
    this.onScore(0);
    this.dropInterval = 800;
    this._newPiece();
    this.running = true;
    this.lastDrop = performance.now();
    document.addEventListener('keydown', this._onKey);
    this._loop();
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.frameId);
    document.removeEventListener('keydown', this._onKey);
  }

  _onKey(e) {
    if (!this.running) return;
    const k = e.key;
    if (k === 'ArrowLeft' || k === 'a') this._move(-1);
    if (k === 'ArrowRight' || k === 'd') this._move(1);
    if (k === 'ArrowDown' || k === 's') this._drop();
    if (k === 'ArrowUp' || k === 'w') this._rotate();
    if (k === ' ') { while (this._drop()); }
  }

  _newPiece() {
    const idx = Math.floor(Math.random() * this.shapes.length);
    this.piece = {
      shape: this.shapes[idx].map(r => [...r]),
      color: this.colors[idx],
      x: Math.floor(this.cols / 2) - 1,
      y: 0,
    };
    if (this._collision()) {
      this.running = false;
      this.ctx.fillStyle = 'rgba(255,0,0,0.3)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = '#ff3333';
      this.ctx.font = '16px "Press Start 2P"';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2);
    }
  }

  _collision(ox = 0, oy = 0, shape = this.piece.shape) {
    for (let y = 0; y < shape.length; y++)
      for (let x = 0; x < shape[y].length; x++)
        if (shape[y][x]) {
          const nx = this.piece.x + x + ox;
          const ny = this.piece.y + y + oy;
          if (nx < 0 || nx >= this.cols || ny >= this.rows) return true;
          if (ny >= 0 && this.board[ny][nx]) return true;
        }
    return false;
  }

  _move(dx) { if (!this._collision(dx, 0)) this.piece.x += dx; }

  _drop() {
    if (!this._collision(0, 1)) { this.piece.y++; return true; }
    this._lock();
    return false;
  }

  _rotate() {
    const s = this.piece.shape;
    const rotated = s[0].map((_, i) => s.map(row => row[i]).reverse());
    if (!this._collision(0, 0, rotated)) this.piece.shape = rotated;
  }

  _lock() {
    for (let y = 0; y < this.piece.shape.length; y++)
      for (let x = 0; x < this.piece.shape[y].length; x++)
        if (this.piece.shape[y][x]) {
          const by = this.piece.y + y;
          if (by >= 0) this.board[by][this.piece.x + x] = this.piece.color;
        }
    this._clearLines();
    this._newPiece();
  }

  _clearLines() {
    let cleared = 0;
    for (let y = this.rows - 1; y >= 0; y--) {
      if (this.board[y].every(c => c)) {
        this.board.splice(y, 1);
        this.board.unshift(Array(this.cols).fill(0));
        cleared++;
        y++;
      }
    }
    if (cleared) {
      this.score += cleared * 100;
      this.onScore(this.score);
      this.dropInterval = Math.max(100, 800 - this.score / 2);
    }
  }

  _loop() {
    if (!this.running) return;
    const now = performance.now();
    if (now - this.lastDrop > this.dropInterval) {
      this._drop();
      this.lastDrop = now;
    }
    this._draw();
    this.frameId = requestAnimationFrame(() => this._loop());
  }

  _draw() {
    const ctx = this.ctx;
    const b = this.block;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Grid
    ctx.strokeStyle = '#111';
    for (let x = 0; x <= this.cols; x++) {
      ctx.beginPath(); ctx.moveTo(x * b, 0); ctx.lineTo(x * b, this.rows * b); ctx.stroke();
    }
    for (let y = 0; y <= this.rows; y++) {
      ctx.beginPath(); ctx.moveTo(0, y * b); ctx.lineTo(this.cols * b, y * b); ctx.stroke();
    }

    // Board
    for (let y = 0; y < this.rows; y++)
      for (let x = 0; x < this.cols; x++)
        if (this.board[y][x]) {
          ctx.fillStyle = this.board[y][x];
          ctx.fillRect(x * b + 1, y * b + 1, b - 2, b - 2);
        }

    // Active piece
    if (this.piece) {
      ctx.fillStyle = this.piece.color;
      for (let y = 0; y < this.piece.shape.length; y++)
        for (let x = 0; x < this.piece.shape[y].length; x++)
          if (this.piece.shape[y][x])
            ctx.fillRect((this.piece.x + x) * b + 1, (this.piece.y + y) * b + 1, b - 2, b - 2);
    }
  }
}
