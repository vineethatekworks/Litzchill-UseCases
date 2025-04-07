// deno-lint-ignore-file
import supabase from "@shared/_config/DbConfig.ts";
import { LIKE_TABLE_FIELDS } from "@shared/_db_table_details/LikeTableFields.ts";
import { TABLE_NAMES } from "@shared/_db_table_details/TableNames.ts";
import Logger from "@shared/Logger/logger.ts";

 const logger = Logger.getInstance();

/**
 * Function to insert a like for a meme.
 * 
 * @param meme_id - The unique identifier of the meme.
 * @param user_id - The unique identifier of the user.
 * @param likeable_type - The type of likeable entity (e.g., meme).
 * @returns {Promise<{ data: object | null, error: object | null }>} - The inserted like data if successful, or null if not inserted or an error occurs.
 */

export async function insertLikeQuery(
    meme_id: string, 
    user_id: string, 
    likeable_type: string, supabaseClient = supabase
  ): Promise<{ data: object | null, error: object | null }> {
    const { data, error } = await supabaseClient
      .from('likes')
      .upsert(
        [{ meme_id, user_id, likeable_type, created_at: new Date().toISOString() }],
        { onConflict: 'meme_id, user_id' }
      );
    if (error) return { data: null, error };
    
    return { data, error: null };
  }
  
  
/**
 * Function to unlike a meme.
 * 
 * @param meme_id - The unique identifier of the meme.
 * @param user_id - The unique identifier of the user.
 * @returns {Promise<boolean>} - Returns true if successful, or false if there’s an error.
 */
export async function unlikememe(meme_id: string, user_id: string, supabaseClient = supabase): Promise<boolean|string> {
  const { data, error } = await supabaseClient
      .from(TABLE_NAMES.LIKES_TABLE)
      .delete()
      .eq(LIKE_TABLE_FIELDS.USER_ID, user_id)
      .eq(LIKE_TABLE_FIELDS.MEME_ID, meme_id);

    if (error || !data) return false;

    return true;
}

