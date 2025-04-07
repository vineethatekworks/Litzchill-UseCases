// deno-lint-ignore-file
import { assertEquals } from "https://deno.land/std@0.224.0/assert/assert_equals.ts";
import { deleteMemeQuery } from "@repository/_meme_repo/MemeRepository.ts";
import { MEME_STATUS } from "@shared/_constants/Types.ts";
import { USER_ROLES } from "@shared/_constants/UserRoles.ts";

const TEST_MEME_ID = "0488fbc7-e8b9-4341-9e5b-9f0eb90a6d84";
const TEST_USER_ID = "9a9afb14-acbc-481a-a315-4b946dbf0491";

let receivedConditions: object | null = null;

function mockDeleteMemeResponse(conditions: object) {
  receivedConditions = conditions;
  return { data: { meme_id: TEST_MEME_ID, meme_status: MEME_STATUS.DELETED }, error: null };
}

function createMockSupabase(mockResponse: (conditions: object) => any) {
  return {
    from: () => ({
      update: () => ({
        neq: () => ({
          match: (conditions: object) => ({
            select: () => ({
              single: () => Promise.resolve(mockResponse(conditions)), 
            }),
          }),
        }),
      }),
    }),
  };
}

// Admin can delete any meme
Deno.test("Admin can delete any meme", async () => {
  receivedConditions = null; 

  const mockSupabase = createMockSupabase(mockDeleteMemeResponse);

  const result = await deleteMemeQuery(TEST_MEME_ID, TEST_USER_ID, USER_ROLES.ADMIN_ROLE, mockSupabase as any);

  assertEquals(receivedConditions, { meme_id: TEST_MEME_ID });
  assertEquals(result, { data: { meme_id: TEST_MEME_ID, meme_status: MEME_STATUS.DELETED }, error: null });
});

// Non-admin can delete their own meme
Deno.test("Non-admin can delete their own meme", async () => {
  receivedConditions = null; 

  const mockSupabase = createMockSupabase(mockDeleteMemeResponse);

  const result = await deleteMemeQuery(TEST_MEME_ID, TEST_USER_ID, USER_ROLES.USER_ROLE, mockSupabase as any);

  assertEquals(receivedConditions, { meme_id: TEST_MEME_ID, user_id: TEST_USER_ID });
  assertEquals(result, { data: { meme_id: TEST_MEME_ID, meme_status: MEME_STATUS.DELETED }, error: null });
});

// Meme not found (404)
Deno.test("Deletion fails when meme not found (404)", async () => {
  const mockSupabase = createMockSupabase(() => ({
    data: null,
    error: { message: "Meme not found", code: 404 },
  }));

  const result = await deleteMemeQuery(TEST_MEME_ID, TEST_USER_ID, USER_ROLES.ADMIN_ROLE, mockSupabase as any);

  assertEquals(result, { data: null, error: { message: "Meme not found", code: 404 } });
});

// Internal server error (500)
Deno.test("Deletion fails due to internal server error (500)", async () => {
  const mockSupabase = createMockSupabase(() => ({
    data: null,
    error: { message: "Unexpected error", code: 500 },
  }));

  const result = await deleteMemeQuery(TEST_MEME_ID, TEST_USER_ID, USER_ROLES.ADMIN_ROLE, mockSupabase as any);

  assertEquals(result, { data: null, error: { message: "Unexpected error", code: 500 } });
});
