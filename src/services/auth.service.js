import axios from 'axios';

class AuthService {
  async getAuthToken() {
    try {
      const { data } = await axios({
        method: 'get',
        url: ``,
        timeout: 10000,
        withCredentials: true,
      });
      return data;
    } catch (error) {
      return error;
    }
  }
}
export const authService = new AuthService();
