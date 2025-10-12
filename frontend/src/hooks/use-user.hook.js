import { jwtDecode } from 'jwt-decode';

export const useUser = () => {
  const token = localStorage.getItem('token');

  if (!token) return null;

  const decodedToken = jwtDecode(token);

  return decodedToken;
};
