export interface IGetCourseOfferings {
    search?: string;
    batchId?: string;
    page?: string;
}
export interface IStudentAdmitCardData {
    idNo: string;
    registrationNo: string;
    name: string;
    department: string;
    program: string;
    batch: number;
    exam: string;
    date: string;
    semester: string;
    courses: Course[];
}

export interface Course {
    code: string;
    title: string;
    credits: number;
}
