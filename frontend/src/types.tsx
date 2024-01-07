type location = {
    latitude: number,
    longitude: number,
};

type AppointmentType = {
    id: number,
    type: string, // Neurologist, Cardiologist, etc.
    name: string, // Hospital name
    city: string, // City
    cap: string, // CAP
    address: string, // Street address
    // lat: number, // Latitude
    // lon: number, // Longitude
    date: string, // Date of appointment
    time: string, // Time of appointment
    doctor?: string, // Doctor name (optional)
    distance?: string, // Distance from user (optional)
};

type PrescriptionType = {
    id: number,
    type: string, // Neurologist, Cardiologist, etc.
    doctor: string, // Doctor name
};

type AccountType = {
    name: string,
    surname: string,
    address: string, // Street address
    city: string, // City
    cap: string, // CAP
};

export type {
    AppointmentType,
    PrescriptionType,
    AccountType,
};