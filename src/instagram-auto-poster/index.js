const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const InstagramPoster = require('./instagram-poster');
const config = require('./config');
const logger = require('./logger');

// Initialize directories
const requiredDirs = ['./data', './logs'];
requiredDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const poster = new InstagramPoster();

// Main scheduled task
const job = cron.schedule(config.posting.cronTime, async () => {
  logger.info('🚀 Starting scheduled Instagram post...');
  try {
    await poster.postNextContent();
    logger.info('✅ Post published successfully!');
  } catch (error) {
    logger.error('❌ Error posting to Instagram:', error);
  }
}, {
  timezone: config.posting.timezone
});

// Health check every hour
setInterval(async () => {
  const status = await poster.getStatus();
  logger.info(`📊 Health check: ${status.nextPost || 'No posts scheduled'}`);
}, 3600000);

// Start logging
logger.info('🎬 Instagram Auto-Poster Started');
logger.info(`⏰ Posting schedule: ${config.posting.cronTime} (${config.posting.timezone})`);
logger.info(`🎲 Random order: ${config.posting.randomOrder}`);

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info('Shutting down gracefully...');
  job.stop();
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error);
  process.exit(1);
});

module.exports = job;
