// For testing - post immediately without waiting for schedule
require('dotenv').config();
const path = require('path');
const InstagramPoster = require('./instagram-poster');
const logger = require('./logger');

async function postNow() {
  try {
    logger.info(`📍 Current working directory: ${process.cwd()}`);
    logger.info(`📍 Script directory (__dirname): ${__dirname}`);
    logger.info('🚀 Manual post request - posting immediately...');
    const poster = new InstagramPoster();
    const result = await poster.postNextContent();
    logger.info(`✅ Post successful: ${result}`);
    process.exit(0);
  } catch (error) {
    logger.error('❌ Error:', error);
    process.exit(1);
  }
}

postNow();
