import { apiClient } from './apiClient';

export const getDarkMode = async (): Promise<boolean> => {
    const response = await apiClient.get<{ darkMode: boolean }>('/usersettings/dark-mode');
    return response.data.darkMode;
};

export const setDarkMode = async (darkMode: boolean): Promise<void> => {
    await apiClient.put('/usersettings/dark-mode', { darkMode });
};

export const updateUsername = async (username: string): Promise<void> => {
    await apiClient.put('/usersettings/update-username', { username });
};

export const changePassword = async (currentPassword: string, newPassword: string, confirmNewPassword: string): Promise<void> => {
    await apiClient.put('/usersettings/change-password', { currentPassword, newPassword, confirmNewPassword });
};
