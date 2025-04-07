// deno-lint-ignore-file
import { Redis } from 'https://deno.land/x/upstash_redis@v1.19.3/mod.ts'
import supabase from "@shared/_config/DbConfig.ts";



// Connect to Redis
const redis = new Redis({
    url: Deno.env.get('UPSTASH_REDIS_REST_URL')!,
    token: Deno.env.get('UPSTASH_REDIS_REST_TOKEN')!,
  })

export default async function(req: Request,params: Record<string, string>) {
  try {
    const { filePath } = await req.json();
    if (!filePath) return new Response("Missing filePath", { status: 400 });

    // Check cache for signed URL
    const cachedUrl = await redis.get(filePath);
    if (cachedUrl) {
      return new Response(JSON.stringify({ url: cachedUrl }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // Generate signed URL from Supabase
    const { data, error } = await supabase.storage
      .from("meme")
      .createSignedUrl(filePath, 60); // URL expires in 60 seconds

    if (error) {
      return new Response("Error generating signed URL", { status: 500 });
    }

    // Store in Redis with TTL (e.g., 55 seconds to avoid expired links)
    await redis.setex(filePath, 55, data.signedUrl);

    return new Response(JSON.stringify({ url: data.signedUrl }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    return new Response("Server Error", { status: 500 });
  }
};
