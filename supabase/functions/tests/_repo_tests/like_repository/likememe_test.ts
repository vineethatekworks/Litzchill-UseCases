// deno-lint-ignore-file
import { assertEquals } from "https://deno.land/std@0.224.0/assert/assert_equals.ts";
import { insertLikeQuery } from "@repository/_like_repo/LikeQueries.ts";

// Mock Supabase client
function mockSupabaseResponse(data: any, error: any ) {
  return {
    from: () => ({
      upsert: () => Promise.resolve({ data, error }),
    }),
  };
}

Deno.test("insertLikeQuery should insert a like and return data when successful", async () => {
  const mockData = { id: "1", meme_id: "123", user_id: "456", likeable_type: "meme" };
  const mockquery = mockSupabaseResponse(mockData,null); 
  const result = await insertLikeQuery("123", "456", "meme",mockquery as any);
  console.log(result);
  assertEquals(result.data, mockData);

});

Deno.test("insertLikeQuery should throw an error when insertion fails", async () => {
  const mockError = new Error("Failed to insert like");
  const mockquery = mockSupabaseResponse(null, mockError); 
  const result = await insertLikeQuery("123", "456", "meme",mockquery as any);
  
  await assertEquals(result.error, mockError);
});
