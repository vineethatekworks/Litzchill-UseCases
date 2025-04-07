// deno-lint-ignore-file
import supabase from "@shared/_config/DbConfig.ts";
import { BUCKET_NAME, TABLE_NAMES } from "@shared/_db_table_details/TableNames.ts";
import { MEMEFIELDS } from '@shared/_db_table_details/MemeTableFields.ts';
import { Meme } from '@model/MemeModel.ts';
import { USER_ROLES } from "@shared/_constants/UserRoles.ts";
import { MEME_STATUS } from '@shared/_constants/Types.ts';
import Logger from "@shared/Logger/logger.ts";

const logger = Logger.getInstance();

export async function meme_exists(meme_id: string, supabaseClient = supabase) {
    const { data: existingMeme, error: fetchError } = await supabaseClient
        .from(TABLE_NAMES.MEME_TABLE)
        .select("*")
        .eq(MEMEFIELDS.MEME_ID, meme_id)
        .neq(MEMEFIELDS.MEME_STATUS,MEME_STATUS.DELETED)
        .single();

    if (fetchError || !existingMeme)  return null;
    return existingMeme;
}

/**
 * Uploads a file (image or video) to the specified bucket.
 * 
 * @param {File} mediaFile - The file object to be uploaded.
 * @param {string} memeTitle - The title of the meme associated with the file.
 * @returns {Promise<string | null>} - The public URL of the uploaded file, if successful; otherwise, null.
 */
export async function uploadFileToBucket(mediaFile: File, memeTitle: string, supabaseClient = supabase): Promise<string | null> {
    logger.log("Uploading media file");
 
    try {
        const allowedTypes: string[] = ["image/jpeg", "image/png", "image/gif", "video/mp4", "video/avi", "video/mpeg"];
        if (!allowedTypes.includes(mediaFile.type))  return null
 
        // Construct file path using the original filename
        const extension = mediaFile.name.split('.').pop()?.toLowerCase() || "";
        const sanitizedFileName = `${memeTitle.replace(/\s+/g, "_")}-${Date.now()}.${extension}`;
        const filePath = `memes/${sanitizedFileName}`;
 
        // Upload new file
        logger.log("Uploading file...");
        const { data: uploadData, error: uploadError } = await supabaseClient.storage
            .from(BUCKET_NAME.MEMES)
            .upload(filePath, mediaFile, {
                cacheControl: "3600",
                upsert: false, 
                contentType: mediaFile.type,
            });
 
        if (uploadError || !uploadData) return null;
 
        logger.log("File uploaded successfully.");
 
        // Get the public URL of the uploaded file
        const { data: publicUrlData } = supabaseClient.storage.from(BUCKET_NAME.MEMES).getPublicUrl(filePath);
        return publicUrlData?.publicUrl || null;
 
    } catch (error) {
        logger.error(`Error in uploadFileToBucket: ${error}`);
        return null;
    }
}

/**
 * Inserts a new meme into the database.
 * 
 * @param {Partial<Meme>} meme - The meme object containing the title, image URL, and tags.
 * @param {string} user_id - The unique identifier of the user creating the meme.
 * @returns {Promise<{ data: object | null, error: object | null }>} - The inserted meme data if successful; otherwise, an error.
 */
export async function createMemeQuery(meme: Partial<Meme>,supabaseClient = supabase): Promise<{ data: object | null, error: object | null }> {
    const { data, error } = await supabaseClient
        .from(TABLE_NAMES.MEME_TABLE)
        .insert({
            user_id: meme.user_id,
            meme_title: meme.meme_title,
            image_url: meme.media_file,
            tags: meme.tags,
        })
        .select("*")
        .single();

        return { data, error };
}

/**
 * Updates an existing meme in the database.
 * 
 * The function checks if a meme with the given `meme_id` exists and updates it with the provided data.
 * If the meme doesn't exist or the conditions (e.g., deleted or rejected status) are not met, it returns null.
 * 
 * @param {Partial<Meme>} meme - The partial meme object containing the fields to update (e.g., title, tags, etc.).
 * @param {string} meme_id - The unique identifier of the meme to be updated.
 * @returns {Promise<{ data: object | null, error: object | null }>} - A promise that resolves with the updated meme data or an error.
 */
export async function updatememeQuery(meme: Partial<Meme>,user_type: string,supabaseClient = supabase ): Promise<{ data: object | null; error: object | null }> {
    const isAdmin = user_type === USER_ROLES.ADMIN_ROLE;
    const conditions = isAdmin
      ? { [MEMEFIELDS.MEME_ID]: meme.meme_id }
      : { [MEMEFIELDS.MEME_ID]: meme.meme_id, [MEMEFIELDS.USER_ID]: meme.user_id };
    
    const { data, error } = await supabaseClient 
      .from(TABLE_NAMES.MEME_TABLE)
      .update(meme)
      .neq(MEMEFIELDS.MEME_STATUS, MEME_STATUS.DELETED)
      .match(conditions)
      .select("meme_id, meme_title, tags, updated_at")
      .single();  
    return { data, error };
  }
  

