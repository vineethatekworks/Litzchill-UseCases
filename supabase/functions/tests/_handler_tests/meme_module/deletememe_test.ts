// deno-lint-ignore-file
import DeletememebyID from "@handler/_meme_module/DeleteMeme.ts";
import { HTTP_STATUS_CODE } from "@shared/_constants/HttpStatusCodes.ts";
import { assertEquals } from "https://deno.land/std@0.224.0/assert/assert_equals.ts";
import { MEME_ERROR_MESSAGES, MEME_SUCCESS_MESSAGES } from "@shared/_messages/Meme_Module_Messages.ts";
import { COMMON_ERROR_MESSAGES } from "@shared/_messages/ErrorMessages.ts";

function mockDeleteMemeQuery(response: { data: any; error: any }) {
    async function DeleteMemeQuery() {
        if (response.error === "Database connection failed") {
            throw new Error(response.error); 
        }
        return response;
    }
    return DeleteMemeQuery;
}

Deno.test('testing missing meme_id', async () => {
    const req = new Request("http://localhost", { method: "DELETE" });
    const params = { user_id: "088f3d23-6136-48ea-9ede-6f8d64f1e6ed" };
    
    const result = await DeletememebyID(req, params);
    const resultBody = await result.json();

    assertEquals(result.status, HTTP_STATUS_CODE.BAD_REQUEST);
    assertEquals(resultBody.message, MEME_ERROR_MESSAGES.MISSING_MEMEID);
})

Deno.test('testing invalid meme_id', async () => {
    const req = new Request("http://localhost", { method: "DELETE" });
    const params = { user_id: "088f3d23-6136-48ea-9ede-6f8d64f1e6ed", id: "124" };
    
    const result = await DeletememebyID(req, params);
    const resultBody = await result.json();

    assertEquals(result.status, HTTP_STATUS_CODE.BAD_REQUEST);
    assertEquals(resultBody.message, MEME_ERROR_MESSAGES.MISSING_MEMEID);
})

Deno.test('testing Successfully delete meme', async () => {
    const req = new Request("http://localhost", { method: "DELETE" });
    const params = { user_id: "088f3d23-6136-48ea-9ede-6f8d64f1e6ed", id: "088f3d23-6136-48ea-9ede-6f8d64f1e6ed" };
    const DeleteMemeQuery = mockDeleteMemeQuery({ data: { id: "1234567890" }, error: null });
    const result = await DeletememebyID(req, params, DeleteMemeQuery);
    const resultBody = await result.json();
    assertEquals(result.status, HTTP_STATUS_CODE.OK);
    assertEquals(resultBody.message, MEME_SUCCESS_MESSAGES.MEME_DELETED_SUCCESSFULLY);
})

Deno.test("teting error response while deleting meme", async () => {
    const req = new Request("http://localhost", { method: "DELETE" });
    const params = { user_id: "088f3d23-6136-48ea-9ede-6f8d64f1e6ed", id: "088f3d23-6136-48ea-9ede-6f8d64f1e6ed" };
    const mockQuery = mockDeleteMemeQuery({ data: null, error: { code: "500", message: "Unable to delete the meme.Either Meme not found or you are not authorized to delete it" } });

    const response = await DeletememebyID(req, params, mockQuery);
    const body = await response.json();
    console.log(body);

    assertEquals(response.status, HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR);

    assertEquals(body.message, MEME_ERROR_MESSAGES.FAILED_TO_DELETE);
});

Deno.test("Handles unexpected error in updateMemeStatus", async () => {
    const req = new Request("http://localhost", { method: "DELETE" });
    const params = { user_id: "088f3d23-6136-48ea-9ede-6f8d64f1e6ed", id: "088f3d23-6136-48ea-9ede-6f8d64f1e6ed" };    

    const  mockQuery= mockDeleteMemeQuery({ data: null, error: "Database connection failed" });
    const result = await DeletememebyID(req, params,mockQuery );

    const resultBody = await result.json();
    
    assertEquals(result.status, HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR);
    assertEquals(resultBody.message, COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
});
    