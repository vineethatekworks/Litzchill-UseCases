import { HTTP_STATUS_CODE } from "@shared/_constants/HttpStatusCodes.ts";
import { V4 } from "@V4";
import { MEME_ERROR_MESSAGES, MEME_SUCCESS_MESSAGES } from "@shared/_messages/Meme_Module_Messages.ts";
import { SuccessResponse } from "@response/Response.ts";
import { throwException } from "@shared/ExceptionHandling/ThrowException.ts";
import { getMemeByIdQuery } from "@repository/_meme_repo/MemeRepository.ts";

/**
 * Handles the retrieval of a meme by its ID.
 * 
 * @param {Request} _req - The HTTP request object.
 * @param {Record<string, string>} params - The URL parameters containing the meme ID and user ID.
 * @param {function} [getMemeByIdQueryFn=getMemeByIdQuery] - The function to call to fetch the meme from the repository.
 * 
 * @returns {Promise<Response>} - The response object indicating success or failure of the meme retrieval operation.
 */
export default async function getmemebyID(_req: Request, params: Record<string, string>,getMemeByIdQueryFn = getMemeByIdQuery): Promise<Response> {
        
        const meme_id = V4.isValid(params.id) ? params.id : throwException(HTTP_STATUS_CODE.BAD_REQUEST, MEME_ERROR_MESSAGES.MISSING_MEMEID);
        const user_id = params.user_id;

        // Fetch the meme by ID from the repository
        const fetchMeme = await getMemeByIdQueryFn(meme_id,user_id);
        return SuccessResponse(HTTP_STATUS_CODE.OK, MEME_SUCCESS_MESSAGES.MEME_FETCHED_SUCCESSFULLY, fetchMeme);
        
}
