import * as MemeRepository from "@repository/_meme_repo/MemeRepository.ts";
import { ErrorResponse, SuccessResponse } from "@response/Response.ts";
import { HTTP_STATUS_CODE } from "@shared/_constants/HttpStatusCodes.ts";
import { COMMON_ERROR_MESSAGES } from "@shared/_messages/ErrorMessages.ts";
import { V4 } from "@V4";
import { MEME_ERROR_MESSAGES, MEME_SUCCESS_MESSAGES } from "@shared/_messages/Meme_Module_Messages.ts";
import Logger from "@shared/Logger/logger.ts";
/**
 * Handles the deletion of a meme by a user, including validation and database deletion.
 * 
 * @param {Request} _req - The HTTP request object (not used in this handler).
 * @param {Record<string, string>} params - The URL parameters containing the meme ID, user ID, and user type.
 * @param {function} [deleteMemeQuery=MemeRepository.deleteMemeQuery] - The function to call to delete the meme.
 * 
 * @returns {Promise<Response>} - The response object indicating success or failure of the deletion operation.
 * 
 * @throws {Error} - If an error occurs during any of the following:
 *   - Invalid or missing meme ID.
 *   - Meme not found.
 *   - User is not authorized to delete the meme.
 *   - Failure to delete the meme.
 */
export default async function DeletememebyID(
    _req: Request,
    params: Record<string, string>,
    deleteMemeQuery = MemeRepository.deleteMemeQuery // Default to the real function
) {
    const logger = Logger.getInstance();  
    try {
        logger.log("Processing deleteMeme handler");
        const meme_id = params.id;
        const user_id = params.user_id;
        const user_type = params.user_type;

        logger.info(`Received delete request for meme_id: ${meme_id}, user_id: ${user_id}, user_type: ${user_type}`);

        if (!meme_id || !V4.isValid(meme_id)) { 
            logger.warn("Validation failed: Missing or invalid meme_id.");
            return await ErrorResponse(
                HTTP_STATUS_CODE.BAD_REQUEST,
                MEME_ERROR_MESSAGES.MISSING_MEMEID
            );
        }

        // Call the function (mocked in tests, real in production)
        const { data, error } = await deleteMemeQuery(meme_id, user_id, user_type);
        logger.info(`Delete query response: data=${JSON.stringify(data)}, error=${error}`);

        if (error) {
            logger.error(`Delete failed for meme_id: ${meme_id}. Error: ${error}`);
            return await ErrorResponse(
                error.code === "403" ? HTTP_STATUS_CODE.FORBIDDEN :
                error.code === "404" ? HTTP_STATUS_CODE.NOT_FOUND :
                error.code === "409" ? HTTP_STATUS_CODE.CONFLICT :
                HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
                error.message
            );
        }

        logger.info(`Meme deleted successfully: meme_id=${meme_id}`);
        return await SuccessResponse(HTTP_STATUS_CODE.OK,MEME_SUCCESS_MESSAGES.MEME_DELETED_SUCCESSFULLY);

    } catch (error) {
        logger.error(`Internal Server Error while deleting meme. Details: ${error}`);
        return await ErrorResponse(
            HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
            COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR
        );
    }
}
