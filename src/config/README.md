# API Configuration with Axios

This directory contains the API configuration for the Sports360 Admin application using Axios with interceptors.

## Features

### 🔧 **Axios Configuration**
- **Base URL**: Configurable via environment variables
- **Timeout**: 10 seconds default
- **Headers**: Automatic JSON content-type
- **Interceptors**: Request/Response handling

### 🔐 **Authentication Interceptors**
- **Request Interceptor**: Automatically adds Bearer token to requests
- **Response Interceptor**: Handles 401 errors with automatic token refresh
- **Token Management**: Automatic token storage and retrieval

### 📝 **Request/Response Logging**
- **Development Mode**: Detailed logging of all API calls
- **Error Logging**: Comprehensive error information
- **Request/Response Data**: Full payload logging in dev mode

## Usage

### Basic API Calls
```typescript
import apiClient from '@/config/api';
import { API_CONFIG } from '@/config/api';

// GET request
const users = await apiClient.get('/users');

// POST request
const newUser = await apiClient.post('/users', { name: 'John' });

// PUT request
const updatedUser = await apiClient.put('/users/1', { name: 'Jane' });

// DELETE request
await apiClient.delete('/users/1');
```

### Using the Generic API Service
```typescript
import ApiService from '@/services/api.service';

// GET request
const users = await ApiService.get<User[]>('/users');

// POST request
const newUser = await ApiService.post<User>('/users', { name: 'John' });

// File upload with progress
const result = await ApiService.uploadFile<UploadResponse>(
  '/upload',
  file,
  (progress) => console.log(`Upload progress: ${progress}%`)
);
```

### Authentication Service
```typescript
import { authService } from '@/services/auth.service';

// Login
const response = await authService.login({
  identifier: 'user@example.com',
  password: 'password123'
});

// Get current user
const user = await authService.getCurrentUser();

// Logout
authService.logout();
```

## Environment Configuration

Create a `.env` file in the project root:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api
```

## API Endpoints

The configuration includes predefined endpoints:

```typescript
export const API_CONFIG = {
  ENDPOINTS: {
    ADMIN_LOGIN: '/admin-auth/admin-login',
    ADMIN_REFRESH_TOKEN: '/admin-auth/admin-refresh-token',
    ADMIN_ME: '/admin-auth/me',
  },
};
```

## Error Handling

### Automatic Token Refresh
- When a 401 error occurs, the interceptor automatically attempts to refresh the token
- If refresh succeeds, the original request is retried
- If refresh fails, user is redirected to login page

### Error Logging
- All errors are logged to console in development mode
- Error responses include status codes and response data
- Network errors are properly handled and logged

## TypeScript Support

Full TypeScript support with proper type definitions:

```typescript
// Response types
interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  profile: {
    id: string;
    userName: string;
    email: string | null;
    userType: string;
    userTypeId: number | null;
  };
}

// Request types
interface LoginRequest {
  identifier: string;
  password: string;
}
```

## Best Practices

1. **Always use the configured apiClient** instead of raw axios
2. **Handle errors appropriately** in your components
3. **Use TypeScript interfaces** for request/response types
4. **Leverage the generic ApiService** for common operations
5. **Test error scenarios** including network failures and 401 responses

## Development vs Production

- **Development**: Full request/response logging enabled
- **Production**: Minimal logging, optimized for performance
- **Environment Variables**: Use VITE_ prefix for client-side variables
