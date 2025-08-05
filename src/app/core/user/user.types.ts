export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
    status?: boolean;
    connectionStatus?: string;
    google?: boolean;
    emailValidated?: boolean;
}
