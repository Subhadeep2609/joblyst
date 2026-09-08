import { Readable } from 'stream';
import path from 'path';
import fs from 'fs';
import cloudinary, { isCloudinaryConfigured } from '../config/cloudinary.js';

/**
 * Upload buffer directly to Cloudinary using stream
 * @param {Buffer} buffer - File buffer from multer memoryStorage
 * @param {Object} options - Cloudinary upload options
 * @returns {Promise<Object>} - Cloudinary upload result
 */
const uploadStreamToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });

    Readable.from(buffer).pipe(uploadStream);
  });
};

/**
 * Upload a file to Cloudinary with automatic fallback to local disk
 * @param {Object} file - Multer file object (with buffer)
 * @param {string} folder - Destination folder name (e.g. 'resumes', 'avatars')
 * @returns {Promise<{ url: string, publicId?: string, originalName: string, storage: 'cloudinary' | 'local' }>}
 */
export const uploadFileToStorage = async (file, folder = 'resumes') => {
  if (!file) {
    throw new Error('No file provided for upload.');
  }

  const ext = path.extname(file.originalname).toLowerCase();
  const sanitizedBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
  const filenameWithExt = `${sanitizedBase}-${uniqueSuffix}${ext}`;

  // If Cloudinary credentials are provided, upload to Cloudinary
  if (isCloudinaryConfigured()) {
    try {
      // Determine resource type: documents (.pdf, .doc, .docx) are uploaded as 'raw'
      // to preserve full document fidelity and avoid image conversion issues
      const isDocument = ['.pdf', '.doc', '.docx', '.txt'].includes(ext);
      const resourceType = isDocument ? 'raw' : 'auto';

      // For raw files, Cloudinary requires the extension in public_id to preserve the format
      const publicId = `job_portal/${folder}/${filenameWithExt}`;

      const uploadOptions = {
        folder: `job_portal/${folder}`,
        public_id: filenameWithExt,
        resource_type: resourceType,
        use_filename: true,
        unique_filename: false,
        overwrite: true
      };

      const result = await uploadStreamToCloudinary(file.buffer, uploadOptions);

      return {
        url: result.secure_url,
        publicId: result.public_id,
        originalName: file.originalname,
        resourceType: result.resource_type,
        bytes: result.bytes,
        storage: 'cloudinary'
      };
    } catch (cloudinaryError) {
      console.error('[Cloudinary Upload Error]:', cloudinaryError.message || cloudinaryError);
      const errMsg = cloudinaryError.message || '';
      if (errMsg.includes('403') || errMsg.includes('missing permissions') || errMsg.includes('create')) {
        throw new Error(
          'Cloudinary upload failed: The API Key lacks "create/upload" permissions. In Cloudinary Console -> Settings -> Access Keys, enable "Create" permissions for this key (or use your Master API Key).'
        );
      }
      throw new Error(`Cloudinary upload failed: ${errMsg || 'Unknown error'}`);
    }
  }

  // Graceful Local Fallback: when Cloudinary credentials are not configured in development
  console.warn('[Storage]: Cloudinary credentials not configured. Saving file to local disk fallback.');
  const targetDir = path.join(process.cwd(), 'src', 'uploads', folder);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const localFilePath = path.join(targetDir, filenameWithExt);
  await fs.promises.writeFile(localFilePath, file.buffer);

  const localUrl = `/uploads/${folder}/${filenameWithExt}`;
  return {
    url: localUrl,
    publicId: filenameWithExt,
    originalName: file.originalname,
    storage: 'local'
  };
};

/**
 * Delete a file from Cloudinary or local disk
 * @param {string} fileUrl - Full Cloudinary URL or relative local path
 * @param {'raw' | 'image' | 'video' | 'auto'} resourceType - Cloudinary resource type
 */
export const deleteFileFromStorage = async (fileUrl, resourceType = 'raw') => {
  if (!fileUrl) return;

  try {
    // If it's a Cloudinary URL
    if (fileUrl.includes('cloudinary.com') && isCloudinaryConfigured()) {
      // Extract public_id from Cloudinary URL:
      // Format: https://res.cloudinary.com/<cloud>/<type>/upload/v<version>/<public_id>
      const match = fileUrl.match(/\/upload\/(?:v\d+\/)?(.+)$/);
      if (match && match[1]) {
        const publicId = match[1];
        await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
        console.log(`[Storage]: Deleted from Cloudinary (${publicId})`);
      }
    } else if (fileUrl.startsWith('/uploads/')) {
      // Local file path
      const relativePath = fileUrl.replace(/^\//, '');
      const fullPath = path.join(process.cwd(), relativePath);
      if (fs.existsSync(fullPath)) {
        await fs.promises.unlink(fullPath);
        console.log(`[Storage]: Deleted local file (${relativePath})`);
      }
    }
  } catch (error) {
    console.error('[Storage Delete Error]:', error.message);
  }
};
