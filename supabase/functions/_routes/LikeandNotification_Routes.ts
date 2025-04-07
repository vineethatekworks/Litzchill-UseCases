import likememe from "@handler/_likes_module/LikeMeme.ts";
import unlikememes from "@handler/_likes_module/UnlikeMeme.ts";
import getNotifications from "@handler/_notifications_module/GetNotifications.ts";
import markNotification from "@handler/_notifications_module/markNotifications.ts";
import { checkUserAuthentication } from "@middleware/middlerWare.ts";
import { HTTP_METHOD } from "@shared/_constants/HttpMethods.ts";
import { USER_ROLES } from "@shared/_constants/UserRoles.ts";
import { LIKES_ROUTES, NOTIFICATION_ROUTES } from "./RoutesPaths.ts";

export const like_And_NotifyRoutes = {
    [HTTP_METHOD.POST]: {
        [LIKES_ROUTES.LIKE_MEME_PATH]: checkUserAuthentication(likememe, [
            USER_ROLES.ADMIN_ROLE,
            USER_ROLES.USER_ROLE,
            USER_ROLES.MEMER_ROLE,
            USER_ROLES.VIEWER_ROLE
        ]),
    },
    [HTTP_METHOD.DELETE]: {
        [LIKES_ROUTES.UNLIK_MEME_PATH]: checkUserAuthentication(unlikememes, [
            USER_ROLES.ADMIN_ROLE,
            USER_ROLES.USER_ROLE,
            USER_ROLES.MEMER_ROLE,
            USER_ROLES.VIEWER_ROLE
        ]),
    },
    [HTTP_METHOD.GET]: {
        [NOTIFICATION_ROUTES.GET_NOTIFICATION_PATH]: checkUserAuthentication(getNotifications, [
            USER_ROLES.ADMIN_ROLE,
            USER_ROLES.USER_ROLE,
            USER_ROLES.MEMER_ROLE,
            USER_ROLES.VIEWER_ROLE
        ]),
    },
    [HTTP_METHOD.PATCH]: {
        [NOTIFICATION_ROUTES.MARK_NOTIFICATION_ROUTE]: checkUserAuthentication(markNotification, [
            USER_ROLES.ADMIN_ROLE,
            USER_ROLES.USER_ROLE,
            USER_ROLES.MEMER_ROLE,
            USER_ROLES.VIEWER_ROLE
        ]),
    },
}