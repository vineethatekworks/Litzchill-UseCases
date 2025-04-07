//commmon error messages for all modules.
export const COMMON_ERROR_MESSAGES={
    METHOD_NOT_ALLOWED: "This method is not allowed for the requested operation.",
    ROUTE_NOT_FOUND: "The requested route was not found. Please verify the URL.",
    INTERNAL_SERVER_ERROR: "Something went wrong. Please try again later.",
    EMPTY_REQUEST_BODY: "The request body is empty. Please provide valid data.",
    DATABASE_ERROR: "Database error occurred. Please try again.",
    MISSING_JWT_TOKEN: "Missing JWT token in the request.",
    INVALID_JWT_TOKEN: " The provided JWT token is invalid or expired.",
    UNAUTHORIZED_ACCESS: "You do not have the necessary permissions to access this resource.",
    INVALIDCONTENTTYPE: "The requested content type is not form-data.",
    ACCOUNT_DEACTIVATE:"The requested access token is invalid.",
    INVALID_DATA:"The provided data is invalid. Please ensure that the value matches one of the allowed numeric statuses (0, 1, 2, 3) exactly."
};



