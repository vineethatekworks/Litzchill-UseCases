// deno-lint-ignore-file
import createMeme from "@handler/_meme_module/CreateMeme.ts";
import { MEME_ERROR_MESSAGES, MEME_SUCCESS_MESSAGES } from "@shared/_messages/Meme_Module_Messages.ts";
import { assertEquals } from "https://deno.land/std@0.224.0/assert/assert_equals.ts";
import { HTTP_STATUS_CODE } from "@shared/_constants/HttpStatusCodes.ts";
import { COMMON_ERROR_MESSAGES } from "@shared/_messages/ErrorMessages.ts";


Deno.test('validate form data or not and print missing fields if not form data' ,async() =>{
    const req = new Request("http://localhost",{method:"POST"})
    const params = {user_id: "550e8400-e29b-41d4-a716-446655440000"}

    const response = await createMeme(req,params);
    const responseBody = await response.json();
    console.log(responseBody);
    assertEquals(responseBody.message, MEME_ERROR_MESSAGES.MISSING_REQUIRED_FEILDS);

})


Deno.test('validate form data - missing tags' ,async() =>{
    const form = new FormData();
    form.append("meme_title", "funny meme");
    //form.append("tags", "funny, meme");
    
    const file = new File(["dummy content"], "meme.jpg", { type: "image/jpeg" });
    form.append("media_file", file);

    const req = new Request("http://localhost", {method: "POST",body: form});
    const params = {user_id: "550e8400-e29b-41d4-a716-446655440000"}

    const response = await createMeme(req,params);
    const responseBody = await response.json();
    console.log(responseBody);
    assertEquals(response.status, HTTP_STATUS_CODE.BAD_REQUEST);
    assertEquals(responseBody.message, MEME_ERROR_MESSAGES.MISSING_TAGS);
})

Deno.test('validate form data - missing meme-title' ,async() =>{
    const form = new FormData();
    //form.append("meme_title", "funny meme");
    form.append("tags", "funny, meme");
    
    const file = new File(["dummy content"], "meme.jpg", { type: "image/jpeg" });
    form.append("media_file", file);

    const req = new Request("http://localhost", {method: "POST",body: form});
    const params = {user_id: "550e8400-e29b-41d4-a716-446655440000"}

    const response = await createMeme(req,params);
    const responseBody = await response.json();
    console.log(responseBody);
    assertEquals(response.status, HTTP_STATUS_CODE.BAD_REQUEST);
    assertEquals(responseBody.message, MEME_ERROR_MESSAGES.MISSING_MEME_TITLE);
})

Deno.test('validate form data - missing media file' ,async() =>{
    const form = new FormData();
    form.append("meme_title", "funny meme");
    form.append("tags", "funny, meme");
    
    // const file = new File(["dummy content"], "meme.jpg", { type: "image/jpeg" });
    // form.append("media_file", file);

    const req = new Request("http://localhost", {method: "POST",body: form});
    const params = {user_id: "550e8400-e29b-41d4-a716-446655440000"}

    const response = await createMeme(req,params);
    const responseBody = await response.json();
    console.log(responseBody);
    assertEquals(response.status, HTTP_STATUS_CODE.BAD_REQUEST);
    assertEquals(responseBody.message, MEME_ERROR_MESSAGES.MISSING_MEDIA_FILE);
})
    
Deno.test('validation - invalid meme title', async () => {
    const form = new FormData();
    form.append("meme_title", "funny * meme");
    form.append("tags", "funny, meme");
    
    const file = new File(["dummy content"], "meme.jpg", { type: "image/jpeg" });
    form.append("media_file", file);

    const req = new Request("http://localhost", {method: "POST",body: form});
    const params = {user_id: "550e8400-e29b-41d4-a716-446655440000"}

    const response = await createMeme(req,params);
    const responseBody = await response.json();
    console.log(responseBody);
    assertEquals(response.status, HTTP_STATUS_CODE.BAD_REQUEST);
    assertEquals(responseBody.message, MEME_ERROR_MESSAGES.INVALID_MEME_TITLE);

});

Deno.test('validation - invalid meme title', async () => {
    const form = new FormData();
    form.append("meme_title", "go");
    form.append("tags", "funny, meme");
    
    const file = new File(["dummy content"], "meme.jpg", { type: "image/jpeg" });
    form.append("media_file", file);

    const req = new Request("http://localhost", {method: "POST",body: form});
    const params = {user_id: "550e8400-e29b-41d4-a716-446655440000"}

    const response = await createMeme(req,params);
    const responseBody = await response.json();
    console.log(responseBody);
    assertEquals(response.status, HTTP_STATUS_CODE.BAD_REQUEST);
    assertEquals(responseBody.message, MEME_ERROR_MESSAGES.MEME_TITLE_EXCEEDS_LIMIT);

});

Deno.test('validation - invalid tags', async () => {
    const form = new FormData();
    form.append("meme_title", "funny meme");
    form.append("tags", "funny meme, &funny");
    
    const file = new File(["dummy content"], "meme.jpg", { type: "image/jpeg" });
    form.append("media_file", file);
    
    const req = new Request("http://localhost", {method: "POST",body: form});
    const params = {user_id: "550e8400-e29b-41d4-a716-446655440000"}

    const response = await createMeme(req,params);
    const responseBody = await response.json();
    console.log(responseBody);
    assertEquals(response.status, HTTP_STATUS_CODE.BAD_REQUEST);
    assertEquals(responseBody.message, MEME_ERROR_MESSAGES.INVALID_TAG);
});

