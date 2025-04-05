// import { Meme } from "@model/MemeModel.ts";
import { ErrorResponse } from "@response/Response.ts";
import { HTTP_STATUS_CODE } from '../_constants/HttpStatusCodes.ts';
import { MEME_ERROR_MESSAGES } from "../_messages/Meme_Module_Messages.ts";


/**
 * Validates if the request's content type is a valid "multipart/form-data" type.
 * 
 * @param {string} contentType - The content type of the request.
 * @returns {boolean} - Returns `true` if the content type is "multipart/form-data", otherwise returns `false`.
 * 
 * @example
 * contentTypeValidations("multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW"); // Returns true
 * contentTypeValidations("application/json"); // Returns false
 */
export function contentTypeValidations(contentType: string): boolean {
    if (!contentType || !contentType.includes("multipart/form-data")) {
        console.warn("Invalid content type: " + contentType); // Be specific about the invalid type.
        return false;
    }
    return true;
}

/**
 * Parses a raw string of tags into an array of tags.
 * If the string is in JSON array format, it parses it directly. Otherwise, it splits the string by commas and trims extra spaces.
 * 
 * @param {string | null} tagsRaw - The raw tags as a string.
 * @returns {string[]} - An array of tag strings.
 * 
 * @throws {Error} - If the tags are in JSON format but are not an array.
 * 
 * @example
 * parseTags("tag1, tag2, tag3"); // Returns ["tag1", "tag2", "tag3"]
 * parseTags("[\"tag1\", \"tag2\"]"); // Returns ["tag1", "tag2"]
 */
export function parseTags(tagsRaw: string | null): string[] {
    if (!tagsRaw || tagsRaw.trim().length === 0) {
        // If tagsRaw is null or empty, return an empty array or handle as needed.
        return [];
    }

    if (tagsRaw.trim().startsWith("[") && tagsRaw.trim().endsWith("]")) {
        const parsedTags = JSON.parse(tagsRaw);
        if (!Array.isArray(parsedTags)) {
            throw new Error("Tags is not an array");
        }
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
export function validateMemeData(isUpdate: boolean = false,meme_title?:string ,tags?:string[],media_file?: File) {
    const validationErrors: string[] = [];

    // If creating a meme, check for required fields
    if (!isUpdate) {
        console.log("going to check for required fields");
        checkRequiredFields(meme_title, tags, media_file, validationErrors);
    }
    // Common validation for both create and update
    validateMemeFields(meme_title,tags, validationErrors);

    // Returning validation errors if any
    if (validationErrors.length > 0) {
        return ErrorResponse(HTTP_STATUS_CODE.BAD_REQUEST,validationErrors.join("  &  "));
    }
    // Validation passed
    return {};
}

/**
 * Validates meme title, image URL, and tags
 * @param meme_title - Meme title to validate
 * @param image_url - Image URL to validate
 * @param tags - Tags array to validate
 * @param validationErrors - Array to accumulate validation error messages
 */
export function validateMemeFields(meme_title: string | undefined, tags: string[] | undefined, validationErrors: string[]) {
    console.log('running validation')
    console.log(meme_title,tags,validationErrors);
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
            if (tag.length < 1 || tag.length > 20 ){
                validationErrors.push(MEME_ERROR_MESSAGES.INVALID_TAG_LENGTH);
            }
            if( !/^[A-Za-z0-9\s-]+$/.test(tag)) {
                validationErrors.push(MEME_ERROR_MESSAGES.INVALID_TAG);
            }
        }
    }
}

/**
 * Helper function to check required fields for meme creation
 * @param user_id - User ID to validate
 * @param meme_title - Meme title to validate
 * @param image_url - Image URL to validate
 * @param tags - Tags array to validate
 * @param errors - Array to accumulate error messages
 */
function checkRequiredFields(
    meme_title: string | undefined, 
    tags: string[] | undefined, 
    media_file:File | undefined ,
    errors: string[]
) {
    if (!meme_title) errors.push(MEME_ERROR_MESSAGES.MISSING_MEME_TITLE);
    if (!tags || tags.length === 0) errors.push(MEME_ERROR_MESSAGES.MISSING_TAGS);
    if(!media_file) errors.push(MEME_ERROR_MESSAGES.MISSING_MEDIA_FILE)
}
