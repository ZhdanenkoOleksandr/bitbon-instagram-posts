const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const config = require('./config');
const logger = require('./logger');
const ImageGenerator = require('./image-generator');

class InstagramPoster {
  constructor() {
    this.postsContent = this.loadJSON(config.paths.postsContent);
    this.imagePrompts = this.loadJSON(config.paths.imagePrompts);
    this.postedLog = this.loadPostedLog();
    this.imageGenerator = new ImageGenerator();
  }

  loadJSON(filePath) {
    try {
      const fullPath = path.join(__dirname, filePath);
      const data = fs.readFileSync(fullPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      logger.error(`Error loading JSON: ${filePath}`, error);
      return [];
    }
  }

  loadPostedLog() {
    try {
      if (fs.existsSync(config.paths.postedLog)) {
        const data = fs.readFileSync(config.paths.postedLog, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      logger.error('Error loading posted log:', error);
    }
    return [];
  }

  savePostedLog() {
    fs.writeFileSync(
      config.paths.postedLog,
      JSON.stringify(this.postedLog, null, 2)
    );
  }

  async postNextContent() {
    // Get available posts (not yet posted)
    const availablePosts = this.postsContent.filter(post =>
      !this.postedLog.some(logged => logged.postNumber === post.post_number)
    );

    if (availablePosts.length === 0) {
      logger.warn('⚠️  All posts have been published! Resetting queue...');
      this.postedLog = [];
      this.savePostedLog();
      // Retry with full list
      return this.postNextContent();
    }

    // Select random post if enabled
    const selectedPost = config.posting.randomOrder
      ? availablePosts[Math.floor(Math.random() * availablePosts.length)]
      : availablePosts[0];

    logger.info(`📝 Selected post #${selectedPost.post_number}: "${selectedPost.title}"`);

    try {
      // Generate or get image
      const imageUrl = await this.getOrGenerateImage(selectedPost.post_number);

      // Prepare caption
      const caption = this.buildCaption(selectedPost);

      // Upload to Instagram
      const mediaId = await this.uploadImage(imageUrl);
      const postId = await this.publishPost(mediaId, caption);

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
    const imagePrompt = this.imagePrompts[postNumber - 1];
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
      const form = new FormData();
      const fileStream = fs.createReadStream(imagePath);
      form.append('file', fileStream);

      // For now, return a mock media ID
      // In production, this would upload to Instagram's media endpoint
      logger.info(`📤 Uploading image: ${path.basename(imagePath)}`);

      // Placeholder - actual implementation depends on Instagram Graph API
      return `media_${Date.now()}`;
    } catch (error) {
      logger.error('Error uploading image:', error);
      throw error;
    }
  }

  async publishPost(mediaId, caption) {
    try {
      const url = `https://graph.instagram.com/v${config.instagram.apiVersion}/${config.instagram.businessAccountId}/media`;

      // Step 1: Create media container
      const mediaResponse = await axios.post(url, {
        image_url: mediaId, // In production, this would be the actual uploaded image URL
        caption: caption,
        access_token: config.instagram.accessToken
      });

      const creationId = mediaResponse.data.id;

      // Step 2: Publish the media
      const publishUrl = `https://graph.instagram.com/v${config.instagram.apiVersion}/${config.instagram.businessAccountId}/media_publish`;
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
