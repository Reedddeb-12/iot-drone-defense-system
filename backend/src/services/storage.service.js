// Storage Service (AWS S3)
const AWS = require('aws-sdk');
const logger = require('../config/logger');

// Configure AWS
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

const s3 = new AWS.S3();

// Upload file to S3
exports.uploadToS3 = async (file, folder = 'uploads') => {
    try {
        const fileName = `${folder}/${Date.now()}-${file.originalname}`;
        
        const params = {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: fileName,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: 'public-read'
        };

        const result = await s3.upload(params).promise();

        logger.info(`File uploaded to S3: ${result.Key}`);

        return {
            url: result.Location,
            s3Key: result.Key,
            size: file.size,
            mimeType: file.mimetype
        };

    } catch (error) {
        logger.error('S3 upload error:', error);
        throw error;
    }
};

// Delete file from S3
exports.deleteFromS3 = async (s3Key) => {
    try {
        const params = {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: s3Key
        };

        await s3.deleteObject(params).promise();
        logger.info(`File deleted from S3: ${s3Key}`);

        return true;

    } catch (error) {
        logger.error('S3 delete error:', error);
        throw error;
    }
};

// Get signed URL for private files
exports.getSignedUrl = async (s3Key, expiresIn = 3600) => {
    try {
        const params = {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: s3Key,
            Expires: expiresIn
        };

        const url = await s3.getSignedUrlPromise('getObject', params);
        return url;

    } catch (error) {
        logger.error('Get signed URL error:', error);
        throw error;
    }
};
