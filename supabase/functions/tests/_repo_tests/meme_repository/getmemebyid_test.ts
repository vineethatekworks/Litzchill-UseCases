// deno-lint-ignore-file
import { getMemeByIdQuery } from "../../../_repository/_meme_repo/MemeRepository.ts";
import { assertEquals } from "https://deno.land/std@0.224.0/assert/assert_equals.ts";
import { TABLE_NAMES } from "@shared/_db_table_details/TableNames.ts";

const memeId = "550e8400-e29b-41d4-a716-446655440000";
const userId = "7d34c4c8-6c2b-11ee-b962-0242ac120002";
const ownerId = "1a2b3c4d-5e6f-11ee-8c99-0242ac120002";

function createMockSupabaseClient(mockData: Record<string, any>) {
    return {
        from: (table: string) => {
            return {
                select: (_fields: string) => {
                    if (table === TABLE_NAMES.MEME_TABLE) {
                        return {
                            neq: (_field: string, _value: string) => {
                                return {
                                    eq: (_field2: string, _value2: string) => {
                                        return {
                                            single: () => Promise.resolve(mockData.meme || { data: null, error: { message: "Meme not found" } }),
                                        };
                                    },
                                };
                            },
                        };
                    } 
                    if (table === TABLE_NAMES.USER_TABLE) {
                        return {
                            eq: (_field: string, _value: string) => {
                                return {
                                    limit: (_num: number) => {
                                        return {
                                            single: () => Promise.resolve(mockData.user || { data: null, error: { message: "User preferences fetch failed" } }),
                                        };
                                    },
                                };
                            },
                        };
                    } 
                    if (table === TABLE_NAMES.FOLLOWERS_TABLE) {
                        return {
                            eq: (_field1: string, _value1: string) => {
                                return {
                                    eq: (_field2: string, _value2: string) => {
                                        return {
                                            limit: (_num: number) => {
                                                return Promise.resolve(mockData.follower || { data: [], error: null });
                                            },
                                        };
                                    },
                                };
                            },
                        };
                    }
                    return {};
                },
            };
        },
    };
}

Deno.test("Should fetch meme successfully (public account)", async () => {
    const mockSupabaseClient = createMockSupabaseClient({
        meme: { data: { meme_title: "Funny Meme", user_id: ownerId }, error: null },
        user: { data: { preferences: "Public" }, error: null },
    });

    const { data, error } = await getMemeByIdQuery(memeId, userId, mockSupabaseClient as any);
    assertEquals(error, null);
    assertEquals(data?.meme_title, "Funny Meme");
});

Deno.test("meme is not found", async () => {
    const mockSupabaseClient = createMockSupabaseClient({
        meme: { data: null, error: { message: "Meme not found" } },
    });

    const result = await getMemeByIdQuery(memeId, userId, mockSupabaseClient as any);
    assertEquals(result.data, null);
    assertEquals(result.error, "Meme not found");
});

Deno.test("error when user preferences fetching fails", async () => {
    const mockSupabaseClient = createMockSupabaseClient({
        meme: { data: { meme_title: "Funny Meme", user_id: ownerId }, error: null },
        user: { data: null, error: { message: "User preferences fetching failed" } },
    });

    const { data, error } = await getMemeByIdQuery(memeId, userId, mockSupabaseClient as any);
    assertEquals(data, null);
    assertEquals(error, "User preferences fetching failed");
});

Deno.test("fail when account is private and user is not a follower", async () => {
    const mockSupabaseClient = createMockSupabaseClient({
        meme: { data: { meme_title: "Funny Meme", user_id: ownerId }, error: null },
        user: { data: { preferences: "Private" }, error: null },
        follower: { data: [], error: null },
    });

    const { data, error } = await getMemeByIdQuery(memeId, userId, mockSupabaseClient as any);
    assertEquals(data, null);
    assertEquals(error, "Access denied: This account is private.");
});

Deno.test("Should fetch meme when account is private but user is a follower", async () => {
    const mockSupabaseClient = createMockSupabaseClient({
        meme: { data: { meme_title: "Funny Meme", user_id: ownerId }, error: null },
        user: { data: { preferences: "Private" }, error: null },
        follower: { data: [{ follower_id: userId }], error: null },
    });

    const { data, error } = await getMemeByIdQuery(memeId, userId, mockSupabaseClient as any);
    assertEquals(error, null);
    assertEquals(data?.meme_title, "Funny Meme");
});
