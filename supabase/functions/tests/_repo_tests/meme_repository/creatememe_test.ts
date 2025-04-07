// deno-lint-ignore-file
import { assertEquals } from "https://deno.land/std@0.224.0/assert/assert_equals.ts";
import { createMemeQuery } from "@repository/_meme_repo/MemeRepository.ts";

const memeData = {
  user_id: "9a9afb14-acbc-481a-a315-4b946dbf0491",
  meme_title: "Funny Meme",
  media_file: "https://example.com/meme.jpg",
  tags: ["funny", "humor"],
};

function mockSupabaseResponse(data: object | null, error: any) {
  return {
      from: () => ({
          insert: () => ({
              select: () => ({
                  single: () => Promise.resolve({ data, error }),
              }),
          }),
      }),
  };
}

Deno.test('createMemeQuery should return data when successful', async () => {
  const data = { ...memeData, id: "550e8400-e29b-41d4-a716-446655440000"};
  const error = null;
  const mockquery = mockSupabaseResponse(data, error);
  const result = await createMemeQuery(memeData, mockquery as any);
  console.log(result);
  assertEquals(result, { data, error });
});

Deno.test('createMemeQuery should return error when insertion fails', async () => {
  const data = null;
  const error = { message: "Insertion failed" };
  const mockquery = mockSupabaseResponse(data, error);

  const result = await createMemeQuery(memeData, mockquery as any);
  console.log(result);
  assertEquals(result, { data, error });
});