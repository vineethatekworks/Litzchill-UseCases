// deno-lint-ignore-file

import { assertEquals } from "https://deno.land/std@0.224.0/assert/assert_equals.ts";
import { updatememeQuery, updateMemeStatusQuery } from "@repository/_meme_repo/MemeRepository.ts";
import { MEME_STATUS } from "@shared/_constants/Types.ts";

const meme = {
  meme_id: "550e8400-e29b-41d4-a716-446655440000",
  user_id: "123",
  meme_title: "Updated Meme",
  tags: ["updated", "funny"]
};

function mockSupabaseResponse(data: object | null, error: any) {
    return {
        from: () => ({
            update: () => ({
                eq: () => ({
                  eq: () => ({
                    neq: () => ({
                        select: () => ({
                            single: () => Promise.resolve({ data, error }),
                        }),
                    }),
                }),
            }),
        }),
      }),
    };
}

Deno.test('updateMemeStatusQuery should return data when successful', async () => {
    const data = {
        meme_id: "550e8400-e29b-41d4-a716-446655440000",
        meme_status: MEME_STATUS.APPROVED,
        meme_title: "Funny Meme"
    };
    const error = null;
    const mockquery = mockSupabaseResponse(data, error);
    const result = await updateMemeStatusQuery("550e8400-e29b-41d4-a716-446655440000", MEME_STATUS.APPROVED, "123", mockquery as any);
    assertEquals(result, { data, error });
});

Deno.test('updateMemeStatusQuery should return error when update fails', async () => {
    const data = null;
    const error = { message: "Status update failed" };
    const mockquery = mockSupabaseResponse(data, error);
    const result = await updateMemeStatusQuery("550e8400-e29b-41d4-a716-446655440000", MEME_STATUS.APPROVED, "123", mockquery as any);
    assertEquals(result, { data, error });
});
