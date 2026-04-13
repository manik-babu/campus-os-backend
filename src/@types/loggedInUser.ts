export interface LoggedInUser {
    id: string;
    name: string;
    email: string;
    role: string;
    idNo: string;
    registrationNo: string;
    status: string;
    departmentId: string | null;
}