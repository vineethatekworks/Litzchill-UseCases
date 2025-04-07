import { HTTP_STATUS_CODE } from "@shared/_constants/HttpStatusCodes.ts";
import { COMMON_ERROR_MESSAGES } from "@shared/_messages/ErrorMessages.ts";
import { V4 } from "@V4";
import { MEME_ERROR_MESSAGES, MEME_SUCCESS_MESSAGES } from "@shared/_messages/Meme_Module_Messages.ts";
import { ErrorResponse, SuccessResponse } from "@response/Response.ts";
import Logger from "@shared/Logger/logger.ts";
import { getMemeByIdQuery } from "@repository/_meme_repo/MemeRepository.ts";

/**
 * Fetches a meme by its ID and returns the details.
 *
 * @param {Request} _req - The HTTP request object. Not used in this function.
 * @param {Record<string, string>} params - URL parameters containing the meme ID and user ID.
 * @param {function} [getMemeByIdQuery=MemeRepository.getMemeByIdQuery] - The function to call for fetching the meme from the database.
 * @returns {Promise<Response>} - The response object containing the status and meme data, or an error message if the operation fails.
 *
 * @throws {Error} - If an error occurs during the fetch operation, such as:
 *   - Invalid or missing meme ID.
 *   - Meme not found.
 *   - Internal server error.
 */

export default async function getmemebyID(_req: Request, params: Record<string, string>,getMemeByIdQueryFn = getMemeByIdQuery): Promise<Response> {
    const logger = Logger.getInstance();  // Get the logger instance
    try {  
        logger.info("Processing getMemebyID handler");
        const meme_id = params.id;
        const user_id = params.user_id; 
        // Validate the meme_id
        if (!meme_id || !V4.isValid(meme_id)) return ErrorResponse(HTTP_STATUS_CODE.BAD_REQUEST, MEME_ERROR_MESSAGES.MISSING_MEMEID);

        // Fetch the meme by ID from the repository
        const { data: fetchMeme, error } = await getMemeByIdQueryFn(meme_id,user_id);
        
        // Handle errors or empty results
        if (error)  return ErrorResponse(HTTP_STATUS_CODE.NOT_FOUND, error);

        // Return the fetched meme
        return SuccessResponse(HTTP_STATUS_CODE.OK, MEME_SUCCESS_MESSAGES.MEME_FETCHED_SUCCESSFULLY, fetchMeme);
        
    } catch (error) {
        logger.error("Error fetching meme:"+  error);
        return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
}
