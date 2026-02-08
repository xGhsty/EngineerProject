import { apiClient } from "./apiClient";

export interface AdminUser{
    id: string;
    name: string;
    surname: string;
    username: string;
    email: string;
    districtId: string | null;
    districtName: string | null;
    role: string;
}

export interface District {
    id: string;
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

// Helper function to get the correct API prefix based on user role
const getAdminPrefix = () => {
    const role = localStorage.getItem('role');
    return role === 'SuperAdmin' ? '/SuperAdmin' : '/DistrictAdmin';
};

export const getUsers = async (): Promise<AdminUser[]> => {
    const prefix = getAdminPrefix();
    const response = await apiClient.get<AdminUser[]>(`${prefix}/users`);
    return response.data;
}

export const assignUserToDistrict = async (userId: string, districtId: string) => {
    const prefix = getAdminPrefix();
    // Konwertuj pusty string na Guid.Empty dla backendu
    const districtIdToSend = districtId === "" ? "00000000-0000-0000-0000-000000000000" : districtId;
    const response = await apiClient.put(`${prefix}/assign-district/${userId}`, { districtId: districtIdToSend });
    return response.data;
};

export const changeUserRole = async (userId: string, newRole: string) => {
    // Only SuperAdmin can change roles
    // Convert frontend role names to backend enum values
    const roleMapping: { [key: string]: string } = {
        'User': 'User',
        'DistrictAdmin': 'Admin',  // Backend uses 'Admin' instead of 'DistrictAdmin'
        'SuperAdmin': 'SuperAdmin'
    };

    const backendRole = roleMapping[newRole] || newRole;
    const response = await apiClient.put(`/SuperAdmin/change-role/${userId}`, { Role: backendRole });
    return response.data;
}

export const createDistrict = async (name: string) => {
    const response = await apiClient.post(`/SuperAdmin/districts`, { name });
    return response.data;
}

export const getDistricts = async (): Promise<District[]> => {
    const prefix = getAdminPrefix();
    const response = await apiClient.get<District[]>(`${prefix}/districts`);
    return response.data;
}

export const getParkingSpots = async (): Promise<AdminParkingSpot[]> => {
    const prefix = getAdminPrefix();
    const response = await apiClient.get<AdminParkingSpot[]>(`${prefix}/parking-spots`);
    return response.data;
}

export const createParkingSpot = async (name: string, districtId: string) => {
    const prefix = getAdminPrefix();
    const response = await apiClient.post(`${prefix}/parking-spots`, { name, districtId, ownerId: null, isAvailable: true });
    return response.data;
}

export const assignParkingSpotToUser = async (parkingSpotId: string, userId: string) => {
    const prefix = getAdminPrefix();
    // Konwertuj pusty string na Guid.Empty dla backendu
    const userIdToSend = userId === "" ? "00000000-0000-0000-0000-000000000000" : userId;
    const response = await apiClient.put(`${prefix}/assign-parking`, { parkingSpotId, userId: userIdToSend });
    return response.data;
}

export const deleteParkingSpot = async (parkingSpotId: string) => {
    const prefix = getAdminPrefix();
    const response = await apiClient.delete(`${prefix}/parking-spots/${parkingSpotId}`);
    return response.data;
}
