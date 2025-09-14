import { API_CONFIG } from '@/config/api';

/**
 * Get the complete image URL by combining the backend base URL with the image path
 * @param imagePath - The image path from the API (e.g., "/api/courts/images/filename.jpg")
 * @returns Complete URL for the image
 */
export const getImageUrl = (imagePath: string): string => {
  // If the image path already includes the full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If the image path starts with '/api/', it's already a complete API path
  if (imagePath.startsWith('/api/')) {
    // Extract the base URL without '/api' and combine with the image path
    const baseUrl = API_CONFIG.IMG_URL;
    return `${baseUrl}${imagePath}`;
  }
  
  // If it's just a filename, assume it's a court image
  if (!imagePath.startsWith('/')) {
    return `${API_CONFIG.IMG_URL}/api/courts/images/${imagePath}`;
  }
  
  // For other cases, combine with base URL
  const baseUrl = API_CONFIG.IMG_URL;
  return `${baseUrl}${imagePath}`;
};

/**
 * Get user profile image URL
 * @param user - User object with personalInfo.upload.filePath
 * @returns Complete URL for the user profile image or default avatar
 */
export const getUserProfileImageUrl = (user: any): string => {
  if (!user?.personalInfo?.upload?.filePath) {
    return '/default_avatar.png'; // Default avatar path
  }
  
  const imagePath = user.personalInfo.upload.filePath;
  
  // If the image path already includes the full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If the image path starts with '/', it's a relative path from the server root
  if (imagePath.startsWith('/')) {
    const baseUrl = API_CONFIG.IMG_URL;
    return `${baseUrl}${imagePath}`;
  }
  
  // If it's just a filename, assume it's in the uploads directory
  const baseUrl = API_CONFIG.IMG_URL;
  return `${baseUrl}/uploads/${imagePath}`;
};

/**
 * Get image preview URL for both File objects and string URLs
 * @param image - Either a File object or a string URL
 * @returns URL for displaying the image
 */
export const getImagePreview = (image: string | File): string => {
  if (typeof image === 'string') {
    return getImageUrl(image);
  } else {
    return URL.createObjectURL(image);
  }
};
