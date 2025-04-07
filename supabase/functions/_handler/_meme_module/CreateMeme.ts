import { HTTP_STATUS_CODE } from "@shared/_constants/HttpStatusCodes.ts";
import { SuccessResponse } from "@response/Response.ts";
import { contentTypeValidations, parseTags, validateMemeData } from '@shared/_validation/Meme_Validations.ts';
import { createMemeQuery, uploadFileToBucket } from "@repository/_meme_repo/MemeRepository.ts";
import { Meme } from "@model/MemeModel.ts";
import { MEME_SUCCESS_MESSAGES } from "@shared/_messages/Meme_Module_Messages.ts";
import { MEMEFIELDS } from '@shared/_db_table_details/MemeTableFields.ts';
import GlobalExceptionHandler from "@shared/ExceptionHandling/GlobalExceptionHandler.ts";

// function to Extract the form data from the request body
async function ExtractFormData(req: Request) {
    const formData = await req.formData();
    const meme_title = formData.get(MEMEFIELDS.MEME_TITLE) as string;
    const tagsRaw = formData.get(MEMEFIELDS.TAGS) as string;
    const tags = parseTags(tagsRaw);
    const media_file = formData.get(MEMEFIELDS.MEDIA_FILE) as File;

    return { meme_title, tags, media_file };
}


async function createMeme(req: Request, params: Record<string, string>, uploadFileToBucketQuery = uploadFileToBucket, CreateMemeQueryFn = createMemeQuery): Promise<Response> {
    const user_id = params.user_id;

    //Ensure the content type is multipart/form-data
    contentTypeValidations(req.headers.get("content-type") || "");

    // Extract the form data from the request body
    const { meme_title, tags, media_file } = await ExtractFormData(req);

    // Validate the meme data before inserting it into the database
    validateMemeData(false, meme_title, tags, media_file);
   

    // Step 2: Upload the image to the bucket and get the public URL
    const uploadedUrl = await uploadFileToBucketQuery(media_file, meme_title);


    // Prepare meme data for insertion
    const meme: Partial<Meme> = { meme_title, tags, media_file: uploadedUrl, user_id };

    // Insert the meme into the database
    const insertmeme = await CreateMemeQueryFn(meme);
    return SuccessResponse(HTTP_STATUS_CODE.CREATED, MEME_SUCCESS_MESSAGES.MEME_CREATED_SUCCESSFULLY, insertmeme);

}

export default GlobalExceptionHandler.handle(createMeme);