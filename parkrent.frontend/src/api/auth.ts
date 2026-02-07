import { apiClient } from "./apiClient";

export async function login(email: string, password: string){
    const response = await apiClient.post(`/auth/login`, {
        email,
        password
    });
    return response.data;
}

export const register = async (emails: string, password: string, name: string, surname: string, username: string, confirmPassword: string) => {
    const response = await apiClient.post(`/auth/register`, {
        Email: emails,
        Password: password,
        Name: name,
        Surname: surname,
        Username: username || null,
        ConfirmPassword: confirmPassword
    });
    return response.data;
}
