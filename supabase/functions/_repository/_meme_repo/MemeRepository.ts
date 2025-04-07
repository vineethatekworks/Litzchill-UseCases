// deno-lint-ignore-file
import supabase from "@shared/_config/DbConfig.ts";
import { BUCKET_NAME, TABLE_NAMES } from "@shared/_db_table_details/TableNames.ts";
import { MEMEFIELDS } from '@shared/_db_table_details/MemeTableFields.ts';
import { Meme } from '@model/MemeModel.ts';
import { USER_ROLES } from "@shared/_constants/UserRoles.ts";
import { MEME_STATUS } from '@shared/_constants/Types.ts';
import Logger from "@shared/Logger/logger.ts";
import { HTTP_STATUS_CODE } from "@shared/_constants/HttpStatusCodes.ts";
import { throwException } from "@shared/ExceptionHandling/ThrowException.ts";
import { MEME_ERROR_MESSAGES } from "@shared/_messages/Meme_Module_Messages.ts";

const logger = Logger.getInstance();

export async function meme_exists(meme_id: string, supabaseClient = supabase) {
    // Check if meme exists and ensure it's not deleted
    const { data: existingMeme, error: fetchError } = await supabaseClient
        .from(TABLE_NAMES.MEME_TABLE)
        .select("*")
        .eq(MEMEFIELDS.MEME_ID, meme_id)
        .neq(MEMEFIELDS.MEME_STATUS, MEME_STATUS.DELETED)
        .single();
    logger.info(existingMeme + " " + fetchError);

    return existingMeme || throwException(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, MEME_ERROR_MESSAGES.MEME_NOT_FOUND);
}


/**
 * Uploads a file to the Supabase storage bucket
 * @param mediaFile The file to be uploaded
 * @param memeTitle The title of the meme to be used in the file name
 * @param supabaseClient The Supabase client to use
 * @returns The public URL of the uploaded file
 * @throws {Error} If the upload fails
 */
export async function uploadFileToBucket(mediaFile: File, memeTitle: string, supabaseClient = supabase): Promise<string> {
    logger.log("Uploading media file");

    const allowedTypes: string[] = ["image/jpeg", "image/png", "image/gif", "video/mp4", "video/avi", "video/mpeg"];
    !allowedTypes.includes(mediaFile.type) && throwException(HTTP_STATUS_CODE.BAD_REQUEST, MEME_ERROR_MESSAGES.UNSUPPORTED_FILE_TYPE);


    // Constructing file path using the filename
    const extension = mediaFile.name.split('.').pop()?.toLowerCase() || "";
    const sanitizedFileName = `${memeTitle.replace(/\s+/g, "_")}-${Date.now()}.${extension}`;
    const filePath = `memes/${sanitizedFileName}`;

    // Upload new file
    logger.log("Uploading file...");
    const {error: uploadError } = await supabaseClient.storage
        .from(BUCKET_NAME.MEMES)
        .upload(filePath, mediaFile, {
            cacheControl: "3600",
            upsert: false,
            contentType: mediaFile.type,
        });

    uploadError && throwException(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, uploadError.message || MEME_ERROR_MESSAGES.MEDIA_UPLOAD_FAILED);


    logger.log("File uploaded successfully.");

    // Get the public URL of the uploaded file
    const { data: publicUrlData } = supabaseClient.storage.from(BUCKET_NAME.MEMES).getPublicUrl(filePath);
    return publicUrlData?.publicUrl || throwException(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, MEME_ERROR_MESSAGES.PUBLIC_URL_FAILED);
}



/**
 * Inserts a new meme into the database.
 * 
 * @param {Partial<Meme>} meme - The meme object containing the title, image URL, and tags.
 * @param {string} user_id - The unique identifier of the user creating the meme.
 * @returns {Promise<{ data: object | null, error: object | null }>} - The inserted meme data if successful; otherwise, an error.
 */
export async function createMemeQuery(meme: Partial<Meme>, supabaseClient = supabase): Promise<{ data: object | null}> {
    const { data } = await supabaseClient
        .from(TABLE_NAMES.MEME_TABLE)
        .insert([{
            user_id: meme.user_id,
            meme_title: meme.meme_title,
            image_url: meme.media_file,
            tags: meme.tags,
        }])
        .select("*")
        .single();

        return data || throwException(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, MEME_ERROR_MESSAGES.FAILED_TO_CREATE);
    }


