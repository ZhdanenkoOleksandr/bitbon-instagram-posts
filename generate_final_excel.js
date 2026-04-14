const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

async function generateFinalExcel() {
  try {
    // Read all JSON files
    const postsPath = '/Users/oleksandr/Cloude Code/instagram_posts_content.json';
    const metricsPath = '/Users/oleksandr/Cloude Code/instagram_metrics.json';
    const imagesPath = '/Users/oleksandr/Cloude Code/image_prompts.json';

    const posts = JSON.parse(fs.readFileSync(postsPath, 'utf8'));
    const metrics = JSON.parse(fs.readFileSync(metricsPath, 'utf8'));
    const images = JSON.parse(fs.readFileSync(imagesPath, 'utf8'));

    // Create index maps for quick lookup
    const metricsMap = new Map(metrics.map(m => [m.post_number, m]));
    const imagesMap = new Map(images.map(i => [i.post_number, i]));

    // Create workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Instagram Posts');

    // Define columns
    worksheet.columns = [
      { header: 'Post #', key: 'post_number', width: 8 },
      { header: 'Rubric', key: 'rubric', width: 10 },
      { header: 'Format', key: 'format', width: 15 },
      { header: 'Title', key: 'title', width: 30 },
      { header: 'Post Text (500 chars)', key: 'post_text_short', width: 50 },
      { header: 'CTA', key: 'cta', width: 25 },
      { header: 'Hashtags', key: 'hashtags', width: 40 },
      { header: 'Image Prompt', key: 'image_prompt', width: 45 },
      { header: 'Image Style', key: 'image_style', width: 30 },
      { header: 'Color Scheme', key: 'color_scheme', width: 25 },
      { header: 'Composition', key: 'composition', width: 25 },
      { header: 'Optimal Time (UTC)', key: 'optimal_time', width: 18 },
      { header: 'Optimal Day', key: 'optimal_day', width: 12 },
      { header: 'Target Audience', key: 'target_audience', width: 40 },
      { header: 'Engagement Rate %', key: 'engagement_rate', width: 15 },
      { header: 'Estimated Reach', key: 'estimated_reach', width: 18 },
      { header: 'Content Format', key: 'content_format', width: 25 },
      { header: 'Stories Idea', key: 'stories_idea', width: 35 },
      { header: 'SEO Hashtags', key: 'seo_hashtags', width: 40 },
      { header: 'Cross-Platform', key: 'cross_platform', width: 30 },
      { header: 'Engagement Types', key: 'engagement_types', width: 30 },
      { header: 'Retention %', key: 'retention', width: 12 }
    ];

    // Add data rows
    posts.forEach(post => {
      const metric = metricsMap.get(post.post_number);
      const image = imagesMap.get(post.post_number);

      if (!metric || !image) {
        console.warn(`Missing metric or image data for post ${post.post_number}`);
      }

      const textShort = post.text.substring(0, 500);
      const hashtagsStr = post.hashtags.join(', ');
      const seoHashtagsStr = metric?.seo_hashtags?.join(', ') || '';

      // Extract retention percentage from retention_prediction
      let retentionPercent = '80%';
      if (metric?.retention_prediction) {
        const match = metric.retention_prediction.match(/(\d+)/);
        if (match) {
          retentionPercent = match[1] + '%';
        }
      }

      worksheet.addRow({
        post_number: post.post_number,
        rubric: post.rubric,
        format: post.format,
        title: post.title,
        post_text_short: textShort,
        cta: post.cta,
        hashtags: hashtagsStr,
        image_prompt: image?.image_prompt_en || '',
        image_style: image?.style_keywords?.join(', ') || '',
        color_scheme: image?.color_scheme || '',
        composition: image?.composition || '',
        optimal_time: metric?.optimal_posting_time || '',
        optimal_day: metric?.optimal_posting_day || '',
        target_audience: metric?.target_audience || '',
        engagement_rate: metric?.estimated_engagement_rate || '',
        estimated_reach: metric?.estimated_reach || '',
        content_format: metric?.content_format_recommendation || '',
        stories_idea: metric?.instagram_stories_idea || '',
        seo_hashtags: seoHashtagsStr,
        cross_platform: metric?.cross_platform_sharing || '',
        engagement_types: metric?.engagement_prediction || '',
        retention: retentionPercent
      });
    });

    // Format header row
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF366092' } };
    worksheet.getRow(1).alignment = { horizontal: 'center', vertical: 'center', wrapText: true };

    // Format data rows
    for (let i = 2; i <= worksheet.rowCount; i++) {
      worksheet.getRow(i).alignment = { wrapText: true, vertical: 'top' };
    }

    // Save workbook
    const outputPath = '/Users/oleksandr/Cloude Code/instagram_posts_final.xlsx';
    await workbook.xlsx.writeFile(outputPath);

    console.log(`✅ Excel file generated successfully: ${outputPath}`);
    console.log(`📊 Total posts: ${posts.length}`);
    console.log(`📊 Total rows: ${worksheet.rowCount - 1}`);

  } catch (error) {
    console.error('❌ Error generating Excel:', error.message);
    process.exit(1);
  }
}

generateFinalExcel();
