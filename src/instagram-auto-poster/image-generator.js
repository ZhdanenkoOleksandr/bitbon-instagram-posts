const axios = require('axios');
const fs = require('fs');
const path = require('path');
const config = require('./config');
const logger = require('./logger');

class ImageGenerator {
  constructor() {
    this.provider = config.imageGeneration.provider;
    this.apiKey = config.imageGeneration.apiKey;
  }

  async generate(imagePrompt, postNumber) {
    logger.info(`🎨 Generating image for post ${postNumber} using ${this.provider}...`);

    try {
      let imageUrl;

      if (this.provider === 'openai') {
        imageUrl = await this.generateWithDALLE(imagePrompt.image_prompt_en);
      } else if (this.provider === 'stability') {
        imageUrl = await this.generateWithStability(imagePrompt.image_prompt_en);
      } else if (this.provider === 'replicate') {
        imageUrl = await this.generateWithReplicate(imagePrompt.image_prompt_en);
      } else {
        throw new Error(`Unknown image provider: ${this.provider}`);
      }

      // Download and save image
      const savePath = await this.downloadImage(imageUrl, postNumber);
      logger.info(`✅ Image saved: ${savePath}`);
      return savePath;
    } catch (error) {
      logger.error('Error generating image:', error);
      throw error;
    }
  }

  async generateWithDALLE(prompt) {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/images/generations',
        {
          model: config.imageGeneration.model || 'dall-e-3',
          prompt: prompt,
          n: 1,
          size: '1024x1024',
          quality: 'hd'
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.data[0].url;
    } catch (error) {
      logger.error('DALL-E error:', error.response?.data || error.message);
      throw error;
    }
  }

  async generateWithStability(prompt) {
    try {
      const response = await axios.post(
        `https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image`,
        {
          text_prompts: [{ text: prompt }],
          cfg_scale: 7,
          height: 1024,
          width: 1024,
          samples: 1,
          steps: 30
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const imageData = response.data.artifacts[0].base64;
      const buffer = Buffer.from(imageData, 'base64');
      return buffer;
    } catch (error) {
      logger.error('Stability AI error:', error.response?.data || error.message);
      throw error;
    }
  }

  async generateWithReplicate(prompt) {
    try {
      const response = await axios.post(
        'https://api.replicate.com/v1/predictions',
        {
          version: 'ac732df83cea7fff18b8472768c88ad041fa750ff7682a21aef19f7e1e2a9e7b',
          input: { prompt: prompt }
        },
        {
          headers: {
            'Authorization': `Token ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Poll for completion
      const predictionId = response.data.id;
      return await this.pollReplicateStatus(predictionId);
    } catch (error) {
      logger.error('Replicate error:', error.response?.data || error.message);
      throw error;
    }
  }

  async pollReplicateStatus(predictionId) {
    return new Promise((resolve, reject) => {
      const interval = setInterval(async () => {
        try {
          const response = await axios.get(
            `https://api.replicate.com/v1/predictions/${predictionId}`,
            {
              headers: {
                'Authorization': `Token ${this.apiKey}`
              }
            }
          );

          if (response.data.status === 'succeeded') {
            clearInterval(interval);
            resolve(response.data.output[0]);
          } else if (response.data.status === 'failed') {
            clearInterval(interval);
            reject(new Error('Replicate prediction failed'));
          }
        } catch (error) {
          clearInterval(interval);
          reject(error);
        }
      }, 2000);
    });
  }

  async downloadImage(imageUrl, postNumber) {
    try {
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer'
      });

      const savePath = path.join(
        __dirname,
        config.paths.generatedImages,
        `post_${postNumber}.jpg`
      );

      // Ensure directory exists
      const dir = path.dirname(savePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(savePath, response.data);
      return savePath;
    } catch (error) {
      logger.error('Error downloading image:', error);
      throw error;
    }
  }
}

module.exports = ImageGenerator;
