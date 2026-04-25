import { AdminProfile, FacultyProfile, StudentProfile, User } from "../../../generated/prisma/client";


export type StudentProfileWithoutId = Omit<StudentProfile, 'id' | 'createdAt' | 'updatedAt' | 'userId'> & { image: string };
export type FacultyProfileWithoutId = Omit<FacultyProfile, 'id' | 'createdAt' | 'updatedAt' | 'userId'>;
export type FacultyProfileWithGraduations = FacultyProfileWithoutId;
export type AdminProfileWithoutId = Omit<AdminProfile, 'id' | 'createdAt' | 'updatedAt' | 'userId'>;
export interface IRegistration {
    userData: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'idNo' | 'registrationNo' | 'image'>;
    profileData: StudentProfileWithoutId | FacultyProfileWithGraduations | AdminProfileWithoutId;
    uploadedImage: IUploadedImage | null;
}

export interface ILogin {
    idNo: string;
    password: string;
}
export interface IUploadedImage {
    public_id: string;
    secure_url: string;
}