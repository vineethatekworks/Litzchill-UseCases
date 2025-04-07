// deno-lint-ignore-file
import { assertEquals } from "https://deno.land/std@0.224.0/assert/assert_equals.ts";
import { uploadFileToBucket } from "@repository/_meme_repo/MemeRepository.ts";

function mockSupabaseResponse(existingFileUrl: string | null, uploadData: any, uploadError: any) {
  return {
    storage: {
      from: () => ({
        getPublicUrl: () => ({
          data: existingFileUrl ? { publicUrl: existingFileUrl } : null,
          error: existingFileUrl ? null : "File not found",
        }),
        upload: async () => ({ data: uploadData, error: uploadError }),
      }),
    },
  };
}

Deno.test("uploadFileToBucket - successful upload", async () => {
  const mediaFile = new File(["test content"], "test-image.jpg", { type: "image/jpeg" });
  const memeTitle = "funny_meme";
  const mockSupabase = mockSupabaseResponse(null, { path: "memes/funny_meme.jpg" }, null);

  const result = await uploadFileToBucket(mediaFile, memeTitle, mockSupabase as any);
  console.log(result);
  assertEquals(result, null);
});

Deno.test("uploadFileToBucket - file already exists", async () => {
  const mediaFile = new File(["test content"], "test-image.jpg", { type: "image/jpeg" });
  const memeTitle = "funny_meme";
  const existingUrl = "https://example.com/memes/funny_meme.jpg";
  const mockSupabase = mockSupabaseResponse(existingUrl, null, null);

  const result = await uploadFileToBucket(mediaFile, memeTitle, mockSupabase as any);
  assertEquals(result, existingUrl);
});

Deno.test("uploadFileToBucket - unsupported file type", async () => {
  const mediaFile = new File(["test content"], "test.txt", { type: "text/plain" });
  const memeTitle = "funny_meme";
  const mockSupabase = mockSupabaseResponse(null, null, null); 

  const result = await uploadFileToBucket(mediaFile, memeTitle, mockSupabase as any);
  assertEquals(result, null);
});

Deno.test("uploadFileToBucket - upload error", async () => {
  const mediaFile = new File(["test content"], "test-image.jpg", { type: "image/jpeg" });
  const memeTitle = "funny_meme";
  const mockSupabase = mockSupabaseResponse(null, null, "Upload failed");

  const result = await uploadFileToBucket(mediaFile, memeTitle, mockSupabase as any);
  assertEquals(result, null);
});

Deno.test("uploadFileToBucket - error in getPublicUrl", async () => {
  const mediaFile = new File(["test content"], "test-image.jpg", { type: "image/jpeg" });
  const memeTitle = "funny_meme";

  const mockSupabase = {
    storage: {
      from: () => ({
        getPublicUrl: () => ({
          data: null,
          error: "Unexpected error in getPublicUrl",
        }),
        upload: async () => ({ data: { path: "memes/funny_meme.jpg" }, error: null }),
      }),
    },
  };

  const result = await uploadFileToBucket(mediaFile, memeTitle, mockSupabase as any);
  assertEquals(result, null);
});
Deno.test("uploadFileToBucket - unexpected error", async function () {
  const mediaFile = new File(["test content"], "test-image.jpg", { type: "image/jpeg" });
  const memeTitle = "funny_meme";

  const supabaseMock = {
    storage: {
      from: () => {
        throw new Error("Unexpected error");
      },
    },
  };

  const result = await uploadFileToBucket(mediaFile, memeTitle, supabaseMock as any);
  assertEquals(result, null);
});
