import { apiClient } from "./apiClient";

export interface UserInfo {
    userId: string;
    username: string;
    name: string;
    surname: string;
    email: string;
    fullName: string;
}

export interface NoParkingSpots{
    message: string;
    parkingSpots: [];
}

export interface ParkingSpot {
    id: string;
    name: string;
    isAvailable: boolean;
    availableFrom?: string | null;
    availableTo?: string | null;
}

export interface District {
    id: string;
    name: string;
}

export const getUserInfo = async (): Promise<UserInfo> => {
    const response = await apiClient.get<UserInfo>(`/dashboard/user-info`);
    return response.data;
};

export const getParkingSpots = async (): Promise<ParkingSpot[] | NoParkingSpots> => {
    const response = await apiClient.get<ParkingSpot[]>(`/dashboard/parking-spots`);
    return response.data;
};

export const getMyReservations = async () => {
    const response = await apiClient.get(`/dashboard/my-reservations`);
    return response.data;
}

export const getReservationHistory = async () => {
    const response = await apiClient.get(`/dashboard/reservation-history`);
    return response.data;
}

export const getParkingSpotsByDistrict = async (districtId: string): Promise<ParkingSpot[]> => {
    const response = await apiClient.get<ParkingSpot[]>(`/dashboard/parking-spots-by-district/${districtId}`);
    return response.data;
}

export const getDistricts = async (): Promise<District[]> => {
    const response = await apiClient.get<District[]>(`/dashboard/districts`);
    return response.data;
}