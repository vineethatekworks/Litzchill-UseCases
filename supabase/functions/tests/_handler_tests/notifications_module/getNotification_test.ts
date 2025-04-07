import { assertEquals } from "https://deno.land/std@0.224.0/assert/assert_equals.ts";
import getNotifications from "@handler/_notifications_module/GetNotifications.ts";
import { HTTP_STATUS_CODE } from "@shared/_constants/HttpStatusCodes.ts";
import { NOTIFICATION_ERRORS, NOTIFICATION_SUCCESS } from "@shared/_messages/NotificationMessages.ts";
import { COMMON_ERROR_MESSAGES } from "@shared/_messages/ErrorMessages.ts";


function mockgetNotificationsQuery(response: { data: any; error: any }) {
    return async () => {
        if (response.error === "Database connection failed") {
            throw new Error(response.error);
        }
        return response;
    };
}
Deno.test("should return success when notifications fetched successfully",async()=>{
    const res = new Request("http://localhost", { method: "GET" });
    const params = { user_id: "550e8400-e29b-41d4-a716-446655440000"};
    const mockQuery =  mockgetNotificationsQuery({ data: { id: "550e8400-e29b-41d4-a716-446655440000" }, error: null })
    const response = await getNotifications(res, params,mockQuery);
    const responseBody = await response.json(); 
    console.log("Response Body:", responseBody);
    assertEquals(response.status, HTTP_STATUS_CODE.OK);
    assertEquals(responseBody.message, NOTIFICATION_SUCCESS.NOTIFICATIONS_FETCHED);
    assertEquals(responseBody.data.id, "550e8400-e29b-41d4-a716-446655440000");
})


Deno.test("should return error when failed to fetch notifications", async () => {
    const res = new Request("http://localhost", { method: "GET" });
    const params = { user_id: "550e8400-e29b-41d4-a716-446655440000"};
    const mockQuery =  mockgetNotificationsQuery({ data: null, error: NOTIFICATION_ERRORS.FAILED_TO_FETCH })
    const response = await getNotifications(res, params,mockQuery);
    const responseBody = await response.json(); 
    console.log("Response Body:", responseBody);
    assertEquals(response.status, HTTP_STATUS_CODE.BAD_REQUEST);
    assertEquals(responseBody.message, NOTIFICATION_ERRORS.FAILED_TO_FETCH);
})

Deno.test('should return no memes found when their notifications are not available', async () => {
    const res = new Request("http://localhost", { method: "GET" });
    const params = { user_id: "550e8400-e29b-41d4-a716-446655440000"};
    const mockQuery =  mockgetNotificationsQuery({ data: null, error: null  })
    const response = await getNotifications(res, params,mockQuery);
    const responseBody = await response.json(); 
    console.log("Response Body:", responseBody);
    assertEquals(response.status, HTTP_STATUS_CODE.OK);
    assertEquals(responseBody.message, NOTIFICATION_SUCCESS.NO_NOTIFICATIONS);
    })

Deno.test("should return error when database connection failed", async () => {
    const res = new Request("http://localhost", { method: "GET" });
    const params = { user_id: "550e8400-e29b-41d4-a716-446655440000"};
    const mockQuery =  mockgetNotificationsQuery({ data: null, error: "Database connection failed" })
    const response = await getNotifications(res, params,mockQuery);
    const responseBody = await response.json(); 
    assertEquals(response.status, HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR);
    assertEquals(responseBody.message, COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
})




