// deno-lint-ignore-file
import markNotification from "@handler/_notifications_module/markNotifications.ts";
import { assertEquals } from "https://deno.land/std@0.224.0/assert/assert_equals.ts";
import { HTTP_STATUS_CODE } from "@shared/_constants/HttpStatusCodes.ts";
import { NOTIFICATION_ERRORS, NOTIFICATION_SUCCESS } from "@shared/_messages/NotificationMessages.ts";
import { COMMON_ERROR_MESSAGES } from "@shared/_messages/ErrorMessages.ts";


function mockmarkNotificationsQuery(response: boolean|string) {
    return async () => {
        if (response === "Database connection failed") {
            throw new Error(response.toString());
        }
        return response;
    };
}

Deno.test('should return error when notification id is missing', async () => {
    const req = new Request("http://localhost", { method: "PUT" });
    const params = { user_id: "088f3d23-6136-48ea-9ede-6f8d64f1e6ed" };

    const response = await markNotification(req, params);
    const responseBody = await response.json();
    assertEquals(response.status, HTTP_STATUS_CODE.BAD_REQUEST);
    assertEquals(responseBody.message, NOTIFICATION_ERRORS.MISSING_ID);
    console.log("Response Body:", responseBody);
});


Deno.test('should return error when notification id is invalid', async () => {
    const req = new Request("http://localhost", { method: "PUT" });
    const params = { user_id: "088f3d23-6136-48ea-9ede-6f8d64f1e6ed", id: "123" };

    const response = await markNotification(req, params);
    const responseBody = await response.json();
    assertEquals(response.status, HTTP_STATUS_CODE.BAD_REQUEST);
    assertEquals(responseBody.message, NOTIFICATION_ERRORS.MISSING_ID);
    console.log("Response Body:", responseBody);
});


Deno.test('should mark a notification as read', async () => {
    const req = new Request("http://localhost", { method: "PUT" });
    const params = { user_id: "088f3d23-6136-48ea-9ede-6f8d64f1e6ed", id: "088f3d23-6136-48ea-9ede-6f8d64f1e6ed" };
    
    const mockQuery = mockmarkNotificationsQuery(true);
    const response = await markNotification(req, params,mockQuery);
    const responseBody = await response.json();
    assertEquals(response.status, HTTP_STATUS_CODE.OK);
    assertEquals(responseBody.message, NOTIFICATION_SUCCESS.NOTIFICATION_UPDATED);
});

Deno.test('should return error when failed to mark notification', async () => {
    const req = new Request("http://localhost", { method: "PUT" });
    const params = { user_id: "088f3d23-6136-48ea-9ede-6f8d64f1e6ed", id: "088f3d23-6136-48ea-9ede-6f8d64f1e6ed" };
    
    const mockQuery = mockmarkNotificationsQuery(false);
    const response = await markNotification(req, params, mockQuery);
    const responseBody = await response.json();
    assertEquals(response.status, HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR);
    assertEquals(responseBody.message, NOTIFICATION_ERRORS.FAILED_TO_UPDATE);
});


Deno.test('should return error when database connection failed', async () => {
    const req = new Request("http://localhost", { method: "PUT" });
    const params = { user_id: "088f3d23-6136-48ea-9ede-6f8d64f1e6ed", id: "088f3d23-6136-48ea-9ede-6f8d64f1e6ed" };
    
    const mockQuery = mockmarkNotificationsQuery("Database connection failed");
    const response = await markNotification(req, params, mockQuery);
    const responseBody = await response.json();
    assertEquals(response.status, HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR);
    assertEquals(responseBody.message, COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
});