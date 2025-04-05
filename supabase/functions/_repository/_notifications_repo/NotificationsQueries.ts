// deno-lint-ignore-file
import supabase from "@shared/_config/DbConfig.ts";
import { MEME_STATUS } from "@shared/_constants/Types.ts";
import { NOTIFICATIONS_TABLE_FEILDS } from "@shared/_db_table_details/NotificationTableConstants.ts";
import { TABLE_NAMES } from "@shared/_db_table_details/TableNames.ts";
import Logger from "@shared/Logger/logger.ts";

const logger = Logger.getInstance();
 
// /**
//  * Function to add a like notification to the notifications list.
//  * 
//  * @param user_id - The unique identifier of the user.
//  * @param meme_title - The title of the meme.
//  * @param type - The type of notification.
//  * @param status - The status of the meme (e.g., "approved", "rejected").
//  * @returns {Promise<object | null>} - Returns the created notification data or null if an error occurs.
//  */
// export async function addNotifications( user_id: string,meme_title: string, type: string, status: string): Promise<object | null> {
//     // Map status to human-readable text
//     const statusTextMap: Record<string, string> = {
//         [MEME_STATUS.REJECTED]: "rejected",
//         [MEME_STATUS.APPROVED]: "approved",
//     };
//     const readableStatus = statusTextMap[status] || status;

//     const notificationContent = `Your meme ${meme_title} has been ${readableStatus}.`;
//     logger.log("Notification content:"+ notificationContent);

//     const { data, error } = await supabase
//         .from(TABLE_NAMES.NOTIFICATIONS_TABLE)
//         .insert({
//             user_id: user_id,
//             content: notificationContent,
//             type: type,
//             created_at: new Date().toISOString(),
//             read_status: false,
//         })
//         .select("*");

//     if (error || !data) {
//         logger.error("Error adding notification:"+ error);
//         return null;
//     }
//     return data;
// }


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
export async function markNotificationsAsReadQuery(notification_id: string, user_id: string, SupabaseClient=supabase): Promise<boolean|String> {
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


