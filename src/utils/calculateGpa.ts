export interface IMarks {
    classTest1?: string;
    classTest2?: string;
    midterm?: string;
    final?: string;
    attendance?: string;
}

export const calculateGpa = (marks: number): { points: number, grade: string } => {
    if (marks >= 80 && marks <= 100) {
        return { points: 4.00, grade: 'A+' };
    } else if (marks >= 75 && marks <= 79) {
        return { points: 3.75, grade: 'A' };
    } else if (marks >= 70 && marks <= 74) {
        return { points: 3.50, grade: 'A-' };
    } else if (marks >= 65 && marks <= 69) {
        return { points: 3.25, grade: 'B+' };
    } else if (marks >= 60 && marks <= 64) {
        return { points: 3.00, grade: 'B' };
    } else if (marks >= 55 && marks <= 59) {
        return { points: 2.75, grade: 'B-' };
    } else if (marks >= 50 && marks <= 54) {
        return { points: 2.50, grade: 'C+' };
    } else if (marks >= 45 && marks <= 49) {
        return { points: 2.25, grade: 'C' };
    } else if (marks >= 40 && marks <= 44) {
        return { points: 2.00, grade: 'D' };
    } else {
        return { points: 0, grade: 'F' };
    }
}

/**
 80-100	A+	4.00 (A plus)
75-79	A	3.75 (A regular)
70-74	A-	3.50 (A minus)
65-69	B+	3.25 (B plus)
60-64	B	3.00 (B regular)
55-59	B-	2.75 (B minus)
50-54	C+	2.50 ( C plus)
45-49	C	2.25 ( C regular)
40-44	D	2.00
00-39	F	00
 */