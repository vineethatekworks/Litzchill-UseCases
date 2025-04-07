// deno-lint-ignore-file

import { assertEquals } from "https://deno.land/std@0.224.0/assert/assert_equals.ts";
import { meme_exists } from "@repository/_meme_repo/MemeRepository.ts";

function mockSupabaseResponse(data: object | null, error: any) {
    return {
        from: () => ({
            select: () => ({
                eq: () => ({
                    neq: () => ({
                        maybeSingle: () => Promise.resolve({ data, error }),
                    }),
                }),
            }),
        }),
    };
}

Deno.test('checkMemeExistsQuery should return data when successful', async () => {
    const data = { id: "550e8400-e29b-41d4-a716-446655440000" };
    const error = null;
    const mockquery = mockSupabaseResponse(data,error);
    const result = await meme_exists('550e8400-e29b-41d4-a716-446655440000', mockquery as any);
    assertEquals(result,data );
});

Deno.test('should return null when meme not found', async () => {
    const data = null;
    const error =null;
    const mockquery = mockSupabaseResponse(data, error);
    const result = await meme_exists('550e8400-e29b-41d4-a716-446655440000', mockquery as any);
    assertEquals(result, data);
});