/**
 * Updates a meme in the database based on the provided data and user role.
 * 
 * @param {Partial<Meme>} meme - The partial meme object containing the fields to update.
 * @param {string} user_type - The role of the user performing the update.
 * @returns {Promise<{ data: object | null, error: object | null }>} - The updated meme data if successful; otherwise, an error.
 * 
 * @throws {Error} - If an error occurs during the update operation.
 */
export async function updatememeQuery(
    meme: Partial<Meme>,
    user_type: string,
    supabaseClient = supabase
): Promise<object> {
    const isAdmin = user_type === USER_ROLES.ADMIN_ROLE;
    const conditions = isAdmin
        ? { [MEMEFIELDS.MEME_ID]: meme.meme_id }
        : { [MEMEFIELDS.MEME_ID]: meme.meme_id, [MEMEFIELDS.USER_ID]: meme.user_id };


    console.log("Update conditions:", conditions);


    const { data } = await supabaseClient
        .from(TABLE_NAMES.MEME_TABLE)
        .update(meme)
        .neq(MEMEFIELDS.MEME_STATUS, MEME_STATUS.DELETED)
        .match(conditions)
        .select("meme_id, meme_title, tags, updated_at")
        .single();    


    return data || throwException(HTTP_STATUS_CODE.NOT_FOUND, MEME_ERROR_MESSAGES.FAILED_TO_UPDATE);
}



/**
 * Deletes a meme by updating its status to 'DELETED' in the database.
 * 
 * @param {string} meme_id - The unique identifier of the meme to be deleted.
 * @param {string} user_id - The unique identifier of the user attempting to delete the meme.
 * @param {string} user_type - The role of the user (e.g., admin, user) performing the deletion.
 * @param {object} supabaseClient - The Supabase client instance for database operations.
 * @returns {Promise<object | null>} - The deleted meme data if successful; otherwise, throws an error.
 * 
 * @throws {Error} - If an error occurs during the deletion process, such as forbidden access, 
 *                   not found, conflict, or internal server error.
 */
export async function deleteMemeQuery(meme_id: string, user_id: string, user_type: string, supabaseClient = supabase) {
    const isAdmin = user_type === USER_ROLES.ADMIN_ROLE;
    const conditions = isAdmin ? { [MEMEFIELDS.MEME_ID]: meme_id }: { [MEMEFIELDS.MEME_ID]: meme_id, [MEMEFIELDS.USER_ID]: user_id };

    const { data } = await supabaseClient
        .from(TABLE_NAMES.MEME_TABLE)
        .update({ meme_status: MEME_STATUS.DELETED })
        .neq(MEMEFIELDS.MEME_STATUS, MEME_STATUS.DELETED)
        .match(conditions)
        .select("meme_id, meme_status")
        .single();

    return data || throwException(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, MEME_ERROR_MESSAGES.FAILED_TO_DELETE);
}


/**
  * Fetches memes that are not deleted and optionally filters them by tags.
  * The memes are ordered by creation date or popularity (based on the `sort` parameter).
  * 
  * @param {number} page - The current page number for pagination.
  * @param {number} limit - The number of memes to fetch per page.
  * @param {string} sort - The sorting order. Can be 'popular' or 'created_at'.
  * @param {string | null} tags - A comma-separated string of tags to filter memes by, or null for no tag filter.
  * @returns {Promise<{ data: object[] | null, error: object | null }>} - A promise that resolves with an array of memes or an error.
  */
export async function fetchMemes(page: number, limit: number, sort: string, tags: string | null, supabaseClient = supabase):Promise< object[] > {
    // Subquery to fetch public users
    const { data: publicUsers, error: publicUsersError } = await supabaseClient
        .from("users")
        .select("user_id,preferences")
        .eq("preferences", "Public");


    if (publicUsersError || !publicUsers) throwException(HTTP_STATUS_CODE.NOT_FOUND,MEME_ERROR_MESSAGES.NO_MEMES);
    

    // Use map() to create an array of public user IDs
    const publicUserIds = publicUsers.map(function (user: { user_id: any; }) {
        return user.user_id; 
    });

    // Base query to fetch memes
    console.log("Query to fetch memes ")
    let query = supabaseClient
        .from("memes")
        .select("meme_id, user_id, meme_title, image_url, like_count, tags, created_at")
        .eq(MEMEFIELDS.MEME_STATUS, MEME_STATUS.APPROVED)
        .in("user_id", publicUserIds)
        .order(sort === "popular" ? "like_count" : "created_at", { ascending: false })

    // Filter by tags if provided
    console.log("Filter by tags")
    if (tags) {
        const tagArray = tags.split(",").map(tag => tag.trim());
        query = query.contains("tags", JSON.stringify(tagArray));
    }
    // Paginate the results
    console.log("pagination")
    query = query.range((page - 1) * limit, page * limit - 1);


    const { data ,error} = await query;

    if (error || !data || data.length === 0) throwException(HTTP_STATUS_CODE.NOT_FOUND, MEME_ERROR_MESSAGES.NO_MEMES);
    
    return data;
}

/**
 * Fetches a meme by its ID.
 * 
 * @param {string} meme_id - The unique identifier of the meme.
 * @returns {{ data: object | null, error: object | null }} - The meme data for given ID or an error object.
 */
export async function getMemeByIdQuery(meme_id: string, user_id: string, supabaseClient = supabase) {
    // Step 1: Fetch meme details (ensure it returns at most 1 row)
    console.log("Attempting to fetch meme by ID: " + meme_id);
    const { data: memeData, error: memeError } = await supabaseClient
        .from(TABLE_NAMES.MEME_TABLE)
        .select("meme_title, image_url, tags, like_count, created_at, user_id")
        .neq(MEMEFIELDS.MEME_STATUS, MEME_STATUS.DELETED)
        .eq(MEMEFIELDS.MEME_ID, meme_id)
        .single();
    console.log("Fetched meme data: " + JSON.stringify(memeData));

    memeError || !memeData && throwException(HTTP_STATUS_CODE.NOT_FOUND, MEME_ERROR_MESSAGES.MEME_NOT_FOUND);


    const memeOwnerId = memeData?.user_id;

    // Step 2: Check if the user's account is private
    const { data: userData, error: userError } = await supabaseClient
        .from(TABLE_NAMES.USER_TABLE)
        .select("preferences")
        .eq("user_id", memeOwnerId)
        .limit(1)
        .single();

    console.log("Fetched user data: " + JSON.stringify(userData));

    !userData|| userError  && throwException(HTTP_STATUS_CODE.NOT_FOUND, "Meme owner not found");
  

    const isPrivate = userData?.preferences === "Private";

    // Step 3: If account is private, check if the requester is a follower
    if (isPrivate) {
        const { data: followerData, error: followerError } = await supabaseClient
            .from(TABLE_NAMES.FOLLOWERS_TABLE)
            .select("follower_id")
            .eq("follower_id", user_id)
            .eq("user_id", memeOwnerId)
            .limit(1);

        followerError || !followerData?.length && throwException(HTTP_STATUS_CODE.FORBIDDEN, "Access denied: User " + user_id + " is not following private user " + memeOwnerId);
    }

    // Step 4: Return meme details if access is allowed
    return memeData;
}


/**
 * Updates the status of a meme.
 * 
 * @param {string} meme_id - The unique identifier of the meme.
 * @param {string} meme_status - The new status of the meme.
 * @returns {{ data: object | null, error: object | null }} - The updated meme data or an error object.
 */
export async function updateMemeStatusQuery(
    meme_id: string,
    meme_status: string,
    user_id: string,
    supabaseClient = supabase
): Promise< object> {
    const { data, error } = await supabaseClient
        .from(TABLE_NAMES.MEME_TABLE)
        .update({ meme_status: meme_status })
        .eq(MEMEFIELDS.MEME_ID, meme_id)
        .eq(MEMEFIELDS.USER_ID, user_id)
        .neq(MEMEFIELDS.MEME_STATUS, MEME_STATUS.DELETED)
        .select("meme_id, meme_status, meme_title")
        .single();

        console.log(error);

        return data || throwException(HTTP_STATUS_CODE.NOT_FOUND, MEME_ERROR_MESSAGES.FAILED_TO_UPDATE);
}
