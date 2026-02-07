import { apiClient } from "./apiClient";

export interface AdminUser{
    superAdminId: string;
    name: string;
    surname: string;
    username: string;
    email: string;
    districtId: string | null;
    districtName: string | null;
    role: string;
}

export interface District {
    districtId: string;
    name: string;
}

export interface AdminParkingSpot {
    id: string;
    name: string;
    districtId: string;
    districtName: string;
    ownerId: string | null;
    ownerName: string | null;
    isAvailable: boolean;
}

export const getAllUsers = async (): Promise<AdminUser[]> => {
    const response = await apiClient.get<AdminUser[]>(`/superadmin/users`);
    return response.data;
}

export const assignUserToDistrict = async (userId: string, districtId: string) => {
    const response = await apiClient.put(`/superadmin/assign-district/${userId}`, { districtId });
    return response.data;
}

export const changeUserRole = async (userId: string, newRole: string) => {
    const response = await apiClient.put(`/superadmin/change-role/${userId}/${newRole}`, {});
    return response.data;
}

export const createAdmin = async (data : {email: string, password: string, name: string, surname: string, username: string, confirmPassword: string}) => {
    const response = await apiClient.post(`/superadmin/create-admin`, data);
    return response.data;
}

export const getDistricts = async (): Promise<District[]> => {
    const response = await apiClient.get<District[]>(`/superadmin/districts`);
    return response.data;
}

export const createDistrict = async (name: string) => {
    const response = await apiClient.post(`/superadmin/districts`, { name });
    return response.data;
}

export const getAllParkingSpots = async (): Promise<AdminParkingSpot[]> => {
    const response = await apiClient.get<AdminParkingSpot[]>(`/superadmin/parking-spots`);
    return response.data;
}

export const createParkingSpot = async (name: string, districtId: string) => {
    const response = await apiClient.post(`/superadmin/parking-spots`, { name, districtId, ownerId: null, isAvailable: true });
    return response.data;
}

export const assignParkingSpotToUser = async (parkingSpotId: string, userId: string) => {
    const response = await apiClient.put(`/superadmin/assign-parking-spot/${parkingSpotId}`, { userId });
    return response.data;
}

export const deleteParkingSpot = async (parkingSpotId: string) => {
    const response = await apiClient.delete(`/superadmin/parking-spots/${parkingSpotId}`);
    return response.data;
}