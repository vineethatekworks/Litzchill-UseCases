import { ErrorResponse, SuccessResponse } from "@response/Response.ts";
import { HTTP_STATUS_CODE } from "@shared/_constants/HttpStatusCodes.ts";
import { COMMON_ERROR_MESSAGES } from "@shared/_messages/ErrorMessages.ts";
import { V4 } from "@V4";
import { MEME_ERROR_MESSAGES, MEME_SUCCESS_MESSAGES } from "@shared/_messages/Meme_Module_Messages.ts";
import Logger from "@shared/Logger/logger.ts";
import { deleteMemeQuery } from "@repository/_meme_repo/MemeRepository.ts";

export default async function DeletememebyID(_req: Request,params: Record<string, string>,deleteMemeQueryFn = deleteMemeQuery) {
    const logger = Logger.getInstance();  
    try {
        const meme_id = params.id;
        const user_id = params.user_id;
        const user_type = params.user_type;

        if (!meme_id || !V4.isValid(meme_id)) return ErrorResponse(HTTP_STATUS_CODE.BAD_REQUEST, MEME_ERROR_MESSAGES.MISSING_MEMEID);

        // Call the function (mocked in tests, real in production)
        const { error } = await deleteMemeQueryFn(meme_id, user_id, user_type);

        if (error) return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,MEME_ERROR_MESSAGES.FAILED_TO_DELETE);
        return SuccessResponse(HTTP_STATUS_CODE.OK,MEME_SUCCESS_MESSAGES.MEME_DELETED_SUCCESSFULLY);

    } catch (error) {
        logger.error(`Internal Server Error while deleting meme. Details: ${error}`);
        return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
}
