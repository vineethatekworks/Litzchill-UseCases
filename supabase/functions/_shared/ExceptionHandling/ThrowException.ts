import { CustomException } from "@shared/ExceptionHandling/CustomException.ts";

export function throwException(statusCode: number, message: string): never {
    throw new CustomException(statusCode, message);
}