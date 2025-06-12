import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface User {
  id: string; // Changed from number to string to match MongoDB ObjectId
  name: string;
  email: string;
  age: number;
}

export interface Post {
  id: string; // Changed from number to string to match MongoDB ObjectId
  title: string;
  content: string;
  userId: string; // Changed from number to string to match MongoDB ObjectId
  createdAt: string;
  updatedAt?: string;
  user?: User;
}

export interface Analytics {
  totalUsers: number;
  totalPosts: number;
  averageUserAge: number;
  postsPerUser: Record<number, number>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// User API functions
export const userApi = {
  getAll: async (): Promise<User[]> => {
    const response = await api.get<ApiResponse<User[]>>('/users');
    return response.data.data || [];
  },

  getById: async (id: string): Promise<User | null> => {
    try {
      const response = await api.get<ApiResponse<User>>(`/users/${id}`);
      return response.data.data || null;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  create: async (userData: Omit<User, 'id'>): Promise<User> => {
    const response = await api.post<ApiResponse<User>>('/users', userData);
    if (!response.data.data) {
      throw new Error('Failed to create user');
    }
    return response.data.data;
  },

  update: async (id: string, userData: Partial<User>): Promise<User> => {
    const response = await api.put<ApiResponse<User>>(`/users/${id}`, userData);
    if (!response.data.data) {
      throw new Error('Failed to update user');
    }
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};

// Post API functions
export const postApi = {
  getAll: async (): Promise<Post[]> => {
    const response = await api.get<ApiResponse<Post[]>>('/posts');
    return response.data.data || [];
  },

  getById: async (id: string): Promise<Post | null> => {
    try {
      const response = await api.get<ApiResponse<Post>>(`/posts/${id}`);
      return response.data.data || null;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  create: async (postData: Omit<Post, 'id' | 'createdAt' | 'user'>): Promise<Post> => {
    console.log('API: Creating post with data:', postData);
    console.log('API: Using base URL:', API_BASE_URL);
    
    try {
      const response = await api.post<ApiResponse<Post>>('/posts', postData);
      console.log('API: Post creation response:', response.data);
      
      if (!response.data.data) {
        throw new Error('Failed to create post - no data in response');
      }
      return response.data.data;
    } catch (error: any) {
      console.error('API: Error creating post:', error);
      console.error('API: Error response:', error.response?.data);
      console.error('API: Error status:', error.response?.status);
      throw error;
    }
  },

  update: async (id: string, postData: { title: string; content: string }): Promise<Post> => {
    console.log('API: Updating post with id:', id, 'data:', postData);
    try {
      const response = await api.put<ApiResponse<Post>>(`/posts/${id}`, postData);
      console.log('API: Post update response:', response.data);
      
      if (!response.data.data) {
        throw new Error('Failed to update post - no data in response');
      }
      return response.data.data;
    } catch (error: any) {
      console.error('API: Error updating post:', error);
      console.error('API: Error response:', error.response?.data);
      console.error('API: Error status:', error.response?.status);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    console.log('API: Deleting post with id:', id);
    try {
      await api.delete(`/posts/${id}`);
      console.log('API: Post deleted successfully');
    } catch (error: any) {
      console.error('API: Error deleting post:', error);
      console.error('API: Error response:', error.response?.data);
      console.error('API: Error status:', error.response?.status);
      throw error;
    }
  },
};

// Analytics API functions
export const analyticsApi = {
  get: async (): Promise<Analytics> => {
    const response = await api.get<ApiResponse<Analytics>>('/analytics');
    return response.data.data || {
      totalUsers: 0,
      totalPosts: 0,
      averageUserAge: 0,
      postsPerUser: {}
    };
  },
};

// Health check
export const healthCheck = async (): Promise<boolean> => {
  try {
    await axios.get(`${API_BASE_URL.replace('/api', '')}/health`);
    return true;
  } catch {
    return false;
  }
};

export default api;
