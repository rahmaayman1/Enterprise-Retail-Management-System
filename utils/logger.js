const fs = require('fs');
const path = require('path');

// تحديد مكان ملف الـ log
const logFile = path.join(__dirname, '../logs/activity.log');

// دالة مساعدة لكتابة أي رسالة في ملف الـ log
const writeLog = (level, message) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level.toUpperCase()}]: ${message}\n`;

  // الكتابة في الملف (append عشان ميتمسحش القديم)
  fs.appendFile(logFile, logMessage, (err) => {
    if (err) {
      console.error("Error writing log:", err);
    }
  });

  // برضو نطبع الرسالة في الـ console
  console.log(logMessage);
};

// دوال للتسهيل
const logger = {
  info: (message) => writeLog('info', message),
  error: (message) => writeLog('error', message),
  warn: (message) => writeLog('warn', message)
};

module.exports = logger;
