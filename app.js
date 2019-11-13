/* eslint-disable class-methods-use-this */
/* eslint-disable no-use-before-define */
const $app = document.querySelector('.app');
const playground = [];
const entityList = [];
const playerTarget = [];
const tutorial = document.querySelector('.tutorial');
let playerScore = 0;
let isGameStarted = false;
let timerAllMove;
let isGameEnd = false;

function randInt(min, max) {
  const rand = min + Math.random() * (max + 1 - min);
  return Math.floor(rand);
}

class Entity {
  constructor(position) {
    this.position = position;

    entityList.push(this);
    this.updatePos();
    renderPlayground();
  }

  updatePos() {
    playground[this.position[1]][this.position[0]] = this.render();
  }
}

class Character extends Entity {
  constructor(speed, position) {
    super(position);
    this.speed = speed;
    this.score = 0;
  }

  moveRandom() {
    const r = randInt(0, 3);
    if (r === 0) this.moveUp();
    if (r === 1) this.moveDown();
    if (r === 2) this.moveLeft();
    if (r === 3) this.moveRight();
  }

  getPlayerMove() {
    const distanceX = Math.abs(playerTarget[0] - this.position[0]);
    const distanceY = Math.abs(playerTarget[1] - this.position[1]);
    if (
      Math.abs(playerTarget[0] - (this.position[0] + this.speed)) < distanceX
    ) {
      this.moveRight();
    } else if (
      Math.abs(playerTarget[0] - (this.position[0] - this.speed)) < distanceX
    ) {
      this.moveLeft();
    } else if (
      Math.abs(playerTarget[1] - (this.position[1] + this.speed)) < distanceY
    ) {
      this.moveDown();
    } else if (
      Math.abs(playerTarget[1] - (this.position[1] - this.speed)) < distanceY
    ) {
      this.moveUp();
    }
  }

  moveUp() {
    if (
      this.position[1] > -1 + this.speed &&
      this.isCanMove(this.position[0], this.position[1] - this.speed)
    ) {
      updateEntityList(this, this.position[0], this.position[1] - this.speed);
      this.position[1] -= this.speed;
      // updatePlayground();
    }
  }

  moveDown() {
    if (
      this.position[1] < 10 - this.speed &&
      this.isCanMove(this.position[0], this.position[1] + this.speed)
    ) {
      updateEntityList(this, this.position[0], this.position[1] + this.speed);
      this.position[1] += this.speed;
      // updatePlayground();
    }
  }

  moveRight() {
    if (
      this.position[0] < 10 - this.speed &&
      this.isCanMove(this.position[0] + this.speed, this.position[1])
    ) {
      updateEntityList(this, this.position[0] + this.speed, this.position[1]);
      this.position[0] += this.speed;
      // updatePlayground();
    }
  }

  moveLeft() {
    if (
      this.position[0] > -1 + this.speed &&
      this.isCanMove(this.position[0] - this.speed, this.position[1])
    ) {
      updateEntityList(this, this.position[0] - this.speed, this.position[1]);
      this.position[0] -= this.speed;
      // updatePlayground();
    }
  }
}

class Food extends Entity {
  render() {
    return '🍲';
  }
}

class Rat extends Character {
  constructor(position) {
    super(1, position);
  }

  isCanMove(x, y) {
    if (playground[y][x] === '' || playground[y][x] === '🍲') return true;
    return false;
  }

  render() {
    return '🐀';
  }
}

class Cat extends Character {
  constructor(position) {
    super(1, position);
  }

  isCanMove(x, y) {
    if (
      playground[y][x] === '' ||
      playground[y][x] === '🍲' ||
      playground[y][x] === '🐀'
    ) {
      return true;
    }
    return false;
  }

  render() {
    return '🐈';
  }
}

function createPlayground() {
  for (let i = 0; i < 10; i += 1) {
    playground[i] = [];
    for (let j = 0; j < 10; j += 1) {
      playground[i][j] = '';
    }
  }
}

