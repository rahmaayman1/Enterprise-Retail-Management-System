const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, '../logs/activity.log');

const writeLog = (level, message) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level.toUpperCase()}]: ${message}\n`;

  fs.appendFile(logFile, logMessage, (err) => {
    if (err) {
      console.error("Error writing log:", err);
    }
  });

  console.log(logMessage);
};

const logger = {
  info: (message) => writeLog('info', message),
  error: (message) => writeLog('error', message),
  warn: (message) => writeLog('warn', message)
};

module.exports = logger;
