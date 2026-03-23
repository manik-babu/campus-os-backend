import { AdminProfile, FacultyProfile, Graduation, StudentProfile, User } from "../../../generated/prisma/client";
export type GraduationsWithoutId = Omit<Graduation, 'id' | 'createdAt' | 'updatedAt' | "facultyProfileId">[];
export type StudentProfileWithoutId = Omit<StudentProfile, 'id' | 'createdAt' | 'updatedAt' | 'userId'>;
export type FacultyProfileWithoutId = Omit<FacultyProfile, 'id' | 'createdAt' | 'updatedAt' | 'userId'>;
export type FacultyProfileWithGraduations = FacultyProfileWithoutId & { graduations: GraduationsWithoutId };
export type AdminProfileWithoutId = Omit<AdminProfile, 'id' | 'createdAt' | 'updatedAt' | 'userId'>;
export interface IRegistration {
    userData: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'idNo' | 'registrationNo'>;
    profileData: StudentProfileWithoutId | FacultyProfileWithGraduations | AdminProfileWithoutId;
}
export interface IAdmissionForm {
    userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
    profileData: StudentProfileWithoutId;
}

export interface ILogin {
    idNo: string;
    password: string;
}