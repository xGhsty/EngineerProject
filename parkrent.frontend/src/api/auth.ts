import axios from 'axios';

const API_URL = 'https://localhost:8081/api';

export async function login(email: string, password: string){
    const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
    });
    return response.data;
}

export const register = async (emails: string, password: string, name: string, surname: string, confirmPassword: string) => {
    const response = await axios.post(`${API_URL}/auth/register`, {
        email: emails,
        password,
        name,
        surname,
        confirmPassword
    });
    return response.data;
}
