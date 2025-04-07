// deno-lint-ignore-file
import { deleteMemeQuery } from "../../../_repository/_meme_repo/MemeRepository.ts";
import { MEME_STATUS } from "../../../_shared/_constants/Types.ts";
import { USER_ROLES } from "../../../_shared/_constants/UserRoles.ts";
import { assertEquals } from "https://deno.land/std@0.224.0/assert/assert_equals.ts";

const TEST_MEME_ID = "0488fbc7-e8b9-4341-9e5b-9f0eb90a6d84";
const TEST_USER_ID = "9a9afb14-acbc-481a-a315-4b946dbf0491";
const createMockSupabase = (mockResponse: (conditions: object) => any) => ({
    from: (tableName: string) => {
      console.log(`[5] [Mock] from(${tableName}) called - Querying table '${tableName}'`);
      return {
        update: (updateObj: object) => {
          console.log(`[6] [Mock] update(${JSON.stringify(updateObj)}) called - Setting update data`);
          return {
            neq: (column: string, value: any) => {
              console.log(`[7] [Mock] neq(${column} != ${value}) called - Filtering where '${column}' is not '${value}'`);
              return {
                match: (conditions: object) => {
                  console.log(`[8] [Mock] match(${JSON.stringify(conditions)}) called - Matching specific conditions`);
                  return {
                    select: (columns: string) => {
                      console.log(`[9] [Mock] select(${columns}) called - Selecting columns '${columns}'`);
                      return {
                        single: async () => {
                          console.log(`[10] [Mock] single() called - Fetching a single record`);
  
                          // Corrected logging order inside the mock function
                          console.log(`[11] [Mock] Executing mock response with conditions:`, conditions);
                          const response = mockResponse(conditions);
                          console.log(`[12] [Mock] Returning mock response:`, response);
  
                          return response;
                        },
                      };
                    },
                  };
                },
              };
            },
          };
        },
      };
    },
  });
  
Deno.test("Admin can delete any meme", async () => {
  console.log("\n[1] Running test: Admin can delete any meme");

  let receivedConditions: object | null = null;

  console.log("[2] Creating mock Supabase instance...");

  // Mock Supabase constant
  const mockSupabase = createMockSupabase((conditions: object): any => {
    console.log("[13] [Mock] Inside mock function - Capturing conditions...");
    receivedConditions = conditions;  
    console.log(`[14] [Mock] Captured conditions: ${JSON.stringify(receivedConditions)}`);

    const response = { data: { meme_id: TEST_MEME_ID, meme_status: MEME_STATUS.DELETED }, error: null };

    console.log(`[15] [Mock] Returning mock response:`, response);
    return response;
  });

  console.log("[3] Initializing mock Supabase client...");
  console.log("[4] Executing deleteMemeQuery function...");
  
  const result = await deleteMemeQuery(TEST_MEME_ID, TEST_USER_ID, USER_ROLES.ADMIN_ROLE, mockSupabase as any);

  console.log("[16] Verifying query conditions...");
  const expectedConditions = { meme_id: TEST_MEME_ID };
  console.log("[17] Expected conditions:", expectedConditions);
  console.log("[18] Actual conditions received:", receivedConditions);
  assertEquals(receivedConditions, expectedConditions);
  console.log("[19] Conditions match!");

  console.log("[20] Verifying function result...");
  const expectedResult = { data: { meme_id: TEST_MEME_ID, meme_status: MEME_STATUS.DELETED }, error: null };
  console.log("[21] Expected result:", expectedResult);
  console.log("[22] Actual result:", result);
  assertEquals(result, expectedResult);
  console.log("[23] Function result is correct!");

  console.log("[24] Test completed: Admin deletion test passed.\n");
});
