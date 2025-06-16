import apiClient from './client';
import axios from 'axios';

interface UploadResponse {
  secure_url: string;
  public_id: string;
}

// Helper function for retrying failed requests
const retryRequest = async <T>(
  requestFn: () => Promise<T>,
  retries = 2,
  delay = 1000
): Promise<T> => {
  try {
    return await requestFn();
  } catch (error) {
    if (retries <= 0) throw error;
    
    console.log(`Request failed, retrying in ${delay}ms... (${retries} retries left)`);
    await new Promise(resolve => setTimeout(resolve, delay));
    return retryRequest(requestFn, retries - 1, delay * 1.5);
  }
};

export const uploadApi = {
  /**
   * Upload an image directly from the frontend to Cloudinary via backend proxy
   * @param file - The file to upload
   * @param folder - The folder to upload to (seller, food, etc.)
   * @returns Promise with the upload response
   */
  uploadImage: async (file: File, folder: string = 'misc'): Promise<UploadResponse> => {
    try {
      // Create form data
      const formData = new FormData();
      formData.append('image', file);
      formData.append('folder', folder);
      
      // Use retry logic for the upload request
      const response = await retryRequest(() => 
        apiClient.post<UploadResponse>('/api/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 100)
            );
            console.log(`Upload progress: ${percentCompleted}%`);
          },
        })
      );
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
        console.error('Upload timeout. The image might be too large or the connection is slow.');
        throw new Error('Upload timeout. Please try with a smaller image or check your connection.');
      }
      console.error('Error uploading image:', error);
      throw error;
    }
  },
  
  /**
   * Upload an image from a URL
   * @param imageUrl - The URL of the image to upload
   * @param folder - The folder to upload to (seller, food, etc.)
   * @returns Promise with the upload response
   */
  uploadFromUrl: async (imageUrl: string, folder: string = 'misc'): Promise<UploadResponse> => {
    try {
      // Use retry logic for the upload request
      const response = await retryRequest(() => 
        apiClient.post<UploadResponse>('/api/upload/url', {
          imageUrl,
          folder,
        })
      );
      
      return response.data;
    } catch (error) {
      console.error('Error uploading image from URL:', error);
      throw error;
    }
  },
};

export default uploadApi; 