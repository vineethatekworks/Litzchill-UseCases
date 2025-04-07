// deno-lint-ignore-file
import supabase from "@shared/_config/DbConfig.ts";
import { NOTIFICATIONS_TABLE_FEILDS } from "@shared/_db_table_details/NotificationTableConstants.ts";
import { TABLE_NAMES } from "@shared/_db_table_details/TableNames.ts";
import Logger from "@shared/Logger/logger.ts";

const logger = Logger.getInstance();

/**
 * Function to get notifications of a user.
 * 
 * @param user_id - The unique identifier of the user.
 * @returns {{ data: object | null, error: object | null }} - The updated meme data or an error object.
 */
export async function getNotificationsQuery(user_id: string, SupabaseClient=supabase){
    const { data, error } = await SupabaseClient
        .from(TABLE_NAMES.NOTIFICATIONS_TABLE)
        .select("*")
        .eq(NOTIFICATIONS_TABLE_FEILDS.USER_ID, user_id)
        .order(NOTIFICATIONS_TABLE_FEILDS.CREATED_AT, { ascending: false })
        .limit(5);

    logger.log(data+" "+error);
    return { data, error };
}


/**
 * Function to mark notifications as read.
 * 
 * @param notification_id - The unique identifier of the notification.
 * @returns {Promise<boolean>} - Returns true if the notification was successfully marked as read, or false if there was an error.
 */
export async function markNotificationsAsReadQuery(notification_id: string, user_id: string, SupabaseClient=supabase): Promise<boolean|string> {
    const { data, error } = await SupabaseClient
        .from(TABLE_NAMES.NOTIFICATIONS_TABLE)
        .update({ read_status: true })
        .eq(NOTIFICATIONS_TABLE_FEILDS.NOTIFICATION_ID, notification_id)
        .eq(NOTIFICATIONS_TABLE_FEILDS.USER_ID, user_id)
        .select("notification_id"); // Select only required fields

    logger.log(`Mark Notification - Data: ${JSON.stringify(data)}, Error: ${JSON.stringify(error)}`);

    if (error) {
        logger.error(`Error marking notification as read: ${error.message}`);
        return false;
    }

    // Ensure data is not empty
    if (!data || data.length === 0) {
        logger.error("No rows updated. Notification not found or mismatch in user_id.");
        return false;
    }

    return true;
}


