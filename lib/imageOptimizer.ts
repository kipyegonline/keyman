import imageCompression from "browser-image-compression";

/**
 * Optimizes image files for upload (ID photos, selfies, etc.)
 * Compresses and resizes images while maintaining quality
 *
 * @param file - The original image file to optimize
 * @param options - Optional compression settings
 * @returns Compressed image file
 */
export async function optimizeImage(
  file: File,
  options?: {
    maxSizeMB?: number;
    maxWidthOrHeight?: number;
    fileType?: string;
    initialQuality?: number;
  }
): Promise<File> {
  try {
    const defaultOptions = {
      maxSizeMB: 1, // Maximum file size in MB
      maxWidthOrHeight: 1920, // Max dimension (width or height)
      useWebWorker: true, // Use web worker for better performance
      fileType: file.type || "image/jpeg", // Preserve original type or default to JPEG
      initialQuality: 0.85, // Quality (0-1), 0.85 is good balance
      ...options, // Allow overriding defaults
    };

    const compressedFile = await imageCompression(file, defaultOptions);

    // Return as File with original name
    return new File([compressedFile], file.name, {
      type: compressedFile.type,
      lastModified: Date.now(),
    });
  } catch (error) {
    console.error("Error optimizing image:", error);
    // If compression fails, return original file
    return file;
  }
}

/**
 * Optimizes ID document photos with settings optimized for text clarity
 *
 * @param file - The ID photo file
 * @returns Compressed image file
 */
export async function optimizeIDPhoto(file: File): Promise<File> {
  return optimizeImage(file, {
    maxSizeMB: 1.5, // Slightly larger to preserve text clarity
    maxWidthOrHeight: 2048, // Higher resolution for ID documents
    initialQuality: 0.9, // Higher quality for text readability
  });
}

/**
 * Optimizes selfie photos with standard compression
 *
 * @param file - The selfie photo file
 * @returns Compressed image file
 */
export async function optimizeSelfiePhoto(file: File): Promise<File> {
  return optimizeImage(file, {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    initialQuality: 0.85,
  });
}

/**
 * Batch optimize multiple images
 *
 * @param files - Array of image files to optimize
 * @param options - Optional compression settings
 * @returns Array of compressed image files
 */
export async function optimizeMultipleImages(
  files: File[],
  options?: Parameters<typeof optimizeImage>[1]
): Promise<File[]> {
  return Promise.all(files.map((file) => optimizeImage(file, options)));
}
