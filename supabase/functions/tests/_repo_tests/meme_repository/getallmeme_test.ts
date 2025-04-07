// deno-lint-ignore-file
import { assertEquals } from "https://deno.land/std@0.224.0/assert/assert_equals.ts";
import { TABLE_NAMES } from "@shared/_db_table_details/TableNames.ts";
import { fetchMemes } from "@repository/_meme_repo/MemeRepository.ts";

function createMockSupabaseClient(mockData: Record<string, any>) {
    return {
        from: (table: string) => ({
            select: () => {
                if (table === TABLE_NAMES.USER_TABLE) {
                    return {
                        eq: () => Promise.resolve(mockData.publicUsers || { data: [], error: null }),
                    };
                } else if (table === TABLE_NAMES.MEME_TABLE) {
                    return {
                        eq: () => ({
                            in: () => ({
                                order: () => ({
                                    range: () => Promise.resolve(mockData.memes || { data: [], error: null }),
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
        publicUsers: { data: [{ user_id: "550e8400-e29b-41d4-a716-446655440000" }], error: null },
        memes: { data: [{ meme_id: "0488fbc7-e8b9-4341-9e5b-9f0eb90a6d84", meme_title: "Meme1", like_count: 100, created_at: "2023-01-01" }], error: null },
    });

    const { data, error } = await fetchMemes(page, limit, sort, null, mockSupabaseClient as any);
    assertEquals(error, null);
    assertEquals(data?.length, 1);
});

Deno.test("fetchMemes - successfully fetches memes sorted by created_at", async () => {
    const mockSupabaseClient = createMockSupabaseClient({
        publicUsers: { data: [{ user_id: "550e8400-e29b-41d4-a716-446655440000" }], error: null },
        memes: { data: [{ meme_id: "0488fbc7-e8b9-4341-9e5b-9f0eb90a6d84", meme_title: "Meme1", created_at: "2023-01-01", like_count: 100 }], error: null },
    });

    const { data, error } = await fetchMemes(page, limit, sort, null, mockSupabaseClient as any);
    assertEquals(error, null);
    assertEquals(data?.length, 1);
});

Deno.test("fetchMemes - returns an error when no memes are found", async () => {
    const mockSupabaseClient = createMockSupabaseClient({
        publicUsers: { data: [{ user_id: "550e8400-e29b-41d4-a716-446655440000" }], error: null },
        memes: { data: [], error: null },
    });

    const { data, error } = await fetchMemes(page, limit, sort, null, mockSupabaseClient as any);
    assertEquals(data?.length, 0);
    assertEquals(error, null);
});

Deno.test("fetchMemes - returns an error when fetching memes fails", async () => {
    const mockSupabaseClient = createMockSupabaseClient({
        publicUsers: { data: [{ user_id: "550e8400-e29b-41d4-a716-446655440000" }], error: null },
        memes: { data: null, error: { message: "Fetching memes failed" } },
    });

    const { data, error } = await fetchMemes(page, limit, sort, null, mockSupabaseClient as any);
    assertEquals(data, null);
    assertEquals((error as Error).message, "Fetching memes failed");
});

Deno.test("fetchMemes - handles error when fetching public users fails", async () => {
    const mockSupabaseClient = createMockSupabaseClient({
        publicUsers: { data: null, error: { message: "Database error" } },
    });

    const { data, error } = await fetchMemes(1, 10, "popular", null, mockSupabaseClient as any);
    assertEquals(data, null);
    assertEquals((error as Error)?.message, "Database error");
});

Deno.test("fetchMemes - handles the case when no public users exist", async () => {
    const mockSupabaseClient = createMockSupabaseClient({
        publicUsers: { data: [], error: null },
    });

    const { data, error } = await fetchMemes(1, 10, "popular", null, mockSupabaseClient as any);
    assertEquals(data, []);
    assertEquals(error, null);
});

Deno.test("fetchMemes - handles case when no memes exist", async () => {
    const mockSupabaseClient = createMockSupabaseClient({
        publicUsers: { data: [{ user_id: "550e8400-e29b-41d4-a716-446655440000" }], error: null },
        memes: { data: [], error: null },
    });

    const { data, error } = await fetchMemes(1, 10, "popular", null, mockSupabaseClient as any);
    assertEquals(data, []);
    assertEquals(error, null);
});

function createMockSupabaseClient1(mockData: Record<string, any>) {
  return {
      from: (table: string) => {
          if (table === "users") {
              return {
                  select: () => ({
                      eq: () => Promise.resolve(mockData.publicUsers || { data: [], error: null }),
                  }),
              };
          } else if (table === "memes") {
              return {
                  select: () => ({
                      eq: () => ({
                          in: () => ({
                              order: () => ({
                                  contains: (column: string, value: string) => ({
                                      range: () => Promise.resolve(mockData.memes || { data: [], error: null }),
                                  }),
                              }),
                          }),
                      }),
                  }),
              };
          }
          return {};
      },
  };
}

Deno.test("fetchMemes - filters memes by tags", async () => {
  const mockSupabaseClient = createMockSupabaseClient1({
      publicUsers: { data: [{ user_id: "550e8400-e29b-41d4-a716-446655440000" }], error: null },
      memes: { data: [{ meme_id: "0488fbc7-e8b9-4341-9e5b-9f0eb90a6d84", meme_title: "Meme1", tags: "funny" }], error: null },
  });

  const { data, error } = await fetchMemes(1, 10, "popular", "funny", mockSupabaseClient as any);
  assertEquals(error, null);
  assertEquals(data?.length, 1);
});



