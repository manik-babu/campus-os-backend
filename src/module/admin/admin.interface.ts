export interface IEnrollBatchStudentsPayload {
    id: string;
    course: {
        credits: number;
        title: string;
    }
    creditFees: string;
    batchId: string;
    semesterId: string;
    departmentId: string;
}
export interface EnrolledStudent {
    idNo: string;
    name: string;
    enrolled: boolean;
}
export interface IStudent {
    id: string;
    idNo: string;
    name: string;
}

export interface getAdmissionFormsFilterQuery {
    search: string;
    sortBy: "asc" | "desc";
    limit: number;
    page: number;
}