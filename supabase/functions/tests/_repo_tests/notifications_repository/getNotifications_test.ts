// deno-lint-ignore-file
import { assertEquals } from "https://deno.land/std@0.224.0/assert/assert_equals.ts";
import { getNotificationsQuery } from "@repository/_notifications_repo/NotificationsQueries.ts";


function mockSupabaseResponse(data: any, error: any) {
    return {
        from: () => ({
            select: () => ({
                eq: () => ({
                    order: () => ({
                        limit: () => Promise.resolve({ data, error }),
                    }),
                }),
            }),
        }),
    };
}

Deno.test("getNotificationsQuery should return notifications when successful", async () => {
    const data = [{ id: "550e8400-e29b-41d4-a716-446655440000", meme_id: "0488fbc7-e8b9-4341-9e5b-9f0eb90a6d84", user_id: "9a9afb14-acbc-481a-a315-4b946dbf0491", likeable_type: "meme" }];
    const error = null;
    const mockquery = mockSupabaseResponse(data, error);
    const result = await getNotificationsQuery("0488fbc7-e8b9-4341-9e5b-9f0eb90a6d84", mockquery as any);
    
    console.log("Result:", result);
    assertEquals(result.data, data);
});

Deno.test("getNotificationsQuery should return error when failed", async () => {
    const data = null;
    const error = { message: "Database connection failed" };
    const mockquery = mockSupabaseResponse(data, error);

    const result = await getNotificationsQuery("0488fbc7-e8b9-4341-9e5b-9f0eb90a6d84", mockquery as any);
    
    console.log(result);

    assertEquals(result.error, error);
});
