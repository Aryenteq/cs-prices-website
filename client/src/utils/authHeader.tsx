import Cookies from 'js-cookie';

export const getAuthHeader = () => {
  const token = Cookies.get('token');
  if (!token) {
    return {} as Record<string, string>;
  }
  return { Authorization: `Bearer ${token}` };
};
