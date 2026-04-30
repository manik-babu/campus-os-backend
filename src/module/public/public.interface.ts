import { AdmissionUserGender } from "../../../generated/prisma/enums";

export type TAdmissionForm = {
    programId: string;
    departmentId: string;
    name: string;
    email: string;
    fatherName: string;
    motherName: string;
    birthDate: string; // We will parse this to Date in the service layer
    permanentAddress: string;
    presentAddress: string;
    phoneNumber: string;
    schoolName: string;
    collegeName: string;
    sscGpa: number;
    hscGpa: number;
    sscPassingYear: number;
    hscPassingYear: number;
    bloodGroup?: string | null;
    gender: AdmissionUserGender;
}

export interface IUploadedImage {
    secure_url: string;
    public_id: string;
}