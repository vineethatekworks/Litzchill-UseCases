import { HTTP_STATUS_CODE } from "@shared/_constants/HttpStatusCodes.ts";
import { COMMON_ERROR_MESSAGES } from "@shared/_messages/ErrorMessages.ts";
import { ErrorResponse, SuccessResponse } from "@response/Response.ts";
import { contentTypeValidations, parseTags, validateMemeData } from '@shared/_validation/Meme_Validations.ts';
import { createMemeQuery, uploadFileToBucket } from "@repository/_meme_repo/MemeRepository.ts";
import { Meme } from "@model/MemeModel.ts";
import { MEME_ERROR_MESSAGES, MEME_SUCCESS_MESSAGES } from "@shared/_messages/Meme_Module_Messages.ts";
import { MEMEFIELDS } from '@shared/_db_table_details/MemeTableFields.ts';
import Logger from "@shared/Logger/logger.ts";



/**
 * Handles the creation of a new meme, including data validation, media upload, and database insertion.
 *
 * @param {Request} req - The HTTP request object containing the form data for the meme creation.
 * @param {Record<string, string>} params - The URL parameters containing the user ID.
 * @param {function} [uploadFileToBucketQuery=uploadFileToBucket] - The function to call to upload the media file to a bucket.
 * @param {function} [CreateMemeQueryFn=createMemeQuery] - The function to call to insert the meme into the database.
 * 
 * @returns {Promise<Response>} - The response object indicating the success or failure of the meme creation operation.
 *
 * @throws {Error} - If an error occurs during any of the following:
 *   - Invalid content type.
 *   - Validation failures for the meme data.
 *   - Failure to upload the media file.
 *   - Failure to insert the meme into the database.
 */

export default async function createMeme(req: Request, params: Record<string, string>, uploadFileToBucketQuery = uploadFileToBucket,CreateMemeQueryFn = createMemeQuery): Promise<Response> {
    const logger = Logger.getInstance();  // Get the logger instance
    logger.log("Processing createMeme handler");

    try {
        const user_id = params.user_id;

      //  Ensure the content type is multipart/form-data
        const contentType = req.headers.get("content-type") || "";
        const validateContentType = contentTypeValidations(contentType);
        if (!validateContentType) return  ErrorResponse(HTTP_STATUS_CODE.BAD_REQUEST, MEME_ERROR_MESSAGES.MISSING_REQUIRED_FEILDS);

        // Extract the form data from the request body
        const formData = await req.formData();
        const meme_title = formData.get(MEMEFIELDS.MEME_TITLE) as string;
        const tagsRaw = formData.get(MEMEFIELDS.TAGS) as string;
        const tags = parseTags(tagsRaw);
        const media_file = formData.get(MEMEFIELDS.MEDIA_FILE) as File;
        
        
        // Validate the meme data before inserting it into the database
        const validationResponse =  validateMemeData(false, meme_title, tags, media_file);
        // If there are validation errors, return the response
        if (validationResponse instanceof Response)  return validationResponse; 
        

        // Step 2: Upload the image to the bucket and get the public URL
        const uploadedUrl = await uploadFileToBucketQuery(media_file, meme_title);
        if (!uploadedUrl) return  ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, MEME_ERROR_MESSAGES.MEDIA_UPLOAD_FAILED);

        // Prepare meme data for insertion
        const meme: Partial<Meme> = { meme_title, tags, media_file: uploadedUrl, user_id };

        // Insert the meme into the database
        const { data: insertmeme, error: insertError } = await CreateMemeQueryFn(meme);
        if (insertError) return  ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, MEME_ERROR_MESSAGES.FAILED_TO_CREATE);

        // Return success response
        return  SuccessResponse(HTTP_STATUS_CODE.CREATED, MEME_SUCCESS_MESSAGES.MEME_CREATED_SUCCESSFULLY, insertmeme);

    } catch (error) {
        logger.error(`Error creating meme: ${error}`);
        return  ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
}