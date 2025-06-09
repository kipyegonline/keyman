const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
export const register = async (email: string, password: string) => {    
    
  const response = await fetch(`${BASE_URL}/api/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error('Registration failed');
  }

  const data = await response.json();
  return data;
}   
export const login = async (email: string, password: string) => {
  const response = await fetch(BASE_URL+'/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password,fcm_token:"" }),
  });

  if (!response.ok) {
    throw new Error('Login failed');
  }

  const data = await response.json();
  return data;
}