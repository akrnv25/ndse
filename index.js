#!/usr/bin/env node

const { hideBin } = require('yargs/helpers');
const yargs = require('yargs/yargs');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

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
  .demandCommand(1, 'You need at least one command before moving on')
  .strict(true)
  .strictCommands(true)
  .help('h')
  .alias('h', 'help')
  .version('v')
  .alias('v', 'version')
  .parse();

const command = argv._[0];
if (command === 'start') {
  startGame(argv.file);
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
  const dirPath = path.join(__dirname, 'logs');
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
