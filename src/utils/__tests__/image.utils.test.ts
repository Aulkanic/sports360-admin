import { getImageUrl, getImagePreview } from '../image.utils';

// Mock the API_CONFIG
jest.mock('@/config/api', () => ({
  API_CONFIG: {
    BASE_URL: 'http://localhost:5000/api'
  }
}));

describe('Image Utils', () => {
  describe('getImageUrl', () => {
    it('should return the URL as-is if it already includes http/https', () => {
      const fullUrl = 'https://example.com/image.jpg';
      expect(getImageUrl(fullUrl)).toBe(fullUrl);
    });

    it('should combine base URL with API path for /api/ paths', () => {
      const apiPath = '/api/courts/images/filename.jpg';
      const result = getImageUrl(apiPath);
      expect(result).toBe('http://localhost:5000/api/courts/images/filename.jpg');
    });

    it('should handle just filenames by adding the court images path', () => {
      const filename = 'filename.jpg';
      const result = getImageUrl(filename);
      expect(result).toBe('http://localhost:5000/api/courts/images/filename.jpg');
    });

    it('should handle other paths correctly', () => {
      const path = '/some/other/path.jpg';
      const result = getImageUrl(path);
      expect(result).toBe('http://localhost:5000/some/other/path.jpg');
    });
  });

  describe('getImagePreview', () => {
    it('should return the result of getImageUrl for string inputs', () => {
      const imagePath = '/api/courts/images/test.jpg';
      const result = getImagePreview(imagePath);
      expect(result).toBe('http://localhost:5000/api/courts/images/test.jpg');
    });

    it('should return object URL for File inputs', () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const result = getImagePreview(file);
      expect(result).toMatch(/^blob:/);
    });
  });
});
