require('dotenv').config();

module.exports = {
  // Instagram Config
  instagram: {
    businessAccountId: process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID,
    accessToken: process.env.INSTAGRAM_ACCESS_TOKEN,
    apiVersion: '18.0'
  },

  // Image Hosting - use GitHub for best compatibility with Instagram
  github: {
    token: process.env.GITHUB_TOKEN,
    owner: process.env.GITHUB_OWNER || 'ZhdanenkoOleksandr',
    repo: process.env.GITHUB_REPO || 'bitbon-instagram-images',
    branch: 'main'
  },

  // imgbb Image Hosting Config (fallback)
  imgbb: {
    apiKey: process.env.IMGBB_API_KEY
  },

  // Image Generation Config (DALL-E, Stable Diffusion, etc.)
  imageGeneration: {
    provider: process.env.IMAGE_PROVIDER || 'openai', // 'openai', 'stability', 'replicate'
    apiKey: process.env.IMAGE_API_KEY,
    model: process.env.IMAGE_MODEL || 'dall-e-3'
  },

  // Posting Schedule
  posting: {
    // Cron expression: "27 11 * * *" = 11:27 AM daily (Kyiv time)
    cronTime: process.env.CRON_TIME || '27 11 * * *', // 11:27 AM every day
    timezone: process.env.TIMEZONE || 'Europe/Kyiv',
    randomOrder: true
  },

  // Paths
  paths: {
    postsContent: '../../instaposting/instagram_posts_content.json',
    imagePrompts: '../../instaposting/image_prompts.json',
    styleExamples: '../../instaposting/style_examples',
    generatedImages: '../../instaposting/generated_images',
    postedLog: './data/posted.json'
  },

  // Logging
  logging: {
    verbose: process.env.VERBOSE === 'true',
    logFile: './logs/instagram-poster.log'
  }
};
