// deno-lint-ignore-file no-explicit-any require-await
import { assertEquals } from "https://deno.land/std@0.224.0/assert/assert_equals.ts";
import { createMemeQuery } from "@repository/_meme_repo/MemeRepository.ts";

const TEST_USER_ID = "9a9afb14-acbc-481a-a315-4b946dbf0491";
const TEST_MEME_TITLE = "Funny Meme";
const TEST_IMAGE_URL = "https://example.com/meme.jpg";
const TEST_TAGS = ["funny", "humor"];

const memeData = {
  user_id: TEST_USER_ID,
  meme_title: TEST_MEME_TITLE,
  media_file: TEST_IMAGE_URL,
  tags: TEST_TAGS,
};

function createMockSupabase(mockResponse: (meme: object) => any) {
  return {
    from: () => ({
      insert: (insertObj: object) => ({
        select: () => ({
          single: async () => {
            return mockResponse(insertObj); 
          },
        }),
      }),
    }),
  };
}



Deno.test("Should successfully create a meme", async () => {
  function mockResponse(meme: object): { data: object | null, error: object | null } {
    return {
        data: {...meme, meme_id: "1234-5678-91011" },
        error: null,
    };
  }
  const mockSupabase = createMockSupabase(mockResponse);
  const result = await createMemeQuery(memeData,mockSupabase as any);

    const expectedResult = { data: { 
        user_id: TEST_USER_ID,
        meme_title: TEST_MEME_TITLE,
        image_url: TEST_IMAGE_URL, 
        tags: TEST_TAGS,
        meme_id: "1234-5678-91011",
      },
       error: null };

    console.log("Actual value:",result);
    console.log("Expected value:", expectedResult);
    assertEquals(result, expectedResult);
  });

Deno.test("Should return an error when inserting meme fails", async () => {
  function mockResponse(): { data: object | null, error: object | null } {
    return {
        data: null,
        error: { message: "Insertion failed" },
    };
  }
    const mockSupabase = createMockSupabase(mockResponse);
  
    const result = await createMemeQuery(memeData,mockSupabase as any);
  
    const expectedResult = { data: null, error: { message: "Insertion failed" } };
  
    console.log("Actual value:",result);
    console.log("Expected value:", expectedResult);
    assertEquals(result, expectedResult);
}); 