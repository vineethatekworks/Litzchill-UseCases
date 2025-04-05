import { V4 } from "@V4";
import { updateMemeStatusQuery  } from "@repository/_meme_repo/MemeRepository.ts";
import { ErrorResponse, SuccessResponse } from "@response/Response.ts";
import { HTTP_STATUS_CODE } from "@shared/_constants/HttpStatusCodes.ts";
import { MEME_ERROR_MESSAGES, MEME_SUCCESS_MESSAGES } from "@shared/_messages/Meme_Module_Messages.ts";
import { COMMON_ERROR_MESSAGES } from "@shared/_messages/ErrorMessages.ts";
import { MEMEFIELDS } from "@shared/_db_table_details/MemeTableFields.ts";
import { MEME_STATUS } from "@shared/_constants/Types.ts";
import Logger from "@shared/Logger/logger.ts";

export default async function updateMemeStatus(req: Request, params: Record<string, string>, updateMemeStatusQueryFn = updateMemeStatusQuery) {
    const logger = Logger.getInstance();
  try {
      const meme_id = params.id;
      const user_id = params.user_id;

      logger.info(`Received parameters: meme_id=${meme_id}, user_id=${user_id}`);

      // Validate `meme_id`
      if (!meme_id || !V4.isValid(meme_id)) {
          logger.error("Validation failed: Invalid or missing meme_id.");
          return ErrorResponse(HTTP_STATUS_CODE.BAD_REQUEST, MEME_ERROR_MESSAGES.MISSING_MEMEID);
      }

      // Parse request body
      const body = await req.json();
      const meme_status = body[MEMEFIELDS.MEME_STATUS];
      if (!meme_status) {
          logger.error("Validation failed: Missing meme_status.");
          return ErrorResponse(HTTP_STATUS_CODE.BAD_REQUEST, MEME_ERROR_MESSAGES.MISSING_STATUS_VALUE);
      }

      // Validate `meme_status`
      const validStatuses = [MEME_STATUS.APPROVED,MEME_STATUS.REJECTED];
      if (!validStatuses.includes(meme_status)) {
          logger.error("Validation failed: Invalid meme_status value.");
          return ErrorResponse(HTTP_STATUS_CODE.BAD_REQUEST, COMMON_ERROR_MESSAGES.INVALID_DATA);
      }

      // Update meme status
      const { data: updatedMemeStatus, error } = await updateMemeStatusQueryFn(meme_id, meme_status,user_id);
      if (error || !updatedMemeStatus) {
          logger.error("Database update failed:"+ error);
          return ErrorResponse(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, MEME_ERROR_MESSAGES.FAILED_TO_UPDATE);
      }

      console.log("Meme status updated successfully:", updatedMemeStatus);

    //   // Notify user if the meme is rejected
    //       logger.info("Preparing notification for meme status...");
    //       const type = NOTIFICATION_TYPES.ENGAGEMENT;

    //       const notify = await addNotifications(user_id,updatedMemeStatus.meme_title,type,updatedMemeStatus.meme_status);
    //       if (!notify) {
    //           logger.error("Failed to notify meme owner.");
    //       } else {
    //           logger.info("Notification sent successfully.");
    //       }
      // Success response
      return SuccessResponse( HTTP_STATUS_CODE.OK,MEME_SUCCESS_MESSAGES.MEME_STATUS_UPDATED_SUCCESSFULLY);

  } catch (error) {
      logger.error("Unexpected error in updateMemeStatus:"+ error);
      return ErrorResponse(
          HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
          COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR
      );
  }
}

