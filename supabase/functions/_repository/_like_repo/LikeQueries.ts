// deno-lint-ignore-file
import supabase from "@shared/_config/DbConfig.ts";
import { LIKE_TABLE_FIELDS } from "@shared/_db_table_details/LikeTableFields.ts";
import { TABLE_NAMES } from "@shared/_db_table_details/TableNames.ts";
import Logger from "@shared/Logger/logger.ts";
import { HTTP_STATUS_CODE } from "@shared/_constants/HttpStatusCodes.ts";
import { LIKE_ERROR } from "@shared/_messages/LikeMessage.ts";
import { throwException } from "@shared/ExceptionHandling/ThrowException.ts";

 const logger = Logger.getInstance();

/**
 * Function to insert a like for a meme.
 * 
 * @param meme_id - The unique identifier of the meme.
 * @param user_id - The unique identifier of the user.
 * @param likeable_type - The type of likeable entity (e.g., meme).
 * @returns {Promise<object | null>} - The inserted like data if successful, or null if not inserted or an error occurs.
 */

export async function insertLikeQuery( meme_id: string, user_id: string, likeable_type: string, supabaseClient = supabase): Promise<object | null> {
  const { data, error } = await supabaseClient
      .from("likes")
      .upsert(
          [{ meme_id, user_id, likeable_type, created_at: new Date().toISOString() }],
          { onConflict: "meme_id, user_id" } // Conflict resolution based on meme_id and user_id
      );

  error && throwException(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, error.message || LIKE_ERROR.INSERTION_FAILED);

  return data;
}

  
/**
 * Function to unlike a meme.
 * 
 * @param meme_id - The unique identifier of the meme.
 * @param user_id - The unique identifier of the user.
 * @returns {Promise<boolean>} - Returns true if successful, or false if there’s an error.
 */
export async function unlikememe(meme_id: string, user_id: string, supabaseClient = supabase): Promise<boolean> {
  
  const { data, error } = await supabaseClient
    .from(TABLE_NAMES.LIKES_TABLE)
    .delete()
    .eq(LIKE_TABLE_FIELDS.USER_ID, user_id)
    .eq(LIKE_TABLE_FIELDS.MEME_ID, meme_id)
    .select(); 

  error ||  data?.length === 0 && throwException(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, error || LIKE_ERROR.UNLIKE_FAILED);

  logger.info(`Meme ${meme_id} successfully unliked by user ${user_id}`);
  return true;
}


