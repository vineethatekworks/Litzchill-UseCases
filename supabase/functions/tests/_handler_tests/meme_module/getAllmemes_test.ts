// deno-lint-ignore-file
import getAllMemes from "@handler/_meme_module/GetAllMemes.ts";
import { assertEquals } from "https://deno.land/std@0.224.0/assert/assert_equals.ts";
import { MEME_ERROR_MESSAGES, MEME_SUCCESS_MESSAGES } from "@shared/_messages/Meme_Module_Messages.ts";
import { HTTP_STATUS_CODE } from "@shared/_constants/HttpStatusCodes.ts";
import { COMMON_ERROR_MESSAGES } from "@shared/_messages/ErrorMessages.ts";


function mockGetAllMemesQuery(response:{data:any,error:any}) {
    async function getAllMemesQuery()
    {
        if(response.error === "Database connection failed"){
            throw new Error(response.error); 
        }
        return response;
    }
    return getAllMemesQuery;
}

Deno.test('getAllMemesQuery- successful', async () => {
    const req = new Request("http://localhost?page=2&limit=20&sort=newest&tags=funny", { method: "GET" });
    const mockQuery = mockGetAllMemesQuery({data:[{meme_id:"50e8400-e29b-41d4-a716-446655440000",meme_title:"funny meme"}],error:null});
 
    const result = await getAllMemes(req, mockQuery);
    const resultBody = await result.json();

    console.log(resultBody);
    assertEquals(result.status, 200);
    assertEquals(resultBody.message, MEME_SUCCESS_MESSAGES.MEMES_FETCHED_SUCCESSFULLY)
   
 });
 Deno.test('Success when page parameter is not provided', async () => {
    const req = new Request("http://localhost?limit=20&sort=newest&tags=funny", { method: "GET" });
    const mockQuery = mockGetAllMemesQuery({data:[{meme_id:"50e8400-e29b-41d4-a716-446655440000",meme_title:"funny meme"}],error:null});
    const result = await getAllMemes(req, mockQuery);
    const resultBody = await result.json();
    console.log(resultBody);
    assertEquals(result.status, 200);
    assertEquals(resultBody.message, MEME_SUCCESS_MESSAGES.MEMES_FETCHED_SUCCESSFULLY)
    });

Deno.test('Sucess when sort parameter is not specified', async () => {
    const req = new Request("http://localhost?page=2&limit=20&tags=funny", { method: "GET" });
    const mockQuery = mockGetAllMemesQuery({data:[{meme_id:"50e8400-e29b-41d4-a716-446655440000",meme_title:"funny meme"}],error:null});
    const result = await getAllMemes(req, mockQuery);
    const resultBody = await result.json();
    console.log(resultBody);
    assertEquals(result.status, 200);
    assertEquals(resultBody.message, MEME_SUCCESS_MESSAGES.MEMES_FETCHED_SUCCESSFULLY)
    });
Deno.test('Sucess when tags parameter is not specified', async () => {
    const req = new Request("http://localhost?page=2&limit=20&sort=newest", { method: "GET" });
    const mockQuery = mockGetAllMemesQuery({data:[{meme_id:"50e8400-e29b-41d4-a716-446655440000",meme_title:"funny meme"}],error:null});
    const result = await getAllMemes(req, mockQuery);
    const resultBody = await result.json();
    console.log(resultBody);
    assertEquals(result.status, 200);
    assertEquals(resultBody.message, MEME_SUCCESS_MESSAGES.MEMES_FETCHED_SUCCESSFULLY)
    });

Deno.test('Success when limit parameter is not specified', async () => {
    const req = new Request("http://localhost?page=2&sort=newest&tags=good",{method: 'GET'});
    const mockQuery = mockGetAllMemesQuery({data:[{meme_id:"50e8400-e29b-41d4-a716-446655440000",meme_title:"funny meme"}],error:null});
    const result = await getAllMemes(req, mockQuery);
    const resultBody = await result.json();
    console.log(resultBody);
    assertEquals(result.status, 200);
    assertEquals(resultBody.message, MEME_SUCCESS_MESSAGES.MEMES_FETCHED_SUCCESSFULLY)
    });


 Deno.test('getAllMemesQuery- failed', async () => {
    const req = new Request("http://localhost?page=2&limit=20&sort=newest&tags=funny", { method: "GET" });
    const mockQuery = mockGetAllMemesQuery({data:null,error:MEME_ERROR_MESSAGES.NO_MEMES});
    const result = await getAllMemes(req, mockQuery);
    const resultBody = await result.json();
    console.log(resultBody);
    assertEquals(resultBody.statusCode, HTTP_STATUS_CODE.NOT_FOUND);
    assertEquals(resultBody.message, MEME_ERROR_MESSAGES.NO_MEMES);
    });



Deno.test('getAllMemesQuery- database connection failed', async () => {
    const req = new Request("http://localhost?page=2&limit=20&sort=newest&tags=funny", { method: "GET" });
    const mockQuery = mockGetAllMemesQuery({data:null,error:"Database connection failed"});
    const result = await getAllMemes(req, mockQuery);
    const resultBody = await result.json();
    console.log(resultBody);
    assertEquals(result.status, HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR);
    assertEquals(resultBody.message, COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    });
