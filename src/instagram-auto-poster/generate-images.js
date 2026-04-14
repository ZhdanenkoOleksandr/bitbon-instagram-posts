// Pre-generate all images
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const ImageGenerator = require('./image-generator');
const config = require('./config');
const logger = require('./logger');

async function generateAllImages() {
  try {
    const imagePrompts = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, config.paths.imagePrompts),
        'utf8'
      )
    );

    const imageGenerator = new ImageGenerator();
    logger.info(`🎨 Starting generation of ${imagePrompts.length} images...`);

    for (let i = 0; i < imagePrompts.length; i++) {
      const prompt = imagePrompts[i];
      logger.info(`[${i + 1}/${imagePrompts.length}] Generating image for post ${prompt.post_number}...`);

      try {
        await imageGenerator.generate(prompt, prompt.post_number);
        logger.info(`✅ Image ${prompt.post_number} generated`);
      } catch (error) {
        logger.error(`❌ Failed to generate image ${prompt.post_number}:`, error);
      }

      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    logger.info('✅ All images generated!');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Error:', error);
    process.exit(1);
  }
}

generateAllImages();
