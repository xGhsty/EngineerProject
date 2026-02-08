import {apiClient} from "./apiClient";

export interface MyParkingSpot{
    id: string;
    name: string;
    isAvailable: boolean;
    districtName: string;
    availableFrom?: string | null;
    availableTo?: string | null;
    currentReservation?:{
        reservationId: string;
        userName: string;
        startTime: string;
        endTime: string;
    };
    incomingReservations: Array<{
        reservationId: string;
        userName: string;
        startTime: string;
        endTime: string;
    }>;
}

export interface MyReservation{
    reservationId: string;
    parkingSpotName: string;
    districtName: string;
    startTime: string;
    endTime: string;
    canCancel: boolean;
}

export const getMyParkingSpots = async (): Promise<MyParkingSpot[]> => {
    const response = await apiClient.get<MyParkingSpot[]>(`/userparking/my-parking-spots`);
    return response.data;
}

export const toggleParkingSpotAvailability = async (parkingSpotId: string) =>{
    const response = await apiClient.put(`/userparking/toggle-availability/${parkingSpotId}`, {});
    return response.data;
}

export const getMyReservations = async (): Promise<MyReservation[]> => {
    const response = await apiClient.get<MyReservation[]>('/userparking/my-reservations');
    return response.data;
};

export const setAvailabilityHours = async (parkingSpotId: string, availableFrom: string, availableTo: string) => {
    const response = await apiClient.put(`/userparking/set-availability-hours/${parkingSpotId}`, {
        availableFrom: availableFrom || null,
        availableTo: availableTo || null
    });
    return response.data;
};