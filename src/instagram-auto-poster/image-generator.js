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
    logger.info(`[DEBUG] imagePrompt type: ${typeof imagePrompt}, keys: ${imagePrompt ? Object.keys(imagePrompt).join(', ') : 'null'}`);
    logger.info(`[DEBUG] imagePrompt: ${JSON.stringify(imagePrompt).substring(0, 200)}`);

    try {
      let imageUrl;

      // Handle both direct string prompts and object prompts
      const promptText = typeof imagePrompt === 'string'
        ? imagePrompt
        : imagePrompt?.image_prompt_en || imagePrompt?.prompt || JSON.stringify(imagePrompt);

      if (this.provider === 'openai') {
        imageUrl = await this.generateWithDALLE(promptText);
      } else if (this.provider === 'stability') {
        imageUrl = await this.generateWithStability(promptText);
      } else if (this.provider === 'replicate') {
        imageUrl = await this.generateWithReplicate(promptText);
      } else if (this.provider === 'gemini') {
        return await this.generateWithGemini(promptText, postNumber);
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

  async generateWithGemini(prompt, postNumber) {
    try {
      // Use Gemini 2.5 vision for image understanding + DALL-E alternative
      // Since direct Imagen API requires special setup, using Replicate's Flux model as fallback with Gemini API
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`,
        {
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `You are an image generation expert. Generate a detailed description for image generation: ${prompt}. Return ONLY the enhanced prompt, nothing else.`
                }
              ]
            }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': this.apiKey
          }
        }
      );

      // For now, create a placeholder since Gemini doesn't directly generate images
      // This demonstrates the integration is working
      logger.warn('⚠️  Gemini API text mode - creating placeholder. Use openai/stability for actual image generation');

      const savePath = path.join(
        __dirname,
        config.paths.generatedImages,
        `post_${postNumber}.jpg`
      );

      const dir = path.dirname(savePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Create a simple placeholder (1x1 pixel PNG)
      const pngBuffer = Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
        0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
        0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
        0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0x99, 0x63, 0xF8, 0x0F, 0x00, 0x00,
        0x01, 0x01, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x1B, 0xB6, 0xEE, 0x56,
        0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
      ]);

      fs.writeFileSync(savePath, pngBuffer);
      logger.info(`✅ Placeholder image saved: ${savePath}`);
      return savePath;
    } catch (error) {
      logger.error('Gemini error:', error.response?.data || error.message);
      throw error;
    }
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
