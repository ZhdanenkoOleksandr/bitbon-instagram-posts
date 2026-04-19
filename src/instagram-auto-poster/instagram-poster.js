const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const config = require('./config');
const logger = require('./logger');
const ImageGenerator = require('./image-generator');

class InstagramPoster {
  constructor() {
    const postsContentRaw = this.loadJSON(config.paths.postsContent);
    const imagePromptsRaw = this.loadJSON(config.paths.imagePrompts);

    // Normalize postsContent to array format
    this.postsContent = Array.isArray(postsContentRaw)
      ? postsContentRaw
      : postsContentRaw?.posts || [];

    // Normalize imagePrompts to array format
    this.imagePrompts = Array.isArray(imagePromptsRaw)
      ? imagePromptsRaw
      : imagePromptsRaw?.prompts || [];

    logger.info(`[DEBUG] Normalized postsContent to array with ${this.postsContent.length} items`);
    logger.info(`[DEBUG] Normalized imagePrompts to array with ${this.imagePrompts.length} items`);

    this.postedLog = this.loadPostedLog();
    this.imageGenerator = new ImageGenerator();
  }

  loadJSON(filePath) {
    try {
      // Debug: log __dirname to verify module location
      logger.info(`[DEBUG] __dirname in loadJSON: ${__dirname}`);
      logger.info(`[DEBUG] filePath: ${filePath}`);

      // Resolve path from project root
      const fullPath = path.resolve(__dirname, filePath);
      logger.info(`Loading JSON from: ${fullPath}`);
      const data = fs.readFileSync(fullPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      const fullPath = path.resolve(__dirname, filePath);
      logger.error(`Error loading JSON from: ${fullPath}`, error);

      // Try alternative path - one level up
      try {
        const altPath = path.resolve(__dirname, `..${path.sep}..${path.sep}..${path.sep}instaposting`, path.basename(filePath));
        logger.info(`[DEBUG] Trying alternative path: ${altPath}`);
        if (fs.existsSync(altPath)) {
          logger.info(`[DEBUG] Found file at alternative path!`);
          const data = fs.readFileSync(altPath, 'utf8');
          return JSON.parse(data);
        }
      } catch (altError) {
        logger.error(`[DEBUG] Alternative path also failed`, altError);
      }

      return [];
    }
  }

  loadPostedLog() {
    try {
      const postedLogPath = path.resolve(__dirname, config.paths.postedLog);
      if (fs.existsSync(postedLogPath)) {
        const data = fs.readFileSync(postedLogPath, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      logger.error('Error loading posted log:', error);
    }
    return [];
  }

  savePostedLog() {
    const postedLogPath = path.resolve(__dirname, config.paths.postedLog);
    const dir = path.dirname(postedLogPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(
      postedLogPath,
      JSON.stringify(this.postedLog, null, 2)
    );
  }

  async postNextContent(retryCount = 0) {
    // Get available posts (not yet posted)
    const availablePosts = this.postsContent.filter(post =>
      !this.postedLog.some(logged => logged.postNumber === post.post_number)
    );

    if (availablePosts.length === 0) {
      // Prevent infinite recursion - only retry once
      if (retryCount === 0) {
        logger.warn('⚠️  All posts have been published! Resetting queue...');
        this.postedLog = [];
        this.savePostedLog();
        // Retry with full list (only once)
        return this.postNextContent(retryCount + 1);
      } else {
        // Second time no posts available - actually empty
        logger.error('❌ No posts available even after reset. Check postsContent.json');
        throw new Error('No posts available to publish');
      }
    }

    // Select random post if enabled
    const selectedPost = config.posting.randomOrder
      ? availablePosts[Math.floor(Math.random() * availablePosts.length)]
      : availablePosts[0];

    logger.info(`📝 Selected post #${selectedPost.post_number}: "${selectedPost.title}"`);

    try {
      // Generate or get image
      const imagePath = await this.getOrGenerateImage(selectedPost.post_number);

      // Prepare caption
      const caption = this.buildCaption(selectedPost);

      // Upload to Instagram directly with image file
      const postId = await this.publishPostWithImage(imagePath, caption);

      // Log the posted content
      this.postedLog.push({
        postNumber: selectedPost.post_number,
        postedAt: new Date().toISOString(),
        instagramPostId: postId,
        title: selectedPost.title
      });
      this.savePostedLog();

      logger.info(`✅ Successfully posted to Instagram! Post ID: ${postId}`);
      return postId;
    } catch (error) {
      logger.error(`Failed to post content #${selectedPost.post_number}:`, error);
      throw error;
    }
  }

  async publishPostWithImage(imagePath, caption) {
    try {
      logger.info(`📸 Publishing image directly to Instagram...`);

      // First, upload image to imgbb to get a public URL
      const imageUrl = await this.uploadImage(imagePath);

      const url = `https://graph.instagram.com/v${config.instagram.apiVersion}/${config.instagram.businessAccountId}/media`;

      logger.info(`📍 Using endpoint: ${url}`);
      logger.info(`📍 Using image URL: ${imageUrl}`);

      // Create media container with image URL
      const mediaResponse = await axios.post(url, {
        image_url: imageUrl,
        caption: caption,
        access_token: config.instagram.accessToken
      });

      const creationId = mediaResponse.data.id;
      logger.info(`✅ Media created with ID: ${creationId}`);

      // Wait for Instagram to process the media (required for publishing)
      logger.info(`⏳ Waiting for media processing...`);
      await new Promise(resolve => setTimeout(resolve, 5000)); // 5 second delay
      logger.info(`✅ Media processing complete, publishing...`);

      // Publish the media
      const publishUrl = `https://graph.instagram.com/v${config.instagram.apiVersion}/${config.instagram.businessAccountId}/media_publish`;
      const publishResponse = await axios.post(publishUrl, {
        creation_id: creationId,
        access_token: config.instagram.accessToken
      });

      logger.info(`✅ Post published successfully! Post ID: ${publishResponse.data.id}`);
      return publishResponse.data.id;
    } catch (error) {
      logger.error('Error publishing post with image:', error.response?.data || error.message);
      throw error;
    }
  }

  async getOrGenerateImage(postNumber) {
    const imagePath = path.join(
      config.paths.generatedImages,
      `post_${postNumber}.jpg`
    );

    // Check if image already exists
    if (fs.existsSync(imagePath)) {
      logger.info(`📸 Using existing image for post #${postNumber}`);
      return imagePath;
    }

    // Generate new image
    logger.info(`🎨 Generating image for post #${postNumber}...`);
    logger.info(`[DEBUG] imagePrompts array length: ${this.imagePrompts.length}, accessing index: ${postNumber - 1}`);
    const imagePrompt = this.imagePrompts[postNumber - 1];
    if (!imagePrompt) {
      logger.error(`[DEBUG] Missing imagePrompt for post #${postNumber}. Array length: ${this.imagePrompts.length}`);
      throw new Error(`No image prompt available for post #${postNumber}`);
    }
    const generatedPath = await this.imageGenerator.generate(
      imagePrompt,
      postNumber
    );

    return generatedPath;
  }

  buildCaption(post) {
    const caption = [
      post.title,
      '',
      post.text,
      '',
      '---',
      '',
      post.hashtags.join(' '),
      '',
      `❓ ${post.cta}`
    ].join('\n');

    // Instagram caption limit is 2,200 characters
    if (caption.length > 2200) {
      logger.warn('Caption exceeds 2200 chars, truncating...');
      return caption.substring(0, 2197) + '...';
    }

    return caption;
  }

  async uploadImage(imagePath) {
    try {
      logger.info(`📍 GitHub Token: ${config.github.token ? 'Set' : 'Not set'}`);
      logger.info(`📍 GitHub Owner: ${config.github.owner ? 'Set to ' + config.github.owner : 'Not set'}`);

      // If GitHub token is available, use GitHub for hosting
      if (config.github.token && config.github.owner) {
        logger.info(`📍 Using GitHub for image hosting...`);
        return await this.uploadToGitHub(imagePath);
      }
      // Fallback to imgbb
      logger.info(`📍 GitHub not configured, using imgbb fallback...`);
      return await this.uploadToImgbb(imagePath);
    } catch (error) {
      logger.error('Error uploading image:', error.message);
      throw error;
    }
  }

  async uploadToGitHub(imagePath) {
    try {
      logger.info(`📤 Uploading image to GitHub: ${path.basename(imagePath)}`);

      const imageBuffer = fs.readFileSync(imagePath);
      const base64Image = imageBuffer.toString('base64');
      const filename = path.basename(imagePath);

      const url = `https://api.github.com/repos/${config.github.owner}/${config.github.repo}/contents/images/${filename}`;

      const response = await axios.put(url, {
        message: `Add image: ${filename}`,
        content: base64Image,
        branch: config.github.branch
      }, {
        headers: {
          'Authorization': `token ${config.github.token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      const publicUrl = `https://raw.githubusercontent.com/${config.github.owner}/${config.github.repo}/${config.github.branch}/images/${filename}`;
      logger.info(`✅ Image uploaded to GitHub: ${publicUrl}`);

      return publicUrl;
    } catch (error) {
      logger.error('Error uploading to GitHub:', error.response?.data?.message || error.message);
      // Fallback to imgbb
      logger.info(`📤 GitHub upload failed, falling back to imgbb...`);
      return await this.uploadToImgbb(imagePath);
    }
  }

  async uploadToImgbb(imagePath) {
    try {
      logger.info(`📤 Uploading image to imgbb: ${path.basename(imagePath)}`);

      const imageBuffer = fs.readFileSync(imagePath);
      const base64Image = imageBuffer.toString('base64');

      const formData = new FormData();
      formData.append('image', base64Image);

      const url = `https://api.imgbb.com/1/upload?key=${config.imgbb.apiKey}`;
      const response = await axios.post(url, formData, {
        headers: formData.getHeaders()
      });

      const publicUrl = response.data.data.url;
      logger.info(`✅ Image uploaded to imgbb: ${publicUrl}`);

      return publicUrl;
    } catch (error) {
      logger.error('Error uploading to imgbb:', error.response?.data || error.message);
      throw error;
    }
  }

  async publishPost(mediaId, caption) {
    try {
      const url = `https://graph.instagram.com/v${config.instagram.apiVersion}/me/media`;

      // Step 1: Create media container (using the public imgbb URL)
      const mediaResponse = await axios.post(url, {
        image_url: mediaId,
        caption: caption,
        media_type: 'IMAGE',
        access_token: config.instagram.accessToken
      });

      const creationId = mediaResponse.data.id;

      // Step 2: Publish the media
      const publishUrl = `https://graph.instagram.com/v${config.instagram.apiVersion}/me/media_publish`;
      const publishResponse = await axios.post(publishUrl, {
        creation_id: creationId,
        access_token: config.instagram.accessToken
      });

      return publishResponse.data.id;
    } catch (error) {
      logger.error('Error publishing post:', error.response?.data || error.message);
      throw error;
    }
  }

  async getStatus() {
    const total = this.postsContent.length;
    const posted = this.postedLog.length;
    const remaining = total - posted;
    const nextPost = this.postsContent.find(p =>
      !this.postedLog.some(l => l.postNumber === p.post_number)
    );

    return {
      total,
      posted,
      remaining,
      nextPost: nextPost?.title || 'All posts published',
      lastPosted: this.postedLog[this.postedLog.length - 1]?.postedAt
    };
  }
}

module.exports = InstagramPoster;
