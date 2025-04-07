import { unlikememe } from "@repository/_like_repo/LikeQueries.ts";
import { meme_exists } from "@repository/_meme_repo/MemeRepository.ts";
import { SuccessResponse } from '@response/Response.ts';
import { V4 } from "@V4";
import { MEME_ERROR_MESSAGES } from '@shared/_messages/Meme_Module_Messages.ts';
import { HTTP_STATUS_CODE } from '@shared/_constants/HttpStatusCodes.ts';
import { LIKE_SUCCESS } from '@shared/_messages/LikeMessage.ts';
import { throwException } from "@shared/ExceptionHandling/ThrowException.ts";
import GlobalExceptionHandler from "@shared/ExceptionHandling/GlobalExceptionHandler.ts";


/**
 * Unlike a meme by a user.
 * 
 * @param _req - The HTTP request object.
 * @param params - The URL parameters containing the user ID and meme ID.
 * @param [CheckMemeExists=meme_exists] - The function to call to check if a meme exists.
 * @param [unlikememeQuery=unlikememe] - The function to call to unlike a meme.
 * 
 * @returns {Promise<Response>} - The response object indicating success or failure of the unlike operation.
 * 
 * @throws {Error} - If an error occurs during any of the following:
 *   - Invalid or missing meme ID.
 *   - Meme not found.
 *   - Failure to unlike the meme.
 */
async function unlikememes(_req: Request, params: Record<string, string>,CheckMemeExists=meme_exists, unlikememeQuery = unlikememe ):Promise<Response> {
    
        const user_id = params.user_id;
        const meme_id = V4.isValid(params.id) ? params.id : throwException(HTTP_STATUS_CODE.BAD_REQUEST, MEME_ERROR_MESSAGES.MISSING_MEMEID);

        //Check if the meme exists in the database
        await CheckMemeExists(meme_id);

        // unlike the meme from the database
        await unlikememeQuery(meme_id, user_id);
        return SuccessResponse(HTTP_STATUS_CODE.OK, LIKE_SUCCESS.UNLIKED_SUCCESSFULLY);
}
export default GlobalExceptionHandler.handle(unlikememes);
