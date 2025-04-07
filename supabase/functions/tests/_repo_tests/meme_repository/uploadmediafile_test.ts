
// deno-lint-ignore-file
import { assertEquals } from "https://deno.land/std@0.224.0/assert/assert_equals.ts";
import { uploadFileToBucket } from "@repository/_meme_repo/MemeRepository.ts";


// Mock Supabase storage client factory
function createMockSupabaseClient(mockResponse: any) {
    return {
        storage: {
            from: () => ({
                upload: (_path: string, _file: File, _options: any) => Promise.resolve(mockResponse.upload),
                getPublicUrl: (_path: string) => ({ data: mockResponse.publicUrl }),
            }),
        },
    };
}
Deno.test("uploadFileToBucket should return null on unsupported file type", async () => {
  const mockSupabase = createMockSupabaseClient({
    upload: { data: null, error: null },
    publicUrl: null,
  });


  const fakeFile = new File(["test"], "test.txt", { type: "text/plain" });


  const publicUrl = await uploadFileToBucket(fakeFile, "Test Meme", mockSupabase as any);


  assertEquals(publicUrl, null);
});
// Successfully uploads and retrieves public URL
Deno.test("uploadFileToBucket - successfully uploads an image file and retrieves public URL", async () => {
    const mockSupabaseClient = createMockSupabaseClient({
        upload: { data: { path: "memes/meme-123.png" }, error: null },
        publicUrl: { publicUrl: "https://example.com/memes/meme-123.png" },
    });


    const mockFile = new File(["test"], "test.png", { type: "image/png" });
    const result = await uploadFileToBucket(mockFile, "meme", mockSupabaseClient as any);


    assertEquals(result, "https://example.com/memes/meme-123.png");
});


// Handles upload error
Deno.test("uploadFileToBucket - returns null if upload fails", async () => {
    const mockSupabaseClient = createMockSupabaseClient({
        upload: { data: null, error: { message: "Upload failed" } },
        publicUrl: { publicUrl: "https://example.com/memes/meme-123.png" },
    });


    const mockFile = new File(["test"], "test.png", { type: "image/png" });
    const result = await uploadFileToBucket(mockFile, "meme", mockSupabaseClient as any);


    assertEquals(result, null);
});


// Handles missing upload data
Deno.test("uploadFileToBucket - returns null if upload data is missing", async () => {
    const mockSupabaseClient = createMockSupabaseClient({
        upload: { data: null, error: null },
        publicUrl: { publicUrl: "https://example.com/memes/meme-123.png" },
    });


    const mockFile = new File(["test"], "test.png", { type: "image/png" });
    const result = await uploadFileToBucket(mockFile, "meme", mockSupabaseClient as any);


    assertEquals(result, null);
});




// Handles unexpected error (catch block)
Deno.test("uploadFileToBucket - handles unexpected errors gracefully", async () => {
    const mockSupabaseClient = {
        storage: {
            from: () => ({
                upload: () => {
                    throw new Error("Unexpected Error");
                },
                getPublicUrl: () => ({ data: { publicUrl: "https://example.com/memes/meme-123.png" } }),
            }),
        },
    };


    const mockFile = new File(["test"], "test.png", { type: "image/png" });
    const result = await uploadFileToBucket(mockFile, "meme", mockSupabaseClient as any);


    assertEquals(result, null);
});


Deno.test("uploadFileToBucket - handles empty public URL data", async () => {
  const mockSupabaseClient = createMockSupabaseClient({
      upload: { data: { path: "memes/meme-123.png" }, error: null },
      publicUrl: {},
  });


  const mockFile = new File(["test"], "test.png", { type: "image/png" });
  const result = await uploadFileToBucket(mockFile, "meme", mockSupabaseClient as any);


  assertEquals(result, null);
});


