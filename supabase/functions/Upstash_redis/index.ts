import { Redis } from 'https://deno.land/x/upstash_redis@v1.19.3/mod.ts'

console.log(`Function "upstash-redis-counter" up and running!`)

Deno.serve(async (_req) => {
  try {
    const redis = new Redis({
      url:"https://talented-prawn-57335.upstash.io",
      token: "Ad_3AAIjcDE0NDhkYmFkZGIzNGY0ODM5OGE0YmM2ZTg4Njg3MDI4YnAxMA"
     
    })
  
    console.log("Success")

    const deno_region = Deno.env.get('DENO_REGION')
    if (deno_region) {
      // Increment region counter
      await redis.hincrby('supa-edge-counter', deno_region, 1)
    } else {
      // Increment localhost counter
      await redis.hincrby('supa-edge-counter', 'localhost', 1)
    }

    // Get all values
    const counterHash: Record<string, number> | null = await redis.hgetall('supa-edge-counter')
    const counters = Object.entries(counterHash!)
      .sort(([, a], [, b]) => b - a) // sort desc
      .reduce((r, [k, v]) => ({ total: r.total + v, regions: { ...r.regions, [k]: v } }), {
        total: 0,
        regions: {},
      })

    return new Response(JSON.stringify({ counters }), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error }), { status: 200 })
  }
})