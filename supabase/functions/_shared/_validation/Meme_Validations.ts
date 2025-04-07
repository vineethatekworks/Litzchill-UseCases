import { HTTP_STATUS_CODE } from '../_constants/HttpStatusCodes.ts';
import { MEME_ERROR_MESSAGES } from "../_messages/Meme_Module_Messages.ts";
import { throwException } from "@shared/ExceptionHandling/ThrowException.ts";


/**
 * Validates if the request's content type is valid "multipart/form-data".
 */
export function contentTypeValidations(contentType: string) {
    (!contentType?.includes("multipart/form-data")) &&
        throwException(HTTP_STATUS_CODE.BAD_REQUEST, MEME_ERROR_MESSAGES.MISSING_REQUIRED_FEILDS);
}


/**
 * Parses a raw string of tags into an array.
 */
export function parseTags(tagsRaw: string | null): string[] {
    
    // If tagsRaw is null or empty, return an empty array or handle as needed.
    if (!tagsRaw || tagsRaw.trim().length === 0) return [];

    if (tagsRaw.trim().startsWith("[") && tagsRaw.trim().endsWith("]")) {
        const parsedTags = JSON.parse(tagsRaw);
        Array.isArray(parsedTags) || throwException(HTTP_STATUS_CODE.BAD_REQUEST, "Tags should be an array");
        return parsedTags;
    }

    return tagsRaw.split(",").map(tag => tag.trim());
}



/**
 * Main validation function
 * @param memeData - Meme data object to validate
 * @param isUpdate - Boolean flag to indicate whether the request is for an update
 * @returns Validation result object or error response
 */
export function validateMemeData(isUpdate: boolean = false, meme_title?: string, tags?: string[], media_file?: File) {
    const validationErrors: string[] = [];

    // If creating a meme, check for required fields
    !isUpdate && checkRequiredFields(meme_title, tags, media_file, validationErrors);

    // Common validation for both create and update
    validateMemeFields(meme_title, tags, validationErrors);

    // Returning validation errors if any
    validationErrors.length > 0 && throwException(HTTP_STATUS_CODE.BAD_REQUEST, validationErrors.join(" & "));
    return {};
}


/**
 * Validates meme fields
 */
export function validateMemeFields(meme_title: string | undefined, tags: string[] | undefined, validationErrors: string[]) {
    console.log('running validation')
    console.log(meme_title, tags, validationErrors);
    // Validate meme title
    if (meme_title) {
        if (meme_title.trim().length < 3 || meme_title.trim().length > 100) {
            validationErrors.push(MEME_ERROR_MESSAGES.MEME_TITLE_EXCEEDS_LIMIT);
        }
        if (!/^[A-Za-z0-9\s.,'!?-]+$/.test(meme_title)) {
            validationErrors.push(MEME_ERROR_MESSAGES.INVALID_MEME_TITLE);
        }
    }
    // Validate tags (only invalid tags, not missing ones)
    if (tags && tags.length > 0) {
        console.log("Validation tags: " + tags)
        for (const tag of tags) {
            if (tag.length < 2 || tag.length > 20) {
                validationErrors.push(MEME_ERROR_MESSAGES.INVALID_TAG_LENGTH);
            }
            if (!/^[A-Za-z0-9\s-]+$/.test(tag)) {
                validationErrors.push(MEME_ERROR_MESSAGES.INVALID_TAG);
            }
        }
    }
}

/**
 * Checks required fields for meme creation
 */
function checkRequiredFields(meme_title: string | undefined, tags: string[] | undefined,media_file: File | undefined,errors: string[]) {

    !meme_title && errors.push(MEME_ERROR_MESSAGES.MISSING_MEME_TITLE);
    (!tags || tags.length === 0) && errors.push(MEME_ERROR_MESSAGES.MISSING_TAGS);
    !media_file && errors.push(MEME_ERROR_MESSAGES.MISSING_MEDIA_FILE);

}
