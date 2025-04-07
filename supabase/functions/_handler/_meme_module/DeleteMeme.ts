import { deleteMemeQuery } from "@repository/_meme_repo/MemeRepository.ts";
import { SuccessResponse } from "@response/Response.ts";
import { HTTP_STATUS_CODE } from "@shared/_constants/HttpStatusCodes.ts";
import { V4 } from "@V4";
import { MEME_ERROR_MESSAGES, MEME_SUCCESS_MESSAGES } from "@shared/_messages/Meme_Module_Messages.ts";
import Logger from "@shared/Logger/logger.ts";
import { throwException } from "@shared/ExceptionHandling/ThrowException.ts";
import GlobalExceptionHandler from "@shared/ExceptionHandling/GlobalExceptionHandler.ts";



/**
 * Handles the deletion of a meme by its ID.
 * 
 * This function:
 * - Validates the provided meme ID.
 * - Calls the deleteMemeQuery function to delete the meme from the database.
 * - Returns a success response with the appropriate message.
 **/
async function DeletememebyID(_req: Request,params: Record<string, string>,deleteMemeQueryFn = deleteMemeQuery ): Promise<Response> {
    const logger = Logger.getInstance();

    const meme_id = V4.isValid(params.id) ? params.id : throwException(HTTP_STATUS_CODE.BAD_REQUEST, MEME_ERROR_MESSAGES.MISSING_MEMEID);

    // Call the function (mocked in tests, real in production)
    await deleteMemeQueryFn(meme_id, params.user_id, params.user_type);

    logger.info(`Meme deleted successfully: meme_id=${meme_id}`);
    return  SuccessResponse(HTTP_STATUS_CODE.OK, MEME_SUCCESS_MESSAGES.MEME_DELETED_SUCCESSFULLY);
}
export default GlobalExceptionHandler.handle(DeletememebyID);


