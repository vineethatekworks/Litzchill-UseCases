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
  const data = { id: "0488fbc7-e8b9-4341-9e5b-9f0eb90a6d84", meme_id: "550e8400-e29b-41d4-a716-446655440000", user_id: "9a9afb14-acbc-481a-a315-4b946dbf0491", likeable_type: "meme" };
  const error = null;
  const mockquery = mockSupabaseResponse(data,error); 
  const result = await insertLikeQuery("550e8400-e29b-41d4-a716-446655440000", "9a9afb14-acbc-481a-a315-4b946dbf0491", "meme",mockquery as any);
  console.log(result);
  assertEquals(result.data, data);

});

Deno.test("insertLikeQuery should throw an error when insertion fails", async () => {
  const data = null;
  const error ={message:"Failed to insert like"};
  const mockquery = mockSupabaseResponse(data,error); 
  const result = await insertLikeQuery("550e8400-e29b-41d4-a716-446655440000", "9a9afb14-acbc-481a-a315-4b946dbf0491", "meme",mockquery as any);
  console.log(result);
  
  assertEquals(result.error, error);
});
