// deno-lint-ignore-file
import { assertEquals } from "https://deno.land/std@0.224.0/assert/assert_equals.ts";
import { HTTP_STATUS_CODE } from "@shared/_constants/HttpStatusCodes.ts";
import { MEME_ERROR_MESSAGES, MEME_SUCCESS_MESSAGES } from "@shared/_messages/Meme_Module_Messages.ts";
import getmemebyID from "@handler/_meme_module/getMemeByID.ts";
import { COMMON_ERROR_MESSAGES } from "@shared/_messages/ErrorMessages.ts";


Deno.test("getmemebyID- missing meme ID", async () => {
    const res = new Request("http://localhost", { method: "GET" });
    const params = { user_id: "550e8400-e29b-41d4-a716-446655440000"};

    const response = await getmemebyID(res, params);
    const responseBody = await response.json();
    assertEquals(response.status, HTTP_STATUS_CODE.BAD_REQUEST);
    assertEquals(responseBody.message, MEME_ERROR_MESSAGES.MISSING_MEMEID);
    console.log("Response Body:", responseBody);

})

Deno.test("getmemebyID- invalid meme ID", async () => {
    const res = new Request("http://localhost", { method: "GET" });
    const params = { user_id: "550e8400-e29b-41d4-a716-446655440000", id: "123"};
    const response = await getmemebyID(res, params);
    const responseBody = await response.json();
    assertEquals(response.status, HTTP_STATUS_CODE.BAD_REQUEST);
    assertEquals(responseBody.message, MEME_ERROR_MESSAGES.MISSING_MEMEID);
    console.log("Response Body:", responseBody);
})

function mockgetMemebyIDQuery(response: { data: any; error: any })
{
    async function getMemebyIDQuery()
    {
        if (response.error === "Database connection failed") {
            throw new Error(response.error); 
        }
        return response;
    }
    return getMemebyIDQuery;
}

Deno.test('getmemeById - Success Response test', async () => {
    const res = new Request("http://localhost", { method: "GET" });
    const params = { user_id: "550e8400-e29b-41d4-a716-446655440000", id: "550e8400-e29b-41d4-a716-446655440000"};
    const mockQuery =  mockgetMemebyIDQuery({ data: { id: "550e8400-e29b-41d4-a716-446655440000" }, error: null })
    const response = await getmemebyID(res, params,mockQuery);
    const responseBody = await response.json(); 
    assertEquals(response.status, HTTP_STATUS_CODE.OK);
    assertEquals(responseBody.message, MEME_SUCCESS_MESSAGES.MEME_FETCHED_SUCCESSFULLY);
})

Deno.test('getmemeById - Error Response test', async () => {
    const res = new Request("http://localhost", { method: "GET" });
    const params = { user_id: "550e8400-e29b-41d4-a716-446655440000", id: "550e8400-e29b-41d4-a716-446655440000"};
    const mockQuery =  mockgetMemebyIDQuery({ data: null, error: "Meme not found" })
    const response = await getmemebyID(res, params,mockQuery);
    const responseBody = await response.json(); 
    console.log("Response Body:", responseBody);

    assertEquals(response.status, HTTP_STATUS_CODE.NOT_FOUND);
    assertEquals(responseBody.message,"Meme not found");
})
 
Deno.test("Handles unexpected error in updateMeme", async () => {
    const requestBody = { meme_title: "funny meme", tags: ["funny", "meme"] };
    const req = new Request("http://localhost", { method: "PUT",body: JSON.stringify(requestBody), });

    const params = {id: "088f3d23-6136-48ea-9ede-6f8d64f1e6ed",user_id: "088f3d23-6136-48ea-9ede-6f8d64f1e6ed"};

    const mockUpdateQuery = mockgetMemebyIDQuery({ data: null, error: "Database connection failed" });
    const result = await getmemebyID(req, params, mockUpdateQuery);

    const resultBody = await result.json();
    
    assertEquals(result.status, HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR);
    assertEquals(resultBody.message, COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
});
    