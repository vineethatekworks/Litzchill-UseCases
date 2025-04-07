import {  insertLikeQuery } from "@repository/_like_repo/LikeQueries.ts";
import { SuccessResponse } from "@response/Response.ts";
import { HTTP_STATUS_CODE } from "@shared/_constants/HttpStatusCodes.ts";
import { LIKE_SUCCESS } from '@shared/_messages/LikeMessage.ts';
import { meme_exists } from "@repository/_meme_repo/MemeRepository.ts";
import { MEME_ERROR_MESSAGES } from "@shared/_messages/Meme_Module_Messages.ts";
import { V4 } from "@V4";
import GlobalExceptionHandler from "@shared/ExceptionHandling/GlobalExceptionHandler.ts";
import { throwException } from "@shared/ExceptionHandling/ThrowException.ts";


/**
 * Handler to like a meme. This handler first checks if the meme exists, if yes, then it inserts a new like record.
 * 
 * @param _req - The HTTP request object.
 * @param params - The URL parameters, including the user ID and meme ID.
 * @param CheckMemeExists - Optional parameter to override the default check meme exists function.
 * @param likememeQuery - Optional parameter to override the default like meme query function.
 * @returns {Promise<Response>} - The response indicating the success or failure of the operation.
 * 
 * @throws {Error} - If the meme is not found, or there is an issue inserting the like or updating the like count.
 */

async function likememe(_req: Request, params: Record<string, string>,CheckMemeExists = meme_exists, likememeQuery = insertLikeQuery) {

    const meme_id = V4.isValid(params.id) ? params.id : throwException(HTTP_STATUS_CODE.BAD_REQUEST, MEME_ERROR_MESSAGES.MISSING_MEMEID);
    
    //Step 1: Check if meme exists
    await CheckMemeExists(meme_id);
    
    // Step 2: Insert a new like record
    const likeable_type = "meme";
    await likememeQuery(meme_id, params.user_id, likeable_type);
    return SuccessResponse(HTTP_STATUS_CODE.OK, LIKE_SUCCESS.LIKED_SUCCESSFULLY);
}
export default GlobalExceptionHandler.handle(likememe);

