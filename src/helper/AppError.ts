class AppError extends Error {
    public statusCode: number;
    constructor(statusCode: number, message: string, ...args: any) {
        super(message, ...args);
        this.statusCode = statusCode;
    }
}

export default AppError;