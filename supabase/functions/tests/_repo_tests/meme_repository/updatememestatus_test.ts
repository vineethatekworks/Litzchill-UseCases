// deno-lint-ignore-file
import { assertEquals } from "https://deno.land/std@0.224.0/assert/assert_equals.ts";
import { updateMemeStatusQuery } from "../../../_repository/_meme_repo/MemeRepository.ts";
import { MEME_STATUS } from "../../../_shared/_constants/Types.ts";

const TEST_MEME_ID = "0488fbc7-e8b9-4341-9e5b-9f0eb90a6d84";
const TEST_USER_ID = "9a9afb14-acbc-481a-a315-4b946dbf0491";
const NEW_STATUS = MEME_STATUS.APPROVED;

export function createMockSupabase(response: object) {
  return {
    from: () => ({
      update: () => ({
        eq: () => ({
          eq: () => ({
            neq: () => ({
              select: () => ({
                single: async () => {
                  console.log("Returning response:", response);
                  return response;
                },
              }),
            }),
          }),
        }),
      }),
    }),
  };
}

Deno.test("Successfully updates meme status", async () => {
  console.log("\nRunning: Successfully updates meme status");
  const mockSupabase = createMockSupabase({
    data: { meme_id: TEST_MEME_ID, meme_status: NEW_STATUS, meme_title: "Funny Meme" },
    error: null,
  });

  console.log("Executing updateMemeStatusQuery...");
  const result = await updateMemeStatusQuery(TEST_MEME_ID, NEW_STATUS, TEST_USER_ID, mockSupabase as any);
  console.log("Result:", result);

  assertEquals(result, {
    data: { meme_id: TEST_MEME_ID, meme_status: NEW_STATUS, meme_title: "Funny Meme" },
    error: null,
  });
});

Deno.test(" meme not found ", async () => {
  console.log("\nRunning: Returns null when meme not found");
  const mockSupabase = createMockSupabase({ data: null, error: {
    name: "PostgrestError",
    message: "Update failed",
    details: "Meme not found",
    hint: TEST_MEME_ID,
    code: "404",
  } });

  const result = await updateMemeStatusQuery(TEST_MEME_ID, NEW_STATUS, TEST_USER_ID, mockSupabase as any);
  console.log("Result:", result);

  assertEquals(result, { data: null, error: {
    name: "PostgrestError",
    message: "Update failed",
    details: "Meme not found",
    hint: TEST_MEME_ID,
    code: "404",
  } });
});

Deno.test("Does not update if meme is already deleted", async () => {
  console.log("\nRunning: Does not update if meme is already deleted");
  const mockSupabase = createMockSupabase({ data: null, error: {message:"Meme not found"} });

  console.log("Executing updateMemeStatusQuery...");
  const result = await updateMemeStatusQuery(TEST_MEME_ID, NEW_STATUS, TEST_USER_ID, mockSupabase as any);
  console.log("Result:", result);

  assertEquals(result, { data: null, error: {message:"Meme not found"} });
});

Deno.test("Internal server error 500", async () => {
  console.log("\nRunning: Returns internal server error 500");
  const mockSupabase = createMockSupabase({
    data: null,
    error: {
      name: "PostgrestError",
      message: "Internal server error",
      details: "Unexpected error occurred",
      code: "500",
    },
  });

  console.log("Executing updateMemeStatusQuery...");
  const result = await updateMemeStatusQuery(TEST_MEME_ID, NEW_STATUS, TEST_USER_ID, mockSupabase as any);
  console.log("Result:", result);

  assertEquals(result, {
    data: null,
    error: {
      name: "PostgrestError",
      message: "Internal server error",
      details: "Unexpected error occurred",
      code: "500",
    },
  });
});
