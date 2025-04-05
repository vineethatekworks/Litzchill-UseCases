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
 * Handler function to create a new meme.
 * 
 * This function handles the creation of a meme by:
 * - Verifying the content type of the incoming request to ensure it's multipart/form-data.
 * - Extracting necessary form data including meme_title, image_url (file), and tags.
 * - Validating the meme data before inserting it into the database.
 * - Uploading the meme's image to a cloud storage bucket.
 * - Inserting the meme into the database.
 * 
 * @param {Request} req - The HTTP request object that contains the data for the new meme.
 * @param {Record<string, string>} user - The user data, expected to have a user_id field.
 * 
 * @returns {Promise<Response>} - The response containing the status of the operation:
 *   - If successful, a success response with the created meme data.
 *   - If any step fails, an error response with an appropriate status code and message.
 * 
 * @throws {Error} Throws an error if any part of the process fails unexpectedly.
 */
export default async function createMeme(req: Request, params: Record<string, string>, uploadFileToBucketQuery = uploadFileToBucket,CreateMemeQueryFn = createMemeQuery): Promise<Response> {
    const logger = Logger.getInstance();  // Get the logger instance
    logger.log("Processing createMeme handler");

    try {
        const user_id = params.user_id;
        logger.info(`User_id is: ${user_id}`);

      //  Ensure the content type is multipart/form-data
        const contentType = req.headers.get("content-type") || "";
        const validateContentType = contentTypeValidations(contentType);
        if (!validateContentType) {
            logger.error("Invalid content type.");
            return await ErrorResponse(HTTP_STATUS_CODE.BAD_REQUEST, MEME_ERROR_MESSAGES.MISSING_REQUIRED_FEILDS);
        }

        // Extract the form data from the request body
        const formData = await req.formData();
        const meme_title = formData.get(MEMEFIELDS.MEME_TITLE) as string;
        const tagsRaw = formData.get(MEMEFIELDS.TAGS) as string;
        const tags = parseTags(tagsRaw);
        const media_file = formData.get(MEMEFIELDS.MEDIA_FILE) as File;
        
        logger.info(`Extracted values: meme_title=${meme_title}, tags=${tags}, media_file=${media_file}`);
       
        // Validate the meme data before inserting it into the database
        const validationResponse = await validateMemeData(false, meme_title, tags, media_file);
        logger.info(`Validation response: ${validationResponse}`);
        if (validationResponse instanceof Response) {
            return validationResponse; // If there are validation errors, return the response
        }

        // Step 2: Upload the image to the bucket and get the public URL
        const uploadedUrl = await uploadFileToBucketQuery(media_file, meme_title);
        if (!uploadedUrl) {
            logger.error("Failed to upload media file to bucket.");
            return await ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, MEME_ERROR_MESSAGES.MEDIA_UPLOAD_FAILED);
        }

        // Prepare meme data for insertion
        const meme: Partial<Meme> = { meme_title, tags, media_file: uploadedUrl, user_id };

        // Insert the meme into the database
        const { data: insertmeme, error: insertError } = await CreateMemeQueryFn(meme);
        if (insertError) {
            logger.error("Failed to insert meme into the database.");
            return await ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, MEME_ERROR_MESSAGES.FAILED_TO_CREATE);
        }

        // Return success response
        logger.info("Meme created successfully.");
        return await SuccessResponse(HTTP_STATUS_CODE.CREATED, MEME_SUCCESS_MESSAGES.MEME_CREATED_SUCCESSFULLY, insertmeme);

    } catch (error) {
        logger.error(`Error creating meme: ${error}`);
        return await ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
}