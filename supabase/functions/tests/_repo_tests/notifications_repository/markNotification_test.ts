// deno-lint-ignore-file
import { markNotificationsAsReadQuery } from "@repository/_notifications_repo/NotificationsQueries.ts";
import { assertEquals } from "https://deno.land/std@0.224.0/assert/assert_equals.ts";



function mockMarkNotificationQuery(data: any,error: any) {
    return {
        from: () => ({  
            update: () => ({
                 eq: () => ({
                    eq: () => ({
                        select: () => Promise.resolve({ data, error }),
                    }),
                }),
            }),
        }),
    };
}

Deno.test("markNotificationsAsReadQuery should return true when successful", async () => {
    const data = { notification_id: "550e8400-e29b-41d4-a716-446655440000", user_id: "550e8400-e29b-41d4-a716-446655440000" };
    const error = null;
    const mockquery = mockMarkNotificationQuery(data, error);
    const result = await markNotificationsAsReadQuery("550e8400-e29b-41d4-a716-446655440000", "550e8400-e29b-41d4-a716-446655440000", mockquery as any);
    assertEquals(result, true);
});

Deno.test("markNotificationsAsReadQuery should return false when notification not found", async () => {
    const data = null;
    const error =null;
    const mockquery = mockMarkNotificationQuery(data, error);
    const result = await markNotificationsAsReadQuery("550e8400-e29b-41d4-a716-446655440000", "550e8400-e29b-41d4-a716-446655440000", mockquery as any);
    assertEquals(result, false);
});

Deno.test("should return false when failed to mark notification as read", async () => {
    const data = null;
    const error = "Failed to mark notification as read";
    const mockquery = mockMarkNotificationQuery(data, error);
    const result = await markNotificationsAsReadQuery("550e8400-e29b-41d4-a716-446655440000", "550e8400-e29b-41d4-a716-446655440000", mockquery as any);
    assertEquals(result, false);
});

 