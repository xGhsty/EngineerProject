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