require('dotenv').config();

module.exports = {
  // Instagram Config
  instagram: {
    businessAccountId: process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID,
    accessToken: process.env.INSTAGRAM_ACCESS_TOKEN,
    apiVersion: 'v18.0'
  },

  // Image Generation Config (DALL-E, Stable Diffusion, etc.)
  imageGeneration: {
    provider: process.env.IMAGE_PROVIDER || 'openai', // 'openai', 'stability', 'replicate'
    apiKey: process.env.IMAGE_API_KEY,
    model: process.env.IMAGE_MODEL || 'dall-e-3'
  },

  // Posting Schedule
  posting: {
    // Cron expression: "0 9 * * *" = 9 AM daily
    cronTime: process.env.CRON_TIME || '0 9 * * *', // 9 AM every day
    timezone: process.env.TIMEZONE || 'Europe/Moscow',
    randomOrder: true
  },

  // Paths
  paths: {
    postsContent: '../../../instaposting/instagram_posts_content.json',
    imagePrompts: '../../../instaposting/image_prompts.json',
    styleExamples: '../../../instaposting/style_examples',
    generatedImages: '../../../instaposting/generated_images',
    postedLog: './data/posted.json'
  },

  // Logging
  logging: {
    verbose: process.env.VERBOSE === 'true',
    logFile: './logs/instagram-poster.log'
  }
};
