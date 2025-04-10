const RESEND_API_KEY = "re_8Xcq5at7_G69tn7oKP2X8gfL6jJASkQDi"

Deno.serve(async (request: Request): Promise<Response> => {
  const { record } = await request.json()
  const userEmail = record.email

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'onboarding@resend.dev', 
      to: userEmail,
      subject: '🎉 Welcome to Our App!',
      html: `<h1>Hi ${userEmail} 👋</h1><p>Thanks for signing up!</p>`,
    }),
  })

  const data = await res.json()
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
});
