import {apiClient} from './apiClient';

export interface ReservationRequest {
    parkingSpotId: string;
    startTime: string;
    endTime: string;
}

export async function createReservation(request: ReservationRequest) {
    const response = await apiClient.post('/reservation/create', {
        parkingSpotId: request.parkingSpotId,
        startTime: request.startTime,
        endTime: request.endTime
    });
    return response.data;
}

export async function cancelReservation(reservationId: string) {
    const response = await apiClient.delete(`/reservation/${reservationId}`);
    return response.data;
}