function renderPlayground() {
  const $playground = document.createElement('div');
  const $btnReset = document.createElement('button');
  const $title = document.createElement('h1');
  $playground.classList.add('playground');
  $btnReset.classList.add('btn-reset');
  $btnReset.innerHTML = 'Начать заново';
  $title.classList.add('title');
  $app.innerHTML = '';
  if (!isGameEnd) {
    $title.innerHTML = `Score: ${playerScore}`;
  } else {
    $title.innerHTML = `Game over (Score: ${playerScore})`;
  }
  for (let i = 0; i < 10; i += 1) {
    for (let j = 0; j < 10; j += 1) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.x = j;
      cell.dataset.y = i;
      cell.innerHTML = playground[i][j];
      if (!isGameEnd && (playground[i][j] === '' || playground[i][j] === '🍲'))
        cell.classList.add('clickable');
      $playground.appendChild(cell);
    }
  }
  $app.appendChild($title);
  $app.appendChild($playground);
  $app.appendChild($btnReset);
}

function updatePlayground() {
  createPlayground();
  entityList.forEach(obj => {
    obj.updatePos();
  });
  renderPlayground();
}

function updateEntityList(obj, x, y) {
  obj.score += getPoints(x, y) || 0;
  const newEntityList = entityList.filter(entity => {
    if (entity.position[0] === x && entity.position[1] === y) {
      return false;
    }
    return true;
  });
  entityList.length = 0;
  entityList.push(...newEntityList);

  // entityList.forEach((entity, i) => {
  //   if (entity.position[0] === x && entity.position[1] === y) {
  //     entityList.splice(i, 1);
  //   }
  // });
}

function checkPlayerExist() {
  let res = false;
  entityList.forEach(obj => {
    if (obj instanceof Rat) res = true;
  });
  return res;
}

function updatePlayerScore() {
  playerScore = entityList[0].score;
}

function updatePlayerTarget(x, y) {
  playerTarget.length = 0;
  playerTarget.push(...[+x, +y]);
}

function getPoints(x, y) {
  if (playground[y][x] === '🍲') return 1;
  if (playground[y][x] === '🐀') return 2;
}

function generateEntity(amt, Class) {
  const objects = [];
  for (let i = 0; i < amt; i += 1) {
    const x = randInt(0, 9);
    const y = randInt(0, 9);
    if (playground[y][x] === '') {
      const obj = new Class([x, y]);
      objects.push(obj);
    }
  }
}

function resetGame() {
  tutorial.classList.remove('none');
  isGameStarted = false;
  isGameEnd = false;
  clearTimeout(timerAllMove);
  playerScore = 0;
  playerTarget.length = 0;
  entityList.length = 0;
  updatePlayground();
}

function startGame(x, y) {
  tutorial.classList.add('none');
  isGameStarted = true;
  isGameEnd = false;
  const player = new Rat([+x, +y]);
  updatePlayerScore();
  playerTarget.push(...[+x, +y]);
  generateEntity(randInt(7, 10), Food);
  generateEntity(randInt(3, 5), Cat);
  timerAllMove = setTimeout(doMoves, 1000);
}

function endGame() {
  console.log('game over');
  isGameStarted = false;
  isGameEnd = true;
  updatePlayground();
  clearTimeout(timerAllMove);
}

$app.addEventListener('click', e => {
  if (e.target && e.target.matches('.btn-reset')) {
    resetGame();
  }
  if (!isGameStarted && e.target && e.target.matches('.clickable')) {
    startGame(e.target.dataset.x, e.target.dataset.y);
  }
  if (isGameStarted && e.target && e.target.matches('.clickable')) {
    updatePlayerTarget(e.target.dataset.x, e.target.dataset.y);
  }
});

resetGame();

// const food = new Food([0, 3]);
// const rat = new Rat([0, 4]);
// const cat = new Cat([0, 2]);

function doMoves() {
  entityList.forEach(obj => {
    if (obj instanceof Cat) {
      obj.moveRandom();
    }
    if (obj instanceof Rat) {
      obj.getPlayerMove();
    }
  });
  if (checkPlayerExist()) {
    generateEntity(randInt(0, 1), Food);
    generateEntity(randInt(0, 1), Cat);
    updatePlayerScore();
    updatePlayground();
    timerAllMove = setTimeout(doMoves, 1000);
  } else endGame();
}
