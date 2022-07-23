#!/usr/bin/env node

const readline = require('readline');

const input = readline.createInterface(process.stdin);

console.log('Загадано число в диапазоне от 0 до 100');
const hiddenNum = getRandomNum(0, 100);

input.on('line', (num) => {
  if (+num > hiddenNum) {
    console.log('Больше');
  } else if (+num < hiddenNum) {
    console.log('Меньше');
  } else {
    console.log(`Отгадано число ${num}`);
    input.close();
  }
})

function getRandomNum(min, max) {
  const num = min + Math.random() * (max + 1 - min);
  return Math.floor(num);
}
