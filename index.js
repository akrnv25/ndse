#!/usr/bin/env node

const { hideBin } = require('yargs/helpers');
const yargs = require('yargs/yargs');

const argv = yargs(hideBin(process.argv))
  .command('current', 'Show current date', {
    year: {
      alias: 'y',
      type: 'boolean',
      describe: 'Show current year',
      conflicts: ['month', 'date']
    },
    month: {
      alias: 'm',
      type: 'boolean',
      describe: 'Show current month',
      conflicts: ['year', 'date']
    },
    date: {
      alias: 'd',
      type: 'boolean',
      describe: 'Show current date',
      conflicts: ['year', 'month']
    }
  })
  .command('add', 'Add X units to current date', {
    year: {
      alias: 'y',
      type: 'number',
      describe: 'Add X years to current date',
      conflicts: ['month', 'date'],
      nargs: 1
    },
    month: {
      alias: 'm',
      type: 'number',
      describe: 'Add X months to current date',
      conflicts: ['year', 'date'],
      nargs: 1
    },
    date: {
      alias: 'd',
      type: 'number',
      describe: 'Add X days to current date',
      conflicts: ['year', 'month'],
      nargs: 1
    }
  })
  .command('sub', 'Sub X units to current date', {
    year: {
      alias: 'y',
      type: 'number',
      describe: 'Sub X years to current date',
      conflicts: ['month', 'date'],
      nargs: 1
    },
    month: {
      alias: 'm',
      type: 'number',
      describe: 'Sub X months to current date',
      conflicts: ['year', 'date'],
      nargs: 1
    },
    date: {
      alias: 'd',
      type: 'number',
      describe: 'Sub X days to current date',
      conflicts: ['year', 'month'],
      nargs: 1
    }
  })
  .demandCommand(1, 'You need at least one command before moving on')
  .strict(true)
  .strictCommands(true)
  .check((argv, options) => {
    const { _, year, month, date } = argv;
    if (_.length > 1) {
      throw new Error('Only one command may be used');
    } else if ((_[0] === 'add' || _[0] === 'sub') && !year && !month && !date) {
      throw new Error('Command must have one option');
    } else {
      return true;
    }
  })
  .help('h')
  .alias('h', 'help')
  .version('v')
  .alias('v', 'version')
  .parse();

const command = argv._[0];
switch (command) {
  case 'current':
    handleCurrentCommand(argv);
    break;
  case 'add':
    handleAddCommand(argv);
    break;
  case 'sub':
    handleSubCommand(argv);
    break;
}

function handleCurrentCommand(argv) {
  const { year, month, date } = argv;
  const currentDate = new Date();
  if (year) {
    console.log(currentDate.getFullYear());
  } else if (month) {
    console.log(currentDate.getMonth() + 1);
  } else if (date) {
    console.log(currentDate.getDate());
  } else {
    console.log(currentDate);
  }
}

function handleAddCommand(argv) {
  const { year, month, date } = argv;
  const resultDate = new Date();
  if (year) {
    resultDate.setFullYear(resultDate.getFullYear() + year);
  } else if (month) {
    resultDate.setMonth(resultDate.getMonth() + month);
  } else if (date) {
    resultDate.setDate(resultDate.getDate() + date);
  }
  console.log(resultDate);
}

function handleSubCommand(argv) {
  const { year, month, date } = argv;
  const resultDate = new Date();
  if (year) {
    resultDate.setFullYear(resultDate.getFullYear() - year);
  } else if (month) {
    resultDate.setMonth(resultDate.getMonth() - month);
  } else if (date) {
    resultDate.setDate(resultDate.getDate() - date);
  }
  console.log(resultDate);
}
