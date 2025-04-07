// deno-lint-ignore-file require-await no-explicit-any
import { updatememeQuery } from "../../../_repository/_meme_repo/MemeRepository.ts";
import { USER_ROLES } from "../../../_shared/_constants/UserRoles.ts";
import { assertEquals } from "https://deno.land/std@0.224.0/assert/assert_equals.ts";

const TEST_MEME_ID = "0488fbc7-e8b9-4341-9e5b-9f0eb90a6d84";
const TEST_USER_ID = "9a9afb14-acbc-481a-a315-4b946dbf0491";
const UPDATED_MEME = { meme_id: TEST_MEME_ID, meme_title: "Title Updated", tags: ["funny"] };


const createMockSupabase = (mockResponse: (conditions: object) => any) => {
    return {
      from: () => {
        return {
          update: () => {
            return {
              neq: () => {
                return {
                  match: (conditions: object) => {
                    return {
                      select: () => {
                        return {
                          single: async () => mockResponse(conditions),
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
    };
  };
// const createMockSupabase = (mockResponse: (conditions: object) => any) => {
//     return {
//       from: (tableName: string) => {
//         console.log(`[Mock] from('${tableName}') called`);
//         return {
//           update: (updateObj: object) => {
//             console.log(`[Mock] update(${JSON.stringify(updateObj)}) called`);
//             return {
//               neq: (column: string, value: any) => {
//                 console.log(`[Mock] neq(${column} != ${value}) called`);
//                 return {
//                   match: (conditions: object) => {
//                     console.log(`[Mock] match(${JSON.stringify(conditions)}) called`);
//                     return {
//                       select: (columns: string) => {
//                         console.log(`[Mock] select(${columns}) called`);
//                         return {
//                           single: async () => {
//                             console.log(`[Mock] single() called - Executing mock response`);
//                             const response = mockResponse(conditions);
//                             console.log(`[Mock] Returning response:`, response);
//                             return response;
//                           },
//                         };
//                       },
//                     };
//                   },
//                 };
//               },
//             };
//           },
//         };
//       },
//     };
//   };
  

Deno.test("Admin can update any meme", async () => {
  console.log("\nRunning: Admin can update any meme");

  let receivedConditions: object | null = null;

  function mockUpdateResponse(conditions: object) {
    receivedConditions = conditions; 
    return { 
      data: { ...UPDATED_MEME, updated_at: "2025-02-27T12:00:00Z"}, 
      error: null
        };
  }
  
  const mockSupabase = createMockSupabase(mockUpdateResponse);
  

  console.log("Executing updatememeQuery...");
  const result = await updatememeQuery(UPDATED_MEME, USER_ROLES.ADMIN_ROLE, mockSupabase as any);

  const expectedConditions = { meme_id: TEST_MEME_ID };
  console.log("Expected match conditions:", expectedConditions);
  console.log("Actual match conditions:", receivedConditions);
  assertEquals(receivedConditions, expectedConditions);

  const expectedResult = { data: { ...UPDATED_MEME, updated_at: "2025-02-27T12:00:00Z" }, error: null };
  console.log("Expected result:", expectedResult);
  console.log("Actual result:", result);
  assertEquals(result, expectedResult);

  console.log(" Admin update test passed.\n");
});

Deno.test("Non-admin can update their own meme", async () => {
  console.log("\nRunning: Non-admin can update their own meme");

  let receivedConditions: object | null = null;

  const mockSupabase = createMockSupabase((conditions) => {
    receivedConditions = conditions;
    return { data: { ...UPDATED_MEME, updated_at: "2025-02-27T12:00:00Z" }, error: null };
  });

  console.log("Executing updatememeQuery...");
  const result = await updatememeQuery(
    { ...UPDATED_MEME, user_id: TEST_USER_ID }, 
    USER_ROLES.USER_ROLE,
    mockSupabase as any
  );

  const expectedConditions = { meme_id: TEST_MEME_ID, user_id: TEST_USER_ID };
  console.log("Expected match conditions:", expectedConditions);
  console.log("Actual match conditions:", receivedConditions);
  assertEquals(receivedConditions, expectedConditions);

  const expectedResult = { data: { ...UPDATED_MEME, updated_at: "2025-02-27T12:00:00Z" }, error: null };
  console.log("Expected result:", expectedResult);
  console.log("Actual result:", result);
  assertEquals(result, expectedResult);

  console.log(" Non-admin update test passed.\n");
});

Deno.test("Update should return an error when it fails (Meme not found - 404)", async () => {
  console.log("\nRunning: Update should return an error when it fails (404)");

  const mockSupabase = createMockSupabase(() => ({
    data: null,
    error: {
      name: "PostgrestError",
      message: "Update failed",
      details: "Meme not found",
      hint: TEST_MEME_ID,
      code: "404",
    },
  }));

  console.log("Executing updatememeQuery...");
  const result = await updatememeQuery(UPDATED_MEME, USER_ROLES.ADMIN_ROLE, mockSupabase as any);

  const expectedResult = {
    data: null,
    error: {
      name: "PostgrestError",
      message: "Update failed",
      details: "Meme not found",
      hint: TEST_MEME_ID,
      code: "404",
    },
  };

  console.log("Expected result:", expectedResult);
  console.log("Actual result:", result);
  assertEquals(result, expectedResult);

  console.log(" 404 Error test passed.\n");
});

Deno.test("Update should return an internal server error (500)", async () => {
  console.log("\nRunning: Update should return an internal server error (500)");

  const mockSupabase = createMockSupabase(() => ({
    data: null,
    error: {
      name: "PostgrestError",
      message: "Internal server error",
      details: "Unexpected error occurred",
      hint: "Database connection issue",
      code: "500",
    },
  }));

  console.log("Executing updatememeQuery...");
  const result = await updatememeQuery(UPDATED_MEME, USER_ROLES.ADMIN_ROLE, mockSupabase as any);

  const expectedResult = {
    data: null,
    error: {
      name: "PostgrestError",
      message: "Internal server error",
      details: "Unexpected error occurred",
      hint: "Database connection issue",
      code: "500",
    },
  };

  console.log("Expected result:", expectedResult);
  console.log("Actual result:", result);
  assertEquals(result, expectedResult);

  console.log(" Internal server error test passed.\n");
});


