export const MEME_SUCCESS_MESSAGES={
    MEME_CREATED_SUCCESSFULLY:"Meme Created Successfully",
    MEME_UPDATED_SUCCESSFULLY:"Meme updated Succesfully",
    MEME_FETCHED_SUCCESSFULLY:"Meme fecthed Succesfully",
    MEMES_FETCHED_SUCCESSFULLY:"Memes fecthed Succesfully",
    MEME_DELETED_SUCCESSFULLY:"Meme deleted Succesfully",
    MEME_STATUS_UPDATED_SUCCESSFULLY:"Meme status updated succesfully",  
}

export const MEME_ERROR_MESSAGES = {
    //missing fields
    MISSING_USER_ID: "User ID is required to create a meme.",
    MISSING_MEME_TITLE: "Meme title is required.",
    MISSING_MEDIA_FILE: "Media  file  is required.",
    MISSING_TAGS: "At least one tag is required for the meme.",
    MISSING_MEMEID: "Meme-id parameter is Missing or Invalid",
    MISSING_STATUS_VALUE:"Meme_status field required to update",
    MISSING_REQUIRED_FEILDS:"meme_title, media_file, and tags must be included in 'form-data' to create a meme.",

    //validating fields
    MEME_TITLE_EXCEEDS_LIMIT: "Meme title exceeds the allowed character limit (3-100 characters).",
    INVALID_MEME_TITLE: "Meme title contains invalid characters. Only letters, numbers, and basic punctuation are allowed.",
    INVALID_TAG_LENGTH: "Tags must be between 1 and 20 characters in length.",
    INVALID_TAG: "One or more tags are invalid. Tags can only contain letters, numbers, and hyphens.",

    //restricted 
    NO_PERMISSION_TO_MODIFY:"You do not have permission to modify the meme_id field.",

    //failed errors
    MEDIA_UPLOAD_FAILED: "Failed to upload the file. Please try again.",
    FAILED_TO_CREATE: "An error occurred while creating the meme. Please try again later.",
    FAILED_TO_UPDATE: "Unable to update the meme.Either Meme not found or you are not authorized to update it",
    FAILED_TO_FETCH: "Unable to fetch the meme. Please ensure the meme exists and has not been deleted",
    FAILED_TO_DELETE: "Unable to delete the meme.Either Meme not found or you are not authorized to delete it",

    //Meme Already exists
    TITLE_CONFLICT:"A meme is already existed with same title",

    //Meme Not Found
    MEME_NOT_FOUND:"Meme not found",
    NO_MEMES:"No memes are available"
};
