import * as z from "zod";
const zodParse = (schema: z.ZodObject, data: unknown) => {
    const parsedData = schema.safeParse(data);
    if (!parsedData.success) {
        throw parsedData.error;
    }
    return parsedData.data;
}

export default zodParse;