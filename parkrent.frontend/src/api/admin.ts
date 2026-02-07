import { apiClient } from "./apiClient";

export interface AdminUser{
    adminId: string;
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

export const getUsers = async (): Promise<AdminUser[]> => {
    const response = await apiClient.get<AdminUser[]>(`/admin/users`);
    return response.data;
}

export const assignUserToDistrict = async (userId: string, districtId: string) => {
    const response = await apiClient.put(`/admin/assign-district/${userId}`, { districtId });
    return response.data;
};

export const changeUserRole = async (userId: string, newRole: string) => {
    const response = await apiClient.put(`/admin/change-role/${userId}/${newRole}`, {});
    return response.data;
}

export const getDistricts = async (): Promise<District[]> => {
    const response = await apiClient.get<District[]>(`/admin/districts`);
    return response.data;
}

export const getParkingSpots = async (): Promise<AdminParkingSpot[]> => {
    const response = await apiClient.get<AdminParkingSpot[]>(`/admin/parking-spots`);
    return response.data;
}

export const createParkingSpot = async (name: string, districtId: string) => {
    const response = await apiClient.post(`/admin/parking-spots`, { name, districtId, ownerId: null, isAvailable: true });
    return response.data;
}

export const assignParkingSpotToUser = async (parkingSpotId: string, userId: string) => {
    const response = await apiClient.put(`/admin/assign-parking-spot/${parkingSpotId}`, { userId });
    return response.data;
}

export const deleteParkingSpot = async (parkingSpotId: string) => {
    const response = await apiClient.delete(`/admin/parking-spots/${parkingSpotId}`);
    return response.data;
}