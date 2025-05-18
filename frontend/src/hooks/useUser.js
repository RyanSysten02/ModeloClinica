import { jwtDecode } from 'jwt-decode';

export default function useUser() {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    return decoded;
  } catch {
    return null;
  }
}
