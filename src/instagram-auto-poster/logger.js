const fs = require('fs');
const path = require('path');
const config = require('./config');

const logsDir = path.dirname(config.logging.logFile);

// Ensure logs directory exists
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const timestamp = () => new Date().toISOString();

const formatMessage = (level, message, data = '') => {
  return `[${timestamp()}] [${level}] ${message} ${data}`;
};

const logger = {
  info: (message, data) => {
    const msg = formatMessage('INFO', message, data || '');
    console.log(msg);
    fs.appendFileSync(config.logging.logFile, msg + '\n');
  },

  warn: (message, data) => {
    const msg = formatMessage('WARN', message, data || '');
    console.warn(msg);
    fs.appendFileSync(config.logging.logFile, msg + '\n');
  },

  error: (message, error) => {
    const errorMsg = error?.message || JSON.stringify(error);
    const msg = formatMessage('ERROR', message, errorMsg);
    console.error(msg);
    fs.appendFileSync(config.logging.logFile, msg + '\n');
  },

  debug: (message, data) => {
    if (config.logging.verbose) {
      const msg = formatMessage('DEBUG', message, JSON.stringify(data));
      console.log(msg);
      fs.appendFileSync(config.logging.logFile, msg + '\n');
    }
  }
};

module.exports = logger;
