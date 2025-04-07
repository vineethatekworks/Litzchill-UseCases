// deno-lint-ignore-file
import { fetchMemes } from "@repository/_meme_repo/MemeRepository.ts";
import { SuccessResponse } from "@response/Response.ts";
import { HTTP_STATUS_CODE } from "@shared/_constants/HttpStatusCodes.ts";
import { MEME_SUCCESS_MESSAGES } from "@shared/_messages/Meme_Module_Messages.ts";
import Logger from "@shared/Logger/logger.ts";
import GlobalExceptionHandler from "@shared/ExceptionHandling/GlobalExceptionHandler.ts";

// Function to fetch parameters
function getParams(req: Request){
    const url = new URL(req.url);
    const page = Number(url.searchParams.get('page')) || 1;
    const limit = Number(url.searchParams.get('limit')) || 50;
    const sort = url.searchParams.get('sort') || "popular";
    const tag = url.searchParams.get('tags') || null;
   return { page, limit, sort, tag };
}


/**
 * Handles the fetching of all memes from the database, taking into account the page number, limit, sort order, and tag(s) provided in the request.
 * 
 * @param {Request} req - The HTTP request object.
 * @param {function} [getAllMemes=fetchMemes] - The function to call to fetch the memes.
 * 
 * @returns {Promise<Response>} - The response object containing the fetched memes.
 */

async function getAllMemes(req: Request,params: Record<string, string>, getAllMemes = fetchMemes): Promise<Response> {
    const logger = Logger.getInstance();
    // Get the parameters from the request URL
    const { page, limit, sort, tag } = getParams(req);
    logger.info(`Fetching memes with params: page=${page}, limit=${limit}, sort=${sort}, tag=${tag}`);

    // Fetch memes from the repository using the provided parameters
    const allmemes = await getAllMemes(page, limit, sort, tag);
    return SuccessResponse(HTTP_STATUS_CODE.OK, MEME_SUCCESS_MESSAGES.MEMES_FETCHED_SUCCESSFULLY, allmemes);
}

export default GlobalExceptionHandler.handle(getAllMemes);
