import createMeme from "@handler/_meme_module/CreateMeme.ts";
import { HTTP_METHOD } from "@shared/_constants/HttpMethods.ts";
import { MEME_ROUTES } from "./RoutesPaths.ts";
import { USER_ROLES } from '@shared/_constants/UserRoles.ts';
import { checkUserAuthentication } from "@middleware/middlerWare.ts";
import updateMeme from "@handler/_meme_module/UpateMeme.ts";
import getmemebyID from "../_handler/_meme_module/getMemeByID.ts";
import DeletememebyID from "@handler/_meme_module/DeleteMeme.ts";
import getAllMemes from "@handler/_meme_module/GetAllMemes.ts";
import updateMemeStatus from "@handler/_meme_module/UpdateMemeStatus.ts";



// Define your routes with role-based authorization
export const MemeRoutes = {
    [HTTP_METHOD.POST]: {
        [MEME_ROUTES.MEME_CREATE_PATH]: checkUserAuthentication(createMeme,[
            USER_ROLES.ADMIN_ROLE,
            USER_ROLES.USER_ROLE,
            USER_ROLES.MEMER_ROLE]
        ),
    },
    [HTTP_METHOD.PATCH]: {
        [MEME_ROUTES.MEME_UPDATE_PATH]: checkUserAuthentication(updateMeme, [
            USER_ROLES.ADMIN_ROLE,
            USER_ROLES.MEMER_ROLE
        ]),
        [MEME_ROUTES.MEME_UPDATE_STATUS_PATH]: checkUserAuthentication(updateMemeStatus, [
            USER_ROLES.ADMIN_ROLE,
        ]),

    }
    ,
    [HTTP_METHOD.GET]: {
        [MEME_ROUTES.MEME_GETTING_PATH]: checkUserAuthentication(getmemebyID, [
            USER_ROLES.ADMIN_ROLE,
            USER_ROLES.USER_ROLE ,
            USER_ROLES.MEMER_ROLE
         ]),
         [MEME_ROUTES.GETTING_ALL_MEMES_PATH]: checkUserAuthentication(getAllMemes, [
            USER_ROLES.ADMIN_ROLE,
            USER_ROLES.USER_ROLE ,
            USER_ROLES.MEMER_ROLE,
            USER_ROLES.VIEWER_ROLE,
         ]),
    },

    [HTTP_METHOD.DELETE]: {
         [MEME_ROUTES.MEME_DELETE_PATH]: checkUserAuthentication(DeletememebyID, [
             USER_ROLES.ADMIN_ROLE,
             USER_ROLES.MEMER_ROLE
         ]),
    }  
}
 
