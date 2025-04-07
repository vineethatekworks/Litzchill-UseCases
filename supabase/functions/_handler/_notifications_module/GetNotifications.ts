import { getNotificationsQuery } from "@repository/_notifications_repo/NotificationsQueries.ts";
import { SuccessResponse } from "@response/Response.ts";
import { HTTP_STATUS_CODE } from "@shared/_constants/HttpStatusCodes.ts";
import { NOTIFICATION_SUCCESS } from "@shared/_messages/NotificationMessages.ts";
import Logger from "@shared/Logger/logger.ts";
import GlobalExceptionHandler from "@shared/ExceptionHandling/GlobalExceptionHandler.ts";
/**
 * Fetches notifications for a user.
 * 
 * @param {Request} req - The request object, containing the necessary parameters and headers.
 * @param {Record<string, string>} params - The route parameters, including the user_id of the requesting user.
 * @returns {Promise<Response>} - A promise that resolves with the appropriate response object: success or error.
 */
 async function getNotifications(_req: Request, params: Record<string, string>, getNotifications=getNotificationsQuery): Promise<Response> {
    const logger = Logger.getInstance();
        const user_id = params.user_id;
        
        // Fetch notifications for the user
        logger.info(`Fetching notifications for user: ${user_id}`);
        const notifications = await getNotifications(user_id);
        logger.info("Notifications fetched successfully."+JSON.stringify(notifications));
        return SuccessResponse(HTTP_STATUS_CODE.OK, NOTIFICATION_SUCCESS.NOTIFICATIONS_FETCHED, notifications);
}

export default GlobalExceptionHandler.handle(getNotifications);