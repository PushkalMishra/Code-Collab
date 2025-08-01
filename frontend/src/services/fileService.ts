import axios from 'axios';

// const API_URL = 'http://localhost:3002/api/files';
const API_URL = '/api/files';
// Add a response interceptor
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid, clear user session and reload
      console.error("Authentication error: Token expired or invalid.");
      localStorage.removeItem('user'); // Assuming user session is stored here
      window.location.reload(); // Force a reload to redirect to login
    }
    return Promise.reject(error);
  }
);

export interface File {
  _id: string;
  name: string;
  content: string;
  language: string;
  owner: {
    _id: string;
    username: string;
  };
  roomId: string;
  sharedWith: Array<{
    _id: string;
    username: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export const fileService = {
  async createFile(name: string, content: string, language: string, roomId: string, token: string): Promise<File> {
    const response = await axios.post(API_URL, {
      name,
      content,
      language,
      roomId
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data as File;
  },

  async getRoomFiles(roomId: string, token: string): Promise<File[]> {
    const response = await axios.get(`${API_URL}/room/${roomId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data as File[];
  },

  async getMyFiles(token: string): Promise<File[]> {
    const response = await axios.get(`${API_URL}/my-files`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data as File[];
  },

  async updateFile(fileId: string, updates: Partial<File>, token: string): Promise<File> {
    const response = await axios.patch(`${API_URL}/${fileId}`, updates, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data as File;
  },

  async shareFile(fileId: string, userIds: string[], token: string): Promise<File> {
    const response = await axios.post(`${API_URL}/${fileId}/share`, { userIds }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data as File;
  },

  async deleteFile(fileId: string, token: string): Promise<void> {
    await axios.delete(`${API_URL}/${fileId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
}; 