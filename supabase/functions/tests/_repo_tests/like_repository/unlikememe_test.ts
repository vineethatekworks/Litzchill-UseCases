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
  const data = { meme_id: "9a9afb14-acbc-481a-a315-4b946dbf0491", user_id: "0488fbc7-e8b9-4341-9e5b-9f0eb90a6d84" }; 
  const error = null;
  const mockDbClient = createMockSupabaseClient(data, error); 

  const result = await unlikememe("9a9afb14-acbc-481a-a315-4b946dbf0491", "0488fbc7-e8b9-4341-9e5b-9f0eb90a6d84", mockDbClient as any );
  assertEquals(result, true);
});

Deno.test("unlikememe should return false if no like exists", async () => {
  const data = null;
  const error = null;
  const mockDbClient = createMockSupabaseClient(data, error); 

  const result = await unlikememe("9a9afb14-acbc-481a-a315-4b946dbf0491", "0488fbc7-e8b9-4341-9e5b-9f0eb90a6d84", mockDbClient as any);
  assertEquals(result, false);
});

Deno.test("unlikememe should return false when an error occurs", async () => {
  const data = null;
  const error = {message:"Database delete failed"};
  const mockDbClient = createMockSupabaseClient(data, error); 
  const result = await unlikememe("9a9afb14-acbc-481a-a315-4b946dbf0491", "0488fbc7-e8b9-4341-9e5b-9f0eb90a6d84", mockDbClient as any);
  assertEquals(result, false);
});
