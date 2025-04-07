import { HTTP_STATUS_CODE } from "@shared/_constants/HttpStatusCodes.ts";
import { COMMON_ERROR_MESSAGES } from "@shared/_messages/ErrorMessages.ts";
import { parseTags, validateMemeData } from "@shared/_validation/Meme_Validations.ts";
import { MEMEFIELDS } from '@shared/_db_table_details/MemeTableFields.ts';
import { updatememeQuery } from "@repository/_meme_repo/MemeRepository.ts";
import { Meme } from '@model/MemeModel.ts';
import { V4 } from "@V4";
import { ErrorResponse, SuccessResponse } from "@response/Response.ts";
import { MEME_ERROR_MESSAGES, MEME_SUCCESS_MESSAGES } from "@shared/_messages/Meme_Module_Messages.ts";
import Logger from "@shared/Logger/logger.ts";


/**
 * Updates the details of an existing meme, including its title and tags.
 *
 * This function validates the provided meme ID and user details, parses the JSON
 * body for meme information, validates the data, and performs the update operation.
 * It logs the process and returns a success or error response based on the outcome.
 *
 * @param {Request} req - The HTTP request object containing the updated meme data in JSON format.
 * @param {Record<string, string>} params - The URL parameters containing the meme ID, user ID, and user type.
 * @param {function} [updateMemeQueryFn=updatememeQuery] - The function to execute the update operation in the repository.
 * 
 * @returns {Promise<Response>} - The response object indicating the success or failure of the update operation.
 *
 * @throws {Error} - If an error occurs during the update process, such as:
 *   - Invalid or missing meme ID.
 *   - Validation failures for the meme data.
 *   - Failure to update the meme in the database.
 *   - Internal server error.
 */

export default async function updateMeme(req: Request,params:Record<string,string>,updateMemeQueryFn = updatememeQuery ): Promise<Response> {
    const logger = Logger.getInstance();
    try {
        const meme_id = params.id;
        const user_id = params.user_id;
        
        // Validate the meme_id parameter
        if (!meme_id || !V4.isValid(meme_id)) {
            return ErrorResponse(HTTP_STATUS_CODE.BAD_REQUEST, MEME_ERROR_MESSAGES.MISSING_MEMEID);
        }    
        //Extract the JSON body and validate the required fields before inserting the meme into the database.
          const body = await req.json();
          const meme_title = body[MEMEFIELDS.MEME_TITLE] || undefined;
          const tagsRaw = body[MEMEFIELDS.TAGS] || undefined;
          const tags = tagsRaw ? parseTags(tagsRaw) : undefined;
  
        // If there are validation errors, return the response
        const validationResponse = validateMemeData(true,meme_title,tags);
        if (validationResponse instanceof Response) return validationResponse; 
 
        const meme: Partial<Meme> = {meme_title,tags,meme_id,user_id};
        // Perform the update
        const {data:updatememe,error} = await updateMemeQueryFn(meme,params.user_type);

        if(error || !updatememe) return ErrorResponse(HTTP_STATUS_CODE.NOT_FOUND, MEME_ERROR_MESSAGES.FAILED_TO_UPDATE);
        
        return  SuccessResponse(HTTP_STATUS_CODE.OK,MEME_SUCCESS_MESSAGES.MEME_UPDATED_SUCCESSFULLY,updatememe);


    } catch (error) {
        logger.error(`Error updating meme:${JSON.stringify(error)}`);
        return  ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
}
