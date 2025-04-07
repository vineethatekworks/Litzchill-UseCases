
Deno.serve(async (req) => {
  return new Response(
    JSON.stringify(""),
    { headers: { "Content-Type": "application/json" } },
  )
})

