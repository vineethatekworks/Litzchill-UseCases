import { V4 } from "@V4";
import { markNotificationsAsReadQuery } from "@repository/_notifications_repo/NotificationsQueries.ts";
import { SuccessResponse } from "@response/Response.ts";
import { HTTP_STATUS_CODE } from "@shared/_constants/HttpStatusCodes.ts";
import { NOTIFICATION_ERRORS, NOTIFICATION_SUCCESS } from "@shared/_messages/NotificationMessages.ts";
import Logger from "@shared/Logger/logger.ts";
import { throwException } from "@shared/ExceptionHandling/ThrowException.ts";
import GlobalExceptionHandler from "@shared/ExceptionHandling/GlobalExceptionHandler.ts";

/**
 * Marks a notification as read.
 * 
 * @param {Request} req - The request object containing the request details.
 * @param {Record<string, string>} params - The parameters from the URL, including the notification ID.
 * @returns {Promise<Response>} A promise that resolves to a success or error response based on the operation.
 */
 async function markNotification(_req: Request, params: Record<string, string>, markNotificationsAsRead = markNotificationsAsReadQuery): Promise<Response> {
       const logger = Logger.getInstance();
        const notification_id = V4.isValid(params.id) ? params.id : throwException(HTTP_STATUS_CODE.BAD_REQUEST, NOTIFICATION_ERRORS.MISSING_ID);
        const user_id = params.user_id;
        
        logger.info(`User_id: ${user_id}, Notification_id: ${notification_id}`);
        // Return a success response
        await markNotificationsAsRead(notification_id,user_id);
        return SuccessResponse(HTTP_STATUS_CODE.OK, NOTIFICATION_SUCCESS.NOTIFICATION_UPDATED);
}

export default GlobalExceptionHandler.handle(markNotification);