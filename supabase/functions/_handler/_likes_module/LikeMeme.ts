import {  insertLikeQuery } from "@repository/_like_repo/LikeQueries.ts";
import { ErrorResponse, SuccessResponse } from "@response/Response.ts";
import { HTTP_STATUS_CODE } from "@shared/_constants/HttpStatusCodes.ts";
import { LIKE_ERROR } from "@shared/_messages/LikeMessage.ts";
import { COMMON_ERROR_MESSAGES } from '@shared/_messages/ErrorMessages.ts';
import { LIKE_SUCCESS } from '@shared/_messages/LikeMessage.ts';
import { meme_exists } from "@repository/_meme_repo/MemeRepository.ts";
import { MEME_ERROR_MESSAGES } from "@shared/_messages/Meme_Module_Messages.ts";
import { V4 } from "@V4";
import Logger from "@shared/Logger/logger.ts";

/**
 * Handles the process of liking a meme by a user, including validation, insertion, and updating the like count.
 * 
 * @param {Request} req - The HTTP request object, which contains the user ID and meme ID in the parameters.
 * @param {Record<string, string>} params - The URL parameters containing the user ID and meme ID.
 * @returns {Promise<Response>} - The response object, indicating success or failure of the like operation.
 * 
 * @throws {Error} - If an error occurs during any of the following:
 *   - Invalid or missing meme ID.
 *   - Meme not found.
 *   - User has already liked the meme.
 *   - Failure to insert like or update like count.
 *   - Failure to notify the meme owner.
 */
export default async function likememe(_req: Request, params: Record<string, string>,CheckMemeExists=meme_exists, likememeQuery = insertLikeQuery) {
    const logger = Logger.getInstance();
    try {
        const user_id = params.user_id;
        const meme_id = params.id;

        logger.info('User: ' + user_id + 'meme_id: ' + meme_id);
        // Validate the meme_id parameter
        if (!meme_id || !V4.isValid(meme_id)) { 
            logger.info("Validation failed: Missing or invalid meme_id.");
            return ErrorResponse(HTTP_STATUS_CODE.BAD_REQUEST, MEME_ERROR_MESSAGES.MISSING_MEMEID);
        }

        // Step 1: Check if meme exists
        const existingMeme = await CheckMemeExists(meme_id);
        if (!existingMeme) {
            logger.error(`Meme with ID ${meme_id} not found.`);
            return ErrorResponse(HTTP_STATUS_CODE.NOT_FOUND, MEME_ERROR_MESSAGES.MEME_NOT_FOUND);
        }
        logger.info(`Meme with ID ${meme_id} exists.`);
        

        // Step 2: Insert a new like record
        const likeable_type = "meme";
        const { data: _likeMeme, error: likeError } = await likememeQuery(meme_id, user_id, likeable_type);
        if (likeError) {
            logger.error(`Failed to like meme ${meme_id} by user ${user_id}  returned error: ${JSON.stringify(likeError)}`);
            return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, LIKE_ERROR.INSERTION_FAILED);
        }
        return SuccessResponse(HTTP_STATUS_CODE.OK, LIKE_SUCCESS.LIKED_SUCCESSFULLY);
    } catch (error) {
        logger.error("Error processing like:"+ error);
        return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
}

