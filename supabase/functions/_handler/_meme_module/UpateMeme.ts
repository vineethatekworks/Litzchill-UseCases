import { HTTP_STATUS_CODE } from "@shared/_constants/HttpStatusCodes.ts";
import { parseTags, validateMemeData } from "@shared/_validation/Meme_Validations.ts";
import { MEMEFIELDS } from '@shared/_db_table_details/MemeTableFields.ts';
import { updatememeQuery } from "@repository/_meme_repo/MemeRepository.ts";
import { Meme } from '@model/MemeModel.ts';
import { V4 } from "@V4";
import { SuccessResponse } from "@response/Response.ts";
import { MEME_ERROR_MESSAGES, MEME_SUCCESS_MESSAGES } from "@shared/_messages/Meme_Module_Messages.ts";
import { throwException } from "@shared/ExceptionHandling/ThrowException.ts";
import GlobalExceptionHandler from "@shared/ExceptionHandling/GlobalExceptionHandler.ts";

//Function to Extract the required fields for updating the meme
async function extractRequiredFields(req: Request) {
    const body = await req.json();
    const meme_title = body[MEMEFIELDS.MEME_TITLE] || undefined;
    const tagsRaw = body[MEMEFIELDS.TAGS] || undefined;
    const tags = tagsRaw ? parseTags(tagsRaw) : undefined;
    return { meme_title, tags };
}


/**
 * Handles the update of a meme in the database by a user, including validation and database update.
 * 
 * @param {Request} req - The HTTP request object.
 * @param {Record<string, string>} params - The URL parameters containing the meme ID, user ID, and user type.
 * @param {function} [updateMemeQueryFn=updatememeQuery] - The function to call to update the meme.
 * 
 * @returns {Promise<Response>} - The response object indicating success or failure of the update operation.
 */
async function updateMeme(req: Request, params: Record<string, string>, updateMemeQueryFn = updatememeQuery): Promise<Response> {

    const meme_id = V4.isValid(params.id) ? params.id : throwException(HTTP_STATUS_CODE.BAD_REQUEST, MEME_ERROR_MESSAGES.MISSING_MEMEID);
    const user_id = params.user_id;

    //Extract the required fields for updating the meme
    const { meme_title, tags } = await extractRequiredFields(req);

    // Validate the meme data before inserting it into the database
    validateMemeData(true, meme_title, tags);

    // Prepare meme data for insertion       
    const meme: Partial<Meme> = { meme_title, tags, meme_id, user_id };

    // Perform the update
    const updatememe = await updateMemeQueryFn(meme, params.user_type);
    return SuccessResponse(HTTP_STATUS_CODE.OK, MEME_SUCCESS_MESSAGES.MEME_UPDATED_SUCCESSFULLY, updatememe);
}

export default GlobalExceptionHandler.handle(updateMeme);