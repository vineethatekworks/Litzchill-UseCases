import { getNotificationsQuery } from "@repository/_notifications_repo/NotificationsQueries.ts";
import { ErrorResponse, SuccessResponse } from "@response/Response.ts";
import { HTTP_STATUS_CODE } from "@shared/_constants/HttpStatusCodes.ts";
import { COMMON_ERROR_MESSAGES } from "@shared/_messages/ErrorMessages.ts";
import { NOTIFICATION_ERRORS, NOTIFICATION_SUCCESS } from "@shared/_messages/NotificationMessages.ts";
import Logger from "@shared/Logger/logger.ts";

/**
 * Fetches all notifications for a user.
 *
 * @param {Request} _req - The HTTP request object. Not used in this function.
 * @param {Record<string, string>} params - URL parameters containing the user ID.
 * @param {function} [getNotifications=getNotificationsQuery] - The function to call for fetching notifications from the database.
 * @returns {Promise<Response>} - The response object containing the status and notifications data, or an error message if the operation fails.
 *
 * @throws {Error} - If an error occurs during the fetch operation, such as:
 *   - Invalid or missing user ID.
 *   - No notifications found.
 *   - Internal server error.
 */
export default async function getNotifications(_req: Request, params: Record<string, string>, getNotifications=getNotificationsQuery): Promise<Response> {
    const logger = Logger.getInstance();
    try {
        const user_id = params.user_id;

        const { data: notifications, error } = await getNotifications(user_id);

        if (error)  return ErrorResponse(HTTP_STATUS_CODE.BAD_REQUEST, NOTIFICATION_ERRORS.FAILED_TO_FETCH);
        if (!notifications || notifications.length === 0)  return ErrorResponse(HTTP_STATUS_CODE.OK, NOTIFICATION_SUCCESS.NO_NOTIFICATIONS);
        
        return SuccessResponse(HTTP_STATUS_CODE.OK, NOTIFICATION_SUCCESS.NOTIFICATIONS_FETCHED, notifications);
    } 
    catch (error) {
        logger.error("Error updating meme:"+ error);
        return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
}
