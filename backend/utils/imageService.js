import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import logger from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const IMAGE_QUALITY = {
    thumbnail: 60,
    medium: 75,
    large: 85
};

const IMAGE_SIZES = {
    thumbnail: { width: 150, height: 150 },
    medium: { width: 500, height: 500 },
    large: { width: 1200, height: 1200 }
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FORMATS = ['jpg', 'jpeg', 'png', 'webp'];

/**
 * Validate image file
 */
export const validateImage = (file) => {
    if (!file) {
        throw new Error('No file provided');
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
        throw new Error(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`);
    }

    // Check file format
    const ext = path.extname(file.originalname).toLowerCase().slice(1);
    if (!ALLOWED_FORMATS.includes(ext)) {
        throw new Error(`Invalid file format. Allowed: ${ALLOWED_FORMATS.join(', ')}`);
    }

    return true;
};

/**
 * Compress and optimize image
 */
export const compressImage = async (inputPath, outputPath, options = {}) => {
    try {
        const {
            width = null,
            height = null,
            quality = 80,
            format = 'webp'
        } = options;

        let pipeline = sharp(inputPath);

        // Resize if dimensions provided
        if (width || height) {
            pipeline = pipeline.resize(width, height, {
                fit: 'inside',
                withoutEnlargement: true
            });
        }

        // Convert to specified format
        if (format === 'webp') {
            pipeline = pipeline.webp({ quality });
        } else if (format === 'jpeg' || format === 'jpg') {
            pipeline = pipeline.jpeg({ quality, progressive: true });
        } else if (format === 'png') {
            pipeline = pipeline.png({ quality, compressionLevel: 9 });
        }

        await pipeline.toFile(outputPath);

        logger.info(`Image compressed: ${path.basename(outputPath)}`);
        return outputPath;
    } catch (error) {
        logger.error(`Image compression failed: ${error.message}`);
        throw error;
    }
};

/**
 * Generate multiple sizes of an image
 */
export const generateImageSizes = async (inputPath, outputDir, baseName) => {
    try {
        const results = {};

        // Ensure output directory exists
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Generate thumbnail
        const thumbnailPath = path.join(outputDir, `${baseName}_thumbnail.webp`);
        await compressImage(inputPath, thumbnailPath, {
            ...IMAGE_SIZES.thumbnail,
            quality: IMAGE_QUALITY.thumbnail,
            format: 'webp'
        });
        results.thumbnail = thumbnailPath;

        // Generate medium
        const mediumPath = path.join(outputDir, `${baseName}_medium.webp`);
        await compressImage(inputPath, mediumPath, {
            ...IMAGE_SIZES.medium,
            quality: IMAGE_QUALITY.medium,
            format: 'webp'
        });
        results.medium = mediumPath;

        // Generate large (optimized original)
        const largePath = path.join(outputDir, `${baseName}_large.webp`);
        await compressImage(inputPath, largePath, {
            ...IMAGE_SIZES.large,
            quality: IMAGE_QUALITY.large,
            format: 'webp'
        });
        results.large = largePath;

        logger.info(`Generated ${Object.keys(results).length} image sizes for ${baseName}`);
        return results;
    } catch (error) {
        logger.error(`Failed to generate image sizes: ${error.message}`);
        throw error;
    }
};

/**
 * Process uploaded image
 */
export const processUploadedImage = async (file, uploadDir = 'uploads') => {
    try {
        // Validate image
        validateImage(file);

        const timestamp = Date.now();
        const baseName = `${timestamp}_${path.parse(file.originalname).name}`;
        const outputDir = path.join(process.cwd(), uploadDir, 'processed');

        // Generate multiple sizes
        const sizes = await generateImageSizes(file.path, outputDir, baseName);

        // Delete original uploaded file
        if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
        }

        return {
            thumbnail: sizes.thumbnail.replace(process.cwd(), ''),
            medium: sizes.medium.replace(process.cwd(), ''),
            large: sizes.large.replace(process.cwd(), ''),
            original: sizes.large.replace(process.cwd(), '') // Use large as original
        };
    } catch (error) {
        logger.error(`Image processing failed: ${error.message}`);
        throw error;
    }
};

/**
 * Delete image files
 */
export const deleteImageFiles = (imagePaths) => {
    if (!Array.isArray(imagePaths)) {
        imagePaths = [imagePaths];
    }

    imagePaths.forEach(imagePath => {
        if (imagePath) {
            const fullPath = path.join(process.cwd(), imagePath);
            if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
                logger.info(`Deleted image: ${imagePath}`);
            }
        }
    });
};

export default {
    validateImage,
    compressImage,
    generateImageSizes,
    processUploadedImage,
    deleteImageFiles
};
