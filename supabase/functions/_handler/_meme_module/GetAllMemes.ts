// deno-lint-ignore-file
import { ErrorResponse, SuccessResponse } from "@response/Response.ts";
import { HTTP_STATUS_CODE } from "@shared/_constants/HttpStatusCodes.ts";
import { COMMON_ERROR_MESSAGES } from "@shared/_messages/ErrorMessages.ts";
import { MEME_ERROR_MESSAGES, MEME_SUCCESS_MESSAGES } from "@shared/_messages/Meme_Module_Messages.ts";
import Logger from "@shared/Logger/logger.ts";
import { fetchMemes } from "@repository/_meme_repo/MemeRepository.ts";


/**
 * Handles HTTP GET requests to /memes and returns a list of memes ordered by creation date or popularity.
 * 
 * @param {Request} req - The HTTP request object.
 * @param {Record<string, string>} params - URL parameters containing the page number, limit, sort order, and tags.
 * @param {function} [getAllMemes=fetchMemes] - The function to call for fetching memes from the database.
 * @returns {Promise<Response>} - A promise that resolves with an array of memes or an error response.
 */

export default async function getAllMemes(req: Request,params:Record<string, string>, getAllMemes = fetchMemes): Promise<Response> { 
     const logger = Logger.getInstance();  // Get the logger instance
    try {
        const url = new URL(req.url);
        const page = Number(url.searchParams.get('page')) || 1;
        const limit = Number(url.searchParams.get('limit')) || 50;
        const sort = url.searchParams.get('sort') || "popular";
        const tag = url.searchParams.get('tags') || null;

        // Fetch memes from the repository using the provided parameters
        const { data: allmemes, error } = await getAllMemes(page, limit, sort, tag);
 
        // Handle errors and return appropriate responses
        if (error || !allmemes || allmemes.length === 0) return ErrorResponse(HTTP_STATUS_CODE.NOT_FOUND, MEME_ERROR_MESSAGES.NO_MEMES);

        return SuccessResponse(HTTP_STATUS_CODE.OK, MEME_SUCCESS_MESSAGES.MEMES_FETCHED_SUCCESSFULLY, allmemes);
    } catch (error) {
        logger.error(`Error occurred while fetching memes: ${error}`);
        return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
}

