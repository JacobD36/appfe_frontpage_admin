export interface LoginResponse {
    code:    number;
    status:  string;
    message: string;
    data:    Data;
    token:   string;
}

export interface Data {
    id:             string;
    name:           string;
    email:          string;
    role:           string;
    status:         boolean;
    connectionStatus?: string;
    google:         boolean;
    emailValidated: boolean;
}
