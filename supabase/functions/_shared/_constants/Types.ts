/*
 * Define constants for user statuses.
 * These are used throughout the application for data validation and access control.
 *
 * For example, you can use them to validate user statuses when updating a user:
 *
 * if (user.status === USERSTATUS.ACTIVE) {
 *     // Allow user to login and access the application
 * } else {
 *     // Deny access or throw an error
 * }
*/
export const USERSTATUS= {
    ACTIVE: 'A',
    SUSPENDED: 'S', 
}

/*
 * Define constants for meme statuses.
 * These are used throughout the application for data validation and access control.
 * For example, you can use them to validate meme statuses when creating or updating a meme:
 */
export const MEME_STATUS= {
    PENDING: '0',
    APPROVED: '1',
    REJECTED: '2',
    DELETED: '3'
}

export const NOTIFICATION_TYPES= {
    LIKE: 'like',
    ENGAGEMENT: 'engagement',
    SYSTEM: 'system',
    REMINDER: 'reminder',
    COMMENT: 'comment',
    CONTEST_WIN: 'contest_win'
}