/**
 * Soft delete a meme by updating its status to "deleted".
 * Ensures that the user_id matches if the role is not admin.
 * 
 * @param {string} meme_id - The ID of the meme to delete.
 * @param {string} user_id - The ID of the user attempting to delete.
 * @param {string} role - The role of the user (e.g., admin, memer).
 * 
 * @returns {Promise<{ data: object | null, error: object | null }>} - The result of the query.
 */
export async function deleteMemeQuery( meme_id: string, user_id: string, user_type: string,supabaseClient = supabase):Promise<{ data: object | null, error: object | null }> {
    const isAdmin = user_type === USER_ROLES.ADMIN_ROLE;
    const conditions = isAdmin
      ? { [MEMEFIELDS.MEME_ID]: meme_id }
      : { [MEMEFIELDS.MEME_ID]: meme_id, [MEMEFIELDS.USER_ID]: user_id };
  
    const { data, error } = await supabaseClient
      .from(TABLE_NAMES.MEME_TABLE)
      .update({ meme_status: MEME_STATUS.DELETED })
      .neq(MEMEFIELDS.MEME_STATUS, MEME_STATUS.DELETED)
      .match(conditions)
      .select("meme_id, meme_status")
      .single();
      return { data, error };
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
export async function fetchMemes(page: number,limit: number,sort: string,tags: string | null,supabaseClient = supabase): 
                                Promise<{ data: object[] | null, error: object | null }> {
    // Subquery to fetch public users
    const { data: publicUsers, error: publicUsersError } = await supabaseClient
        .from("users")
        .select("user_id,preferences")
        .eq("preferences", "Public");

    if (publicUsersError || !publicUsers)  return { data: null, error: publicUsersError };

    // Use map() to create an array of public user IDs
    const publicUserIds = publicUsers.map(function(user: { user_id: any; }) {
                                                 return user.user_id; // For each user, return their user_id
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


    const { data, error } = await query;

    if (error) return { data: null, error };

    console.log("Memes fetched successfully"+data);
    return { data, error: null };
}


/**
 * Fetches a meme by its ID.
 * 
 * @param {string} meme_id - The unique identifier of the meme.
 * @returns {{ data: object | null, error: object | null }} - The meme data for given ID or an error object.
 */
export async function getMemeByIdQuery(meme_id: string, user_id: string,supabaseClient = supabase) {
    // Step 1: Fetch meme details (ensure it returns at most 1 row)
    const { data: memeData, error: memeError } = await supabaseClient
        .from(TABLE_NAMES.MEME_TABLE)
        .select("meme_title, image_url, tags, like_count, created_at, user_id")
        .neq(MEMEFIELDS.MEME_STATUS, MEME_STATUS.DELETED)
        .eq(MEMEFIELDS.MEME_ID, meme_id)
        .single();  

    if (memeError || !memeData)         return { data: null, error:"Meme not found" };

    const memeOwnerId = memeData.user_id;

    // Step 2: Check if the user's account is private
    const { data: userData, error: userError } = await supabaseClient
        .from(TABLE_NAMES.USER_TABLE)
        .select("preferences")
        .eq("user_id", memeOwnerId)
        .limit(1)  
        .single(); 

    if (userError || !userData) return { data: null, error: userError?.message || "Meme owner not found" };

    const isPrivate = userData.preferences === "Private";

    // Step 3: If account is private, check if the requester is a follower
    if (isPrivate) {
        const { data: followerData, error: followerError } = await supabaseClient
            .from(TABLE_NAMES.FOLLOWERS_TABLE)
            .select("follower_id")
            .eq("follower_id", user_id)
            .eq("user_id", memeOwnerId)
            .limit(1);  

        if (followerError || !followerData?.length)  return { data: null, error: "Access denied: This account is private." };    }

    // Step 4: Return meme details if access is allowed
    return { data: memeData, error: null };
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
 ): Promise<{ data: object | null, error: object | null }>
 {
    const { data, error } = await supabaseClient
        .from(TABLE_NAMES.MEME_TABLE)
        .update({ meme_status: meme_status})
        .eq(MEMEFIELDS.MEME_ID, meme_id)
        .eq(MEMEFIELDS.USER_ID,user_id)
        .neq(MEMEFIELDS.MEME_STATUS,MEME_STATUS.DELETED)
        .select("meme_id, meme_status, meme_title")
        .single(); 

    return { data, error };
}

