// deno-lint-ignore-file no-explicit-any
import { assertEquals } from "https://deno.land/std@0.224.0/assert/assert_equals.ts";
import { TABLE_NAMES } from "@shared/_db_table_details/TableNames.ts";
import { fetchMemes } from "@repository/_meme_repo/MemeRepository.ts";

function createMockSupabaseClient(mockData: Record<string, any>) {
    return {
        from: (table: string) => ({
            select: () => {
                if (table === TABLE_NAMES.USER_TABLE) {
                    return {
                        eq: () => ({
                            then: (callback: (result: { data: any[] | null; error: any }) => void) =>
                                callback(mockData.publicUsers || { data: [], error: null }),
                        }),
                    };
                } 
                else if (table === TABLE_NAMES.MEME_TABLE) {
                    return {
                        eq: () => ({
                            in: () => ({
                                order: () => ({
                                    range: () => ({
                                        then: (callback: (result: { data: any[] | null; error: any }) => void) =>
                                            callback(mockData.memes || { data: [], error: null }),
                                    }),
                                }),
                            }),
                        }),
                    };
                }
                return {};
            },
        }),
    };
}


const page = 1;
const limit = 5;
const sort = "popular";


Deno.test("fetchMemes - successfully fetches memes sorted by like_count", async () => {
    const mockSupabaseClient = createMockSupabaseClient({
        publicUsers: { data: [{ user_id: "user123" }], error: null },
        memes: { data: [{ meme_id: "1", meme_title: "Meme1", like_count: 100 , created_at: "2023-01-01"}], error: null },
    });

    const { data, error } = await fetchMemes(page, limit, sort, null, mockSupabaseClient as any);
    assertEquals(error, null);
    assertEquals(data?.length, 1);
}); 

Deno.test("fetchMemes - successfully fetches memes sorted by created_at", async () => {
    const mockSupabaseClient = createMockSupabaseClient({
        publicUsers: { data: [{ user_id: "user123" }], error: null },
        memes: { data: [{ meme_id: "1", meme_title: "Meme1", created_at: "2023-01-01", like_count: 100 }], error: null },
    });
    const { data, error } = await fetchMemes(page, limit, sort, null, mockSupabaseClient as any);
    assertEquals(error, null);
    assertEquals(data?.length, 1);
    }); 

Deno.test("fetchMemes - returns an error when no memes are found", async () => {
    const mockSupabaseClient = createMockSupabaseClient({
        publicUsers: { data: [{ user_id: "user123" }], error: null },
        memes: { data: [], error: null },
    });
    const { data, error } = await fetchMemes(page, limit, sort, null, mockSupabaseClient as any);
    assertEquals(data?.length, 0);
    assertEquals(error, null);
});

Deno.test("fetchMemes - returns an error when fetching memes fails", async () => {
    const mockSupabaseClient = createMockSupabaseClient({
        publicUsers: { data: [{ user_id: "user123" }], error: null },
        memes: { data: null, error: { message: "Fetching memes failed" } },
    });
    const { data, error } = await fetchMemes(page, limit, sort, null, mockSupabaseClient as any);
    assertEquals(data, null);
    assertEquals((error as Error).message, "Fetching memes failed");
});
// Deno.test("Handles error when fetching public users fails", async () => {
//     const mockSupabaseClient = createMockSupabaseClient({
//         users: { data: null, error: { message: "Database error" } },
//     });

//     const { data, error } = await fetchMemes(1, 10, "popular", null, mockSupabaseClient as any);
//     assertEquals(data, null);
//     assertEquals((error as Error)?.message, "Database error");
// });

Deno.test("Handles the case when no public users exist", async () => {
    const mockSupabaseClient = createMockSupabaseClient({
        users: { data: [], error: null },
    });

    const { data, error } = await fetchMemes(1, 10, "popular", null, mockSupabaseClient as any);
    assertEquals(data, []);
    assertEquals(error, null);
});

Deno.test("Handles error when fetching memes fails", async () => {
    const mockSupabaseClient = createMockSupabaseClient({
        users: { data: [{ user_id: "123" }], error: null },
        memes: { data: null, error: { message: "Query failed" } },
    });

    const { data, error } = await fetchMemes(1, 10, "popular", null, mockSupabaseClient as any);
    assertEquals(data, null);
    assertEquals((error as Error)?.message, "Query failed");
});


Deno.test("fetchMemes - successfully fetches memes", async () => {
    const mockSupabaseClient = createMockSupabaseClient({
        publicUsers: { data: [{ user_id: "user123" }], error: null },
        memes: { data: [{ meme_id: "1", meme_title: "Meme1", like_count: 100, tags: ["funny"], created_at: "2023-01-01" }], error: null },
    });
    const { data, error } = await fetchMemes(1, 5, "popular", null, mockSupabaseClient as any);
    assertEquals(error, null);
    assertEquals(data?.length, 1);
}); 

Deno.test("fetchMemes - filters memes by tags", async () => {
    const mockSupabaseClient = createMockSupabaseClient({
        publicUsers: { data: [{ user_id: "user123" }], error: null },
        memes: { data: [{ meme_id: "1", meme_title: "Meme1", tags: "funny" }], error: null },
    });
    const { data, error } = await fetchMemes(1, 10, "popular", "funny", mockSupabaseClient as any);
    assertEquals(error, null);
    assertEquals(data?.length, 1);
});

Deno.test("fetchMemes - handles error when fetching public users fails", async () => {
    const mockSupabaseClient = createMockSupabaseClient({
        publicUsers: { data: null, error: { message: "Database error" } },
    });
    const { data, error } = await fetchMemes(1, 10, "popular", null, mockSupabaseClient as any);
    assertEquals(data, null);
    assertEquals((error as Error)?.message, "Database error");
});

Deno.test("fetchMemes - handles case when no public users exist", async () => {
    const mockSupabaseClient = createMockSupabaseClient({
        publicUsers: { data: [], error: null },
    });
    const { data, error } = await fetchMemes(1, 10, "popular", null, mockSupabaseClient as any);
    assertEquals(data, []);
    assertEquals(error, null);
});
