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
 * Handles the update of a meme's details, including validation, data extraction, and database update.
 * 
 * @param {Request} req - The HTTP request object containing the form data for the meme update.
 * @param {Record<string, string>} params - The URL parameters containing the meme ID.
 * @returns {Promise<Response>} - The response object indicating the success or failure of the meme update operation.
 * 
 * @throws {Error} - If an error occurs during any of the following:
 *   - Invalid or missing meme ID.
 *   - Invalid content type.
 *   - Validation failures for the meme data.
 *   - Failure to update the meme in the database.
 */
export default async function updateMeme(req: Request,params:Record<string,string>,updateMemeQueryFn = updatememeQuery ): Promise<Response> {
    const logger = Logger.getInstance();
    try {
        const meme_id = params.id;
        const user_id = params.user_id;
        const user_type = params.user_type;

       // console.log (user_id,meme_id,user_type)
       logger.info ("meme_id: "+meme_id+"  user_id: "+user_id+"user_type: "+user_type);
        
        // Validate the meme_id parameter
        if (!meme_id || !V4.isValid(meme_id)) { 
            logger.info("Validation failed: Missing parameters."+meme_id);
            return  ErrorResponse(HTTP_STATUS_CODE.BAD_REQUEST,MEME_ERROR_MESSAGES.MISSING_MEMEID);
        }

  
        //Extract the JSON body and validate the required fields before inserting the meme into the database.
          const body = await req.json();
          const meme_title = body[MEMEFIELDS.MEME_TITLE] || undefined;
          const tagsRaw = body[MEMEFIELDS.TAGS] || undefined;
          const tags = tagsRaw ? parseTags(tagsRaw) : undefined;
  
          logger.info("Extracted values:"+ meme_title+" " + tags );

        
        const validationResponse = await validateMemeData(true,meme_title,tags);
        if (validationResponse instanceof Response) {
            console.log("validationResponse");
            return validationResponse; // If there are validation errors, return the response
        }
 
        console.log("Validation passed");
        const meme: Partial<Meme> = {meme_title,tags,meme_id,user_id};
        // Perform the update
        const {data:updatememe,error} = await updateMemeQueryFn(meme,user_type);
        logger.info("updatememe: "+updatememe+" error: " +error)
        if(error || !updatememe)
        {
            logger.info(`Update failed ${JSON.stringify(error)}`);
            return await ErrorResponse(HTTP_STATUS_CODE.NOT_FOUND, MEME_ERROR_MESSAGES.FAILED_TO_UPDATE);
        }
        return await SuccessResponse(HTTP_STATUS_CODE.OK,MEME_SUCCESS_MESSAGES.MEME_UPDATED_SUCCESSFULLY,updatememe);


    } catch (error) {
        logger.error(`Error updating meme:${JSON.stringify(error)}`);
        return await ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
}
