type location = {
    latitude: number,
    longitude: number,
};

type AppointmentType = {
    id: number,
    code_medical_examination: number,
    type: string, // Neurologist, Cardiologist, etc.
    name: string, // Hospital name
    city: string, // City
    cap: string, // CAP
    address: string, // Street address
    // location: location, // Location
    date: Date, // Date of appointment
    distance?: string, // Distance from user (optional)
    id_hospital: number,
    id_prescription: number,
    latitude: number,
    longitude: number,
    valid: boolean
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