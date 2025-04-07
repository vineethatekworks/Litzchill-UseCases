// deno-lint-ignore-file
import { HTTP_STATUS_CODE } from "@shared/_constants/HttpStatusCodes.ts";
import { MEME_ERROR_MESSAGES, MEME_SUCCESS_MESSAGES } from "@shared/_messages/Meme_Module_Messages.ts";
import { assertEquals } from "https://deno.land/std@0.224.0/assert/assert_equals.ts";
import updateMemeStatus from "@handler/_meme_module/UpdateMemeStatus.ts";
import { COMMON_ERROR_MESSAGES } from "@shared/_messages/ErrorMessages.ts";
import { MEME_STATUS } from "@shared/_constants/Types.ts";

function mockUpdateMemeStatusQuery(response: { data: any; error: any }) {
    async function updateMemeStatusQuery(_meme_id: string, _meme_status: string, _user_id: string) {
        if (response.error === "Database connection failed") {
            throw new Error(response.error); 
        }
        return response;
    }
    return updateMemeStatusQuery;
}

Deno.test("updateMemeStatus - Missing meme_id", async () => {
    const req = new Request("http://localhost", { method: "PUT" });
    const params = { user_id: "088f3d23-6136-48ea-9ede-6f8d64f1e6ed" }; 
    const response = await updateMemeStatus(req, params);
    const responseBody = await response.json();
    assertEquals(responseBody.message, MEME_ERROR_MESSAGES.MISSING_MEMEID);
    console.log(responseBody);
    assertEquals(response.status, HTTP_STATUS_CODE.BAD_REQUEST);
  });

Deno.test('invalid meme_id',async () => {
    const req = new Request("http://localhost", { method: "PUT" });
    const params = { user_id: "088f3d23-6136-48ea-9ede-6f8d64f1e6ed", id: "124" };
    
    const response = await updateMemeStatus(req, params);
    
    const responseBody = await response.json();
    
    assertEquals(responseBody.message, MEME_ERROR_MESSAGES.MISSING_MEMEID);
    assertEquals(response.status, HTTP_STATUS_CODE.BAD_REQUEST);
});

Deno.test("missing meme_status",async() => {
    const req= new Request("http://localhost", { method: "PUT",body: JSON.stringify({}) });
    const params = { id: "088f3d23-6136-48ea-9ede-6f8d64f1e6ed",user_id: "088f3d23-6136-48ea-9ede-6f8d64f1e6ed"};

    const response = await updateMemeStatus(req, params);
    
    const responseBody = await response.json();
    
    assertEquals(responseBody.message, MEME_ERROR_MESSAGES.MISSING_STATUS_VALUE);
    assertEquals(response.status, HTTP_STATUS_CODE.BAD_REQUEST);
});

Deno.test("invalid meme_status", async() => {
    const req = new Request("http://localhost", { method: "PUT", body: JSON.stringify({ meme_status: "invalid" }) });
    const params = { id: "088f3d23-6136-48ea-9ede-6f8d64f1e6ed", user_id: "088f3d23-6136-48ea-9ede-6f8d64f1e6ed" };
    
    const response = await updateMemeStatus(req, params);
    
    const responseBody = await response.json();
   
    assertEquals(responseBody.message, COMMON_ERROR_MESSAGES.INVALID_DATA);
    assertEquals(response.status, HTTP_STATUS_CODE.BAD_REQUEST);
});

Deno.test("Successfully updates meme status", async () => {
    const req = new Request("http://localhost", { method: "PUT", body: JSON.stringify({ meme_status: MEME_STATUS.APPROVED }) });
    const params = { id: "088f3d23-6136-48ea-9ede-6f8d64f1e6ed", user_id: "088f3d23-6136-48ea-9ede-6f8d64f1e6ed" };

    const mockUpdateQuery = mockUpdateMemeStatusQuery({ data: { ...params, meme_title: "Funny Meme" },error: null});
    const result = await updateMemeStatus(req, params, mockUpdateQuery);
    
    const resultBody = await result.json(); 

    assertEquals(resultBody.message, MEME_SUCCESS_MESSAGES.MEME_STATUS_UPDATED_SUCCESSFULLY);
    assertEquals(result.status, 200);
});

Deno.test("Failed to update meme status", async () => {
    const req = new Request("http://localhost", { method: "PUT", body: JSON.stringify({ meme_status: MEME_STATUS.APPROVED }) });
    const params = { id: "088f3d23-6136-48ea-9ede-6f8d64f1e6ed", user_id: "088f3d23-6136-48ea-9ede-6f8d64f1e6ed" };
    
    const mockUpdateQuery = mockUpdateMemeStatusQuery({ data: null, error: { message: "Failed to update meme status" } });
    const result = await updateMemeStatus(req, params, mockUpdateQuery);
   
    const resultBody = await result.json();

    assertEquals(resultBody.message, MEME_ERROR_MESSAGES.FAILED_TO_UPDATE);
    assertEquals(result.status, HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR);
});

Deno.test("Handles unexpected error in updateMemeStatus", async () => {
    const req = new Request("http://localhost", { method: "PUT", body: JSON.stringify({ meme_status: MEME_STATUS.APPROVED }) });
    const params = { id: "088f3d23-6136-48ea-9ede-6f8d64f1e6ed", user_id: "088f3d23-6136-48ea-9ede-6f8d64f1e6ed" };
   
    const mockUpdateQuery = mockUpdateMemeStatusQuery({ data: null, error: "Database connection failed" });
    const result = await updateMemeStatus(req, params, mockUpdateQuery);

    const resultBody = await result.json();
    
    assertEquals(result.status, HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR);
    assertEquals(resultBody.message, COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
});
    