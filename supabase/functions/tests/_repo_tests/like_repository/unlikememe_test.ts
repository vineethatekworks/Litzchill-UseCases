// deno-lint-ignore-file
import { assertEquals } from "https://deno.land/std@0.224.0/assert/assert_equals.ts";
import { unlikememe } from "@repository/_like_repo/LikeQueries.ts";

function createMockSupabaseClient(data: any , error: any) {
  return {
    from: () => ({
      delete: () => ({
        eq: () => ({
          eq: () => Promise.resolve({ data, error }),
        }),
      }),
    }),
  } 
}

Deno.test("unlikememe should return true when unlike is successful", async () => {
  const mockData = [{ meme_id: "123", user_id: "456" }]; 
  const mockDbClient = createMockSupabaseClient(mockData,null); 

  const result = await unlikememe("123", "456", mockDbClient as any );
  assertEquals(result, true);
});

Deno.test("unlikememe should return false if no like exists", async () => {
  const mockDbClient = createMockSupabaseClient(null,null); 

  const result = await unlikememe("123", "456", mockDbClient as any);
  assertEquals(result, false);
});

Deno.test("unlikememe should return false when an error occurs", async () => {
  const mockError = new Error("Database delete failed");
  const mockDbClient = createMockSupabaseClient(null, mockError); 
  const result = await unlikememe("123", "456", mockDbClient as any);
  assertEquals(result, false);
});
