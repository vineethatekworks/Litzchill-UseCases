import { connect } from "https://deno.land/x/redis@v0.29.4/mod.ts";

// const redis = await connect({
//     hostname: "redis-19724.c262.us-east-1-3.ec2.redns.redis-cloud.com",  // Example: "redis-12345.c250.us-east-1-3.ec2.cloud.redislabs.com"
//     port: 19724,                 // Replace with your actual port
//     password: "cu4Eg3dkCSgCTeTosurCWbGAkpVMXBpU", // If authentication is required
// });

// // Test connection
// const pong = await redis.ping();
// console.log("Redis Connected:", pong);

// // Set and Get a Key
// await redis.set("message", "Hello from Deno!");
// const value = await redis.get("message");
// console.log("Stored value:", value);

// Deno.exit();

const WEATHER_KEY = "weather:current";

Deno.serve(async (_req) => {
  try {
    const redis = await connect({
        hostname: "redis-19724.c262.us-east-1-3.ec2.redns.redis-cloud.com",  // Example: "redis-12345.c250.us-east-1-3.ec2.cloud.redislabs.com"
        port: 19724,                 // Replace with your actual port
        password: "cu4Eg3dkCSgCTeTosurCWbGAkpVMXBpU", // If authentication is required
    });

    // 1. Check if weather data is cached
    const cached = await redis.get(WEATHER_KEY);
    if (cached) {
      redis.close();
      console.log("Weather data is cached");
      return new Response(JSON.stringify({source: "cache",data: JSON.parse(cached),}), { status: 200 });
    }

    // 2. Fake API request (you can replace this with real one)
    const weather = {
      temperature: 25 + Math.floor(Math.random() * 5),
      condition: "Sunny",
      updatedAt: new Date().toISOString(),
    };

    // 3. Cache it with expiry
    await redis.set(WEATHER_KEY, JSON.stringify(weather), { ex: 60 }); // 60s

    redis.close();
    console.log("Weather data is not cached");
    return new Response(JSON.stringify({
      source: "live",
      data: weather,
    }), { status: 200 });

  } catch (error) {
    return new Response(JSON.stringify({ error: error }), {
      status: 500,
    });
  }
});
