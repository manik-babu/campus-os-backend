/**
 model AdmissionForm {
    id               String     @id @default(uuid())
    programId        String
    program          Program    @relation(fields: [programId], references: [id])
    departmentId     String
    department       Department @relation(fields: [departmentId], references: [id])
    name             String
    image            String
    email            String
    fatherName       String
    motherName       String
    birthDate        DateTime
    permanentAddress String
    presentAddress   String
    phoneNumber      String
    schoolName       String
    collegeName      String
    sscGpa           Decimal    @db.Decimal(3, 2)
    hscGpa           Decimal    @db.Decimal(3, 2)
    sscPassingYear   Int
    hscPassingYear   Int
    bloodGroup       String?
    createdAt        DateTime   @default(now())
    updatedAt        DateTime   @updatedAt

    @@map("admission_forms")
}

 */
import * as z from "zod";
export const AdmissionFormZodSchema = z.object({
    programId: z.string(),
    departmentId: z.string(),
    name: z.string(),
    email: z.email(),
    fatherName: z.string(),
    motherName: z.string(),
    birthDate: z.string().refine(date => !isNaN(Date.parse(date)), {
        message: "Invalid date format. Expected a valid date string.",
    }), // We will parse this to Date in the service layer
    permanentAddress: z.string(),
    presentAddress: z.string(),
    phoneNumber: z.string(),
    schoolName: z.string(),
    collegeName: z.string(),
    sscGpa: z.number().refine(value => value >= 0 && value <= 5, { message: "SSC GPA must be between 0 and 5" }),
    hscGpa: z.number().refine(value => value >= 0 && value <= 5, { message: "HSC GPA must be between 0 and 5" }),
    sscPassingYear: z.number().int().refine(value => value >= 1900 && value <= new Date().getFullYear(), { message: "Invalid SSC passing year" }),
    hscPassingYear: z.number().int().refine(value => value >= 1900 && value <= new Date().getFullYear(), { message: "Invalid HSC passing year" }),
    bloodGroup: z.string().nullable()
})