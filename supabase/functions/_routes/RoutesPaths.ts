export const MEME_ROUTES ={
    MEME_CREATE_PATH : "/MemeModule/creatememe",
    MEME_UPDATE_PATH : "/MemeModule/updatememe/:id",
    MEME_GETTING_PATH : "/MemeModule/getmemebyid/:id",
    GETTING_ALL_MEMES_PATH : "/MemeModule/getallmemes",
    MEME_DELETE_PATH : "/MemeModule/deletememe/:id",
    MEME_UPDATE_STATUS_PATH : "/MemeModule/updatememestatus/:id",
}

export const LIKES_ROUTES = {
    LIKE_MEME_PATH:"/LikeAndNotificationModule/likememe/:id",
    UNLIK_MEME_PATH:"/LikeAndNotificationModule/unlikememe/:id"
}


export const NOTIFICATION_ROUTES = {
    GET_NOTIFICATION_PATH:"/LikeAndNotificationModule/getnotifications",
    MARK_NOTIFICATION_ROUTE:"/LikeAndNotificationModule/marknotification/:id"
}

export const CONTEST_ROUTES = {
    CONTEST_CREATE_PATH: "/ContestModule/createContest",
    CONTEST_GET_ALL_PATH: "/ContestModule/getAllContest",
    CONTEST_GET_BY_ID_PATH: "/ContestModule/getContestById/:id",
    CONTEST_UPDATE_BY_ID_PATH: "/ContestModule/updateContestById/:id",
    CONTEST_DELETE_BY_ID_PATH: "/ContestModule/deleteContestById/:id",
}

export const COMMENT_ROUTES = {
    COMMENT_ADD_PATH: "/CommentAPI/addComment",
    COMMENT_ADD_TO_OTHER:"CommentAPI/addCommentToOther/:id",
    COMMENT_DELETE_BY_ID_PATH: "/CommentAPI/deleteComment/:id"

}

export const FLAG_ROUTES = {
    ADD_FLAG_TO_MEME: "/FlagAPI/addFlag"
}


