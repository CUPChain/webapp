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
    // location: location, // Location
    date: string, // Date of appointment
    time: string, // Time of appointment
    doctor?: string, // Doctor name (optional)
    distance?: string, // Distance from user (optional)
    id_hospital: number
};

type PrescriptionType = {
    id: number,
    type: string, // Neurologist, Cardiologist, etc.
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