Deno.test('validation - invalid tags length', async () => {
    const form = new FormData();
    form.append("meme_title", "funny meme");
    form.append("tags", "funny meme, funny jjjjjjjj jjjjjjj jjjjj jjjjj");
    
    const file = new File(["dummy content"], "meme.jpg", { type: "image/jpeg" });
    form.append("media_file", file);
    
    const req = new Request("http://localhost", {method: "POST",body: form});
    const params = {user_id: "550e8400-e29b-41d4-a716-446655440000"}

    const response = await createMeme(req,params);
    const responseBody = await response.json();
    console.log(responseBody);
    assertEquals(response.status, HTTP_STATUS_CODE.BAD_REQUEST);
    assertEquals(responseBody.message, MEME_ERROR_MESSAGES.INVALID_TAG_LENGTH);
});


Deno.test('validate form data - upload meadia file' ,async() =>{
    const form = new FormData();
    form.append("meme_title", "funny meme");
    form.append("tags", "funny, meme");
    
    // const file = new File(["dummy content"], "meme.jpg", { type: "image/jpeg" });
    // form.append("media_file", file);

    const req = new Request("http://localhost", {method: "POST",body: form});
    const params = {user_id: "550e8400-e29b-41d4-a716-446655440000"}

    const response = await createMeme(req,params);
    const responseBody = await response.json();
    console.log(responseBody);
    assertEquals(response.status, HTTP_STATUS_CODE.BAD_REQUEST);
    assertEquals(responseBody.message, MEME_ERROR_MESSAGES.MISSING_MEDIA_FILE);
})

function mockUploadFileToBucket(response: string | null) {
    return async (_media_file: File, _meme_title: string) => {
        return response;
    };
}

Deno.test("upload meme - fails to upload media file", async () => {
    const form = new FormData();
    form.append("meme_title", "funny meme");
    form.append("tags", "funny, meme");

    const file = new File(["dummy content"], "meme.jpg", { type: "image/jpeg" });
    form.append("media_file", file);

    const req = new Request("http://localhost", { method: "POST", body: form });
    const params = { user_id: "550e8400-e29b-41d4-a716-446655440000" };

    const mockUpload = mockUploadFileToBucket(null);

    const result = await createMeme(req,params, mockUpload);
    const resultBody = await result.json();

    assertEquals(result.status, HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR);
    assertEquals(resultBody.message, MEME_ERROR_MESSAGES.MEDIA_UPLOAD_FAILED);
});

function mockCreateMemeQuery(response: { data: any; error: any }) {
    async function CreateMemeQuery() {
        if (response.error === "Database connection failed") {
            throw new Error(response.error); 
        }
        return response;
    }
    return CreateMemeQuery;
}

Deno.test('Success response', async () => {
    const form = new FormData();
    form.append("meme_title", "funny meme");
    form.append("tags", "funny, meme");

    const file = new File(["dummy content"], "meme.jpg", { type: "image/jpeg" });
    form.append("media_file", file);

    const req = new Request("http://localhost", { method: "POST", body: form });
    const params = { user_id: "550e8400-e29b-41d4-a716-446655440000" };

    const mockUpload = mockUploadFileToBucket("https://dummy-media-file.com");
    const mockQuery = mockCreateMemeQuery({ data: { meme_id: "550e8400-e29b-41d4-a716-446655440000", media_file: "https://dummy-media-file.com", meme_title: "funny meme", tags: "funny, meme" }, error: null });

    const result = await createMeme(req,params,mockUpload,mockQuery);
    const resultBody = await result.json();

    console.log(resultBody);

    assertEquals(result.status, HTTP_STATUS_CODE.CREATED);
    assertEquals(resultBody.message, MEME_SUCCESS_MESSAGES.MEME_CREATED_SUCCESSFULLY);
})

Deno.test('error response', async () => {
    const form = new FormData();
    form.append("meme_title", "funny meme");
    form.append("tags", "funny, meme");

    const file = new File(["dummy content"], "meme.jpg", { type: "image/jpeg" });
    form.append("media_file", file);

    const req = new Request("http://localhost", { method: "POST", body: form });
    const params = { user_id: "550e8400-e29b-41d4-a716-446655440000" };

    const mockUpload = mockUploadFileToBucket("https://dummy-media-file.com");
    const mockQuery = mockCreateMemeQuery({ data: null , error: MEME_ERROR_MESSAGES.FAILED_TO_CREATE }); //

    const result = await createMeme(req,params,mockUpload,mockQuery);
    const resultBody = await result.json();


    console.log(resultBody);

    assertEquals(result.status, HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR);
    assertEquals(resultBody.message, MEME_ERROR_MESSAGES.FAILED_TO_CREATE);
})

Deno.test('Internal server error', async () => {
    const form = new FormData();
    form.append("meme_title", "funny meme");
    form.append("tags", "funny, meme");

    const file = new File(["dummy content"], "meme.jpg", { type: "image/jpeg" });
    form.append("media_file", file);

    const req = new Request("http://localhost", { method: "POST", body: form });
    const params = { user_id: "550e8400-e29b-41d4-a716-446655440000" };

    const mockUpload = mockUploadFileToBucket("https://dummy-media-file.com");
    const mockQuery = mockCreateMemeQuery({ data: null , error: "Database connection failed"}); 

    const result = await createMeme(req,params,mockUpload,mockQuery);
    const resultBody = await result.json();


    console.log(resultBody);

    assertEquals(result.status, HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR);
    assertEquals(resultBody.message, COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR); 
})
