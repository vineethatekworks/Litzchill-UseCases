// deno-lint-ignore-file
import updateMeme from "@handler/_meme_module/UpateMeme.ts";
import { assertEquals } from "https://deno.land/std@0.224.0/assert/assert_equals.ts";
import { HTTP_STATUS_CODE } from "@shared/_constants/HttpStatusCodes.ts";
import { MEME_ERROR_MESSAGES, MEME_SUCCESS_MESSAGES } from "@shared/_messages/Meme_Module_Messages.ts";
import { USER_ROLES } from "@shared/_constants/UserRoles.ts";
import { MEMEFIELDS } from "@shared/_db_table_details/MemeTableFields.ts";
import { validateMemeFields } from "@shared/_validation/Meme_Validations.ts";
import { MEME_STATUS } from "@shared/_constants/Types.ts";
import { Meme } from "@model/MemeModel.ts";
import { COMMON_ERROR_MESSAGES } from "@shared/_messages/ErrorMessages.ts";



// //missing meme_id parameter test 
Deno.test("missing  meme_id parameter",async()=>{
    const req = new Request("http://localhost", {method:"PUT"});
    const params = {user_id:"088f3d23-6136-48ea-9ede-6f8d64f1e6ed",user_type:USER_ROLES.MEMER_ROLE};

    const response = await updateMeme(req,params);
    const responseBody = await response.json();
    assertEquals(response.status, HTTP_STATUS_CODE.BAD_REQUEST);
    assertEquals(responseBody.message, MEME_ERROR_MESSAGES.MISSING_MEMEID);
    console.log("Response Body:",responseBody);

 })

// //validate meme_id parameter test
Deno.test("validate meme_id parameter",async()=>{
    const req = new Request("http://localhost", {method:"PUT",body: JSON.stringify({})});
    const params = {id:"1234567890",user_id:"088f3d23-6136-48ea-9ede-6f8d64f1e6ed",user_type:USER_ROLES.MEMER_ROLE};
    const response = await updateMeme(req,params);
    const responseBody = await response.json();
    assertEquals(response.status, HTTP_STATUS_CODE.BAD_REQUEST);
    assertEquals(responseBody.message, MEME_ERROR_MESSAGES.MISSING_MEMEID);
    console.log("Response Body:",responseBody);
});
    
Deno.test('validation of meme-title', async () => {
    const requestBody = { meme_title: "funny^meme" };
    const req = new Request("http://localhost", {method:"PUT",body: JSON.stringify(requestBody)});
    const params = {id:"088f3d23-6136-48ea-9ede-6f8d64f1e6ed",user_id:"088f3d23-6136-48ea-9ede-6f8d64f1e6ed",user_type:USER_ROLES.MEMER_ROLE};
    const response = await updateMeme(req,params);
    const responseBody = await response.json();
    console.log("Response Body:",responseBody);
    assertEquals(responseBody.message, MEME_ERROR_MESSAGES.INVALID_MEME_TITLE)

});


function mockUpdateMemeQuery(response: { data: any; error: any }) {
        async function updateMemeQuery(_meme: Partial<Meme>, _user_id: string) {
            if (response.error === "Database connection failed") {
                throw new Error(response.error); 
            }
            return response;
        }
        return updateMemeQuery;
    }


Deno.test("Successfully updates meme data", async () => {
    const requestBody = { meme_title: "funny meme", tags: "funny"};
    const req = new Request("http://localhost", {method:"PUT",body: JSON.stringify(requestBody)});
    const params = {id:"088f3d23-6136-48ea-9ede-6f8d64f1e6ed",user_id:"088f3d23-6136-48ea-9ede-6f8d64f1e6ed",user_type:USER_ROLES.MEMER_ROLE};
    const mockUpdateQuery = mockUpdateMemeQuery({
        data: { meme_id: params.id, requestBody},
        error: null
    });

    const response = await updateMeme(req,params,mockUpdateQuery);
    const responseBody = await response.json();

    assertEquals(response.status, 200);
    assertEquals(responseBody.message, MEME_SUCCESS_MESSAGES.MEME_UPDATED_SUCCESSFULLY);
});

Deno.test("Failed to update meme status", async () => {
    const req = new Request("http://localhost", { method: "PUT", body: JSON.stringify({ meme_status: MEME_STATUS.APPROVED }) });
    const params = { id: "088f3d23-6136-48ea-9ede-6f8d64f1e6ed", user_id: "088f3d23-6136-48ea-9ede-6f8d64f1e6ed" };
    
    const mockUpdateQuery = mockUpdateMemeQuery({ data: null, error: { message: "Failed to update meme status" } });
    const result = await updateMeme(req, params, mockUpdateQuery);
   
    const resultBody = await result.json();

    assertEquals(resultBody.message, MEME_ERROR_MESSAGES.FAILED_TO_UPDATE);
    assertEquals(result.status, HTTP_STATUS_CODE.NOT_FOUND);
});

Deno.test("Handles unexpected error in updateMeme", async () => {
    const requestBody = { meme_title: "funny meme", tags: ["funny", "meme"] };
    const req = new Request("http://localhost", { method: "PUT",body: JSON.stringify(requestBody), });

    const params = {id: "088f3d23-6136-48ea-9ede-6f8d64f1e6ed",user_id: "088f3d23-6136-48ea-9ede-6f8d64f1e6ed",user_type: USER_ROLES.MEMER_ROLE,};

    const mockUpdateQuery = mockUpdateMemeQuery({ data: null, error: "Database connection failed" });
    const result = await updateMeme(req, params, mockUpdateQuery);

    const resultBody = await result.json();
    
    assertEquals(result.status, HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR);
    assertEquals(resultBody.message, COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
});
    

