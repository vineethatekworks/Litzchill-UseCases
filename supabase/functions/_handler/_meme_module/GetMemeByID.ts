import * as MemeRepository from "@repository/_meme_repo/MemeRepository.ts";
import { HTTP_STATUS_CODE } from "@shared/_constants/HttpStatusCodes.ts";
import { COMMON_ERROR_MESSAGES } from "@shared/_messages/ErrorMessages.ts";
import { V4 } from "@V4";
import { MEME_ERROR_MESSAGES, MEME_SUCCESS_MESSAGES } from "@shared/_messages/Meme_Module_Messages.ts";
import { ErrorResponse, SuccessResponse } from "@response/Response.ts";
import Logger from "@shared/Logger/logger.ts";
/**
 * Handler function to fetch a meme by its ID.
 * 
 * This function:
 * - Validates the provided meme ID.
 * - Fetches the meme from the repository using the meme ID.
 * - Returns a success response with the fetched meme or an error response if the meme is not found or there's an issue.
 * 
 * @param {Request} req - The HTTP request object.
 * @param {Record<string, string>} params - The URL parameters containing:
 *   - `id`: The unique ID of the meme to fetch.
 * 
 * @returns {Promise<Response>} - The response containing:
 *   - If successful, a success response with the meme details.
 *   - If the meme is not found or an error occurs, an error response with the appropriate status code and message.
 * 
 * @throws {Error} Throws an error if there is an unexpected failure while fetching the meme.
 */
export default async function getmemebyID(_req: Request, params: Record<string, string>,getMemeByIdQuery = MemeRepository.getMemeByIdQuery): Promise<Response> {
    const logger = Logger.getInstance();  // Get the logger instance
    try {  
        logger.info("Processing getMemebyID handler");
        const meme_id = params.id;
        const user_id = params.user_id;
        logger.info(`Processing user ID: ${user_id}`);
        logger.info(`Received request to fetch meme with ID: ${meme_id}`);  
        // Validate the meme_id
        if (!meme_id || !V4.isValid(meme_id)) { 
            logger.info("Validation failed: Missing or invalid meme ID " + meme_id);
            return ErrorResponse(HTTP_STATUS_CODE.BAD_REQUEST, MEME_ERROR_MESSAGES.MISSING_MEMEID);
        }

        // Fetch the meme by ID from the repository
        logger.info("Fetching meme from repository..." );
        const { data: fetchMeme, error } = await getMemeByIdQuery(meme_id,user_id);
        
        // Handle errors or empty results
        if (error) {
            logger.error(`Error in getMemesByIdQuery: ${JSON.stringify(error)}`);
            return ErrorResponse(HTTP_STATUS_CODE.NOT_FOUND, error);
        }
        // Successfully fetched meme
        logger.log("Meme fetched successfully:"+ JSON.stringify(fetchMeme));

        // Return the fetched meme
        return SuccessResponse(HTTP_STATUS_CODE.OK, MEME_SUCCESS_MESSAGES.MEME_FETCHED_SUCCESSFULLY, fetchMeme);
        
    } catch (error) {
        logger.error("Error fetching meme:"+  error);
        return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
}
