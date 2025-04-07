// deno-lint-ignore-file
import { assertEquals } from "https://deno.land/std@0.224.0/assert/assert_equals.ts";
import { updatememeQuery } from "@repository/_meme_repo/MemeRepository.ts";
import { USER_ROLES } from "@shared/_constants/UserRoles.ts";

const TEST_MEME_ID = "0488fbc7-e8b9-4341-9e5b-9f0eb90a6d84";
const TEST_USER_ID = "9a9afb14-acbc-481a-a315-4b946dbf0491";
const UPDATED_MEME = { meme_id: TEST_MEME_ID, meme_title: "Title Updated", tags: ["funny"] };

let receivedConditions: object | null = null;

function mockUpdateMemeResponse(conditions: object) {
  receivedConditions = conditions;
  return { data: { ...UPDATED_MEME, updated_at: "2025-02-27T12:00:00Z" }, error: null };
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

// Admin can update any meme
Deno.test("Admin can update any meme", async () => {
  receivedConditions = null;
  const mockSupabase = createMockSupabase(mockUpdateMemeResponse);
  const result = await updatememeQuery(UPDATED_MEME, USER_ROLES.ADMIN_ROLE, mockSupabase as any);
  assertEquals(receivedConditions, { meme_id: TEST_MEME_ID });
  assertEquals(result, { data: { ...UPDATED_MEME, updated_at: "2025-02-27T12:00:00Z" }, error: null });
});

// Non-admin can update their own meme
Deno.test("Non-admin can update their own meme", async () => {
  receivedConditions = null;
  const mockSupabase = createMockSupabase(mockUpdateMemeResponse);
  const result = await updatememeQuery({ ...UPDATED_MEME, user_id: TEST_USER_ID }, USER_ROLES.USER_ROLE, mockSupabase as any);
  assertEquals(receivedConditions, { meme_id: TEST_MEME_ID, user_id: TEST_USER_ID });
  assertEquals(result, { data: { ...UPDATED_MEME, updated_at: "2025-02-27T12:00:00Z" }, error: null });
});

// Meme not found (404)
Deno.test("Update fails when meme not found (404)", async () => {
  const mockSupabase = createMockSupabase(() => ({
    data: null,
    error: { message: "Meme not found", code: 404 },
  }));
  const result = await updatememeQuery(UPDATED_MEME, USER_ROLES.ADMIN_ROLE, mockSupabase as any);
  assertEquals(result, { data: null, error: { message: "Meme not found", code: 404 } });
});

// Internal server error (500)
Deno.test("Update fails due to internal server error (500)", async () => {
  const mockSupabase = createMockSupabase(() => ({
    data: null,
    error: { message: "Unexpected error", code: 500 },
  }));
  const result = await updatememeQuery(UPDATED_MEME, USER_ROLES.ADMIN_ROLE, mockSupabase as any);
  assertEquals(result, { data: null, error: { message: "Unexpected error", code: 500 } });
});
