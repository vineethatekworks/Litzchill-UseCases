import { getNotificationsQuery } from "@repository/_notifications_repo/NotificationsQueries.ts";
import { ErrorResponse, SuccessResponse } from "@response/Response.ts";
import { HTTP_STATUS_CODE } from "@shared/_constants/HttpStatusCodes.ts";
import { COMMON_ERROR_MESSAGES } from "@shared/_messages/ErrorMessages.ts";
import { NOTIFICATION_ERRORS, NOTIFICATION_SUCCESS } from "@shared/_messages/NotificationMessages.ts";
import Logger from "@shared/Logger/logger.ts";
/**
 * Fetches notifications for a user.
 * 
 * @param {Request} req - The request object, containing the necessary parameters and headers.
 * @param {Record<string, string>} params - The route parameters, including the user_id of the requesting user.
 * @returns {Promise<Response>} - A promise that resolves with the appropriate response object: success or error.
 */
export default async function getNotifications(_req: Request, params: Record<string, string>, getNotifications=getNotificationsQuery): Promise<Response> {
    const logger = Logger.getInstance();
    try {
        const user_id = params.user_id;
        logger.info(`Fetching notifications for user: ${user_id}`);
        // Fetch notifications for the user


        const { data: notifications, error } = await getNotifications(user_id);

        if (error) {
            logger.info("Fetching failed");
            return ErrorResponse(HTTP_STATUS_CODE.BAD_REQUEST, NOTIFICATION_ERRORS.FAILED_TO_FETCH);
        }

        if (!notifications || notifications.length === 0) {
            logger.info("No notifications found.");
            return ErrorResponse(HTTP_STATUS_CODE.OK, NOTIFICATION_SUCCESS.NO_NOTIFICATIONS);
        }

        logger.info("Notifications fetched successfully."+JSON.stringify(notifications));
        return SuccessResponse(HTTP_STATUS_CODE.OK, NOTIFICATION_SUCCESS.NOTIFICATIONS_FETCHED, notifications);
    } catch (error) {
        logger.error("Error updating meme:"+ error);
        return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
}
