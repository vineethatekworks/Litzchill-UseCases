import { updateMemeStatusQuery } from "@repository/_meme_repo/MemeRepository.ts";
import {SuccessResponse } from "@response/Response.ts";
import { HTTP_STATUS_CODE } from "@shared/_constants/HttpStatusCodes.ts";
import { MEME_ERROR_MESSAGES, MEME_SUCCESS_MESSAGES } from "@shared/_messages/Meme_Module_Messages.ts";
import { COMMON_ERROR_MESSAGES } from "@shared/_messages/ErrorMessages.ts";
import { MEMEFIELDS } from "@shared/_db_table_details/MemeTableFields.ts";
import { MEME_STATUS } from "@shared/_constants/Types.ts";
import { throwException } from "@shared/ExceptionHandling/ThrowException.ts";
import { V4 } from "@V4";
import GlobalExceptionHandler from "@shared/ExceptionHandling/GlobalExceptionHandler.ts";

 async function updateMemeStatus(req: Request, params: Record<string, string>, updateMemeStatusQueryFn = updateMemeStatusQuery) {

    const meme_id = V4.isValid(params.id) ? params.id : throwException(HTTP_STATUS_CODE.BAD_REQUEST, MEME_ERROR_MESSAGES.MISSING_MEMEID);
    const user_id = params.user_id;

    const body = await req.json();
    const meme_status = body[MEMEFIELDS.MEME_STATUS];
    !meme_status && throwException(HTTP_STATUS_CODE.BAD_REQUEST, MEME_ERROR_MESSAGES.MISSING_STATUS_VALUE)

    // Validate `meme_status`
    const validStatuses = [MEME_STATUS.APPROVED, MEME_STATUS.REJECTED];
    !validStatuses.includes(meme_status) && throwException(HTTP_STATUS_CODE.BAD_REQUEST, COMMON_ERROR_MESSAGES.INVALID_DATA);

    // Update meme status
    await updateMemeStatusQueryFn(meme_id, meme_status, user_id);
    return SuccessResponse(HTTP_STATUS_CODE.OK, MEME_SUCCESS_MESSAGES.MEME_STATUS_UPDATED_SUCCESSFULLY);
}
export default GlobalExceptionHandler.handle(updateMemeStatus);


