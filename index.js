#!/usr/bin/env node

const { hideBin } = require('yargs/helpers');
const yargs = require('yargs/yargs');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

const LOGS_DIR = 'logs';

const argv = yargs(hideBin(process.argv))
  .command('start', 'Start game', {
    file: {
      alias: 'f',
      type: 'string',
      describe: 'Log file name',
      nargs: 1,
      demand: true
    }
  })
  .command('results', 'Show game results', {
    file: {
      alias: 'f',
      type: 'string',
      describe: 'Log file name',
      nargs: 1,
      demand: true
    }
  })
  .demandCommand(1, 'You need at least one command before moving on')
  .strict(true)
  .strictCommands(true)
  .help('h')
  .alias('h', 'help')
  .version('v')
  .alias('v', 'version')
  .parse();

const command = argv._[0];
switch (command) {
  case 'start':
    startGame(argv.file);
    break;
  case 'results':
    showGameResults(argv.file);
    break;
}

function startGame(file) {
  console.log('Игра "Орел или решка"');
  console.log('Загадано случайное число (1 или 2)');
  const hiddenNum = getRandomNum(1, 2);
  const input = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true
  });
  input.on('line', async (num) => {
    const isWinner = +num === hiddenNum;
    console.log(isWinner ? 'Вы выиграли' : 'Вы проиграли');
    await logGameResult(file, isWinner);
    console.log(`Результат игры сохранен в файле "${file}.json"`);
    input.question('Сыграть еще раз? (y/n): ', (answer) => {
      input.close();
      if (answer === 'y') {
        startGame(file);
      }
    });
  });
}

async function logGameResult(file, isWinner) {
  const dirPath = path.join(__dirname, LOGS_DIR);
  if (!checkDir(dirPath)) {
    await fs.promises.mkdir(dirPath);
  }
  const filePath = path.join(dirPath, `${file}.json`);
  let gameResults = [];
  if (checkFile(filePath)) {
    const fileData = await fs.promises.readFile(filePath, { encoding: 'utf8' });
    gameResults = parseJson(fileData) || [];
  }
  gameResults.push({ timestamp: Date.now(), isWinner });
  const updatedFileData = JSON.stringify(gameResults, null, 2);
  await fs.promises.writeFile(filePath, updatedFileData, { encoding: 'utf8' });
}

function getRandomNum(min, max) {
  const num = min + Math.random() * (max + 1 - min);
  return Math.floor(num);
}

function checkFile(filePath) {
  try {
    const stat = fs.lstatSync(filePath);
    return stat.isFile() && path.extname(filePath) === '.json';
  } catch (error) {
    return false;
  }
}

function checkDir(dirPath) {
  try {
    const stat = fs.lstatSync(dirPath);
    return stat.isDirectory();
  } catch (error) {
    return false;
  }
}

function parseJson(data) {
  try {
    return JSON.parse(data);
  } catch (error) {}
}

function showGameResults(file) {
  const filePath = path.join(__dirname, LOGS_DIR, `${file}.json`);
  if (!checkFile(filePath)) {
    console.log(`Файла ${file}.json не существует`);
    return;
  }
  const readStream = fs.createReadStream(filePath, { encoding: 'utf8' });
  let fileData = '';
  readStream.on('data', (chunk) => {
    fileData += chunk;
  });
  readStream.on('end', () => {
    const gameResults = parseJson(fileData) || [];
    const gamesCount = gameResults.length;
    const { winsCount, lossesCount } = gameResults.reduce((acc, gameResult) => {
      if (gameResult.isWinner) {
        acc.winsCount += 1;
      } else {
        acc.lossesCount += 1;
      }
      return acc;
    }, { winsCount: 0, lossesCount: 0 });
    const winsPercent = Math.round(winsCount / gamesCount * 100);
    console.log(`Колличество партий: ${gamesCount}`);
    console.log(`Колличество побед: ${winsCount}`);
    console.log(`Колличество поражений: ${lossesCount}`);
    console.log(`Процент побед: ${winsPercent}%`);
  });
}
