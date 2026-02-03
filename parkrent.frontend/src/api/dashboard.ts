import axios from 'axios';

const API_URL = 'https://localhost:8081/api';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

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
    const response = await axios.get<UserInfo>(`${API_URL}/dashboard/user-info`, getAuthHeader());
    return response.data;
};

export const getParkingSpots = async (): Promise<ParkingSpot[] | NoParkingSpots> => {
    const response = await axios.get<ParkingSpot[]>(`${API_URL}/dashboard/parking-spots`, getAuthHeader());
    return response.data;
};

export const getMyReservations = async () => {
    const response = await axios.get(`${API_URL}/dashboard/my-reservations`, getAuthHeader());
    return response.data;
}

export const getReservationHistory = async () => {
    const response = await axios.get(`${API_URL}/dashboard/reservation-history`, getAuthHeader());
    return response.data;
}