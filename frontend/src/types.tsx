type AppointmentType = {
    id: number,
    type: string,
    name: string,
    city: string,
    cap: string,
    address: string,
    date: string,
    time: string,
    doctor?: string,
    distance?: string,
};

type PrescriptionType = {
    id: number,
    type: string,
    doctor: string,
};

type AccountType = {
    name: string,
    surname: string,
    city: string,
    comune: string,
    cap: string,
};

export type {
    AppointmentType,
    PrescriptionType,
    AccountType,
};