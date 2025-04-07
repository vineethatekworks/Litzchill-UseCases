import { MemeRoutes } from "@routes/Meme_Module_Routes.ts";
import { routeHandler } from "@routes/Route_Handler.ts";



Deno.serve(async (req) => {
  return await routeHandler(req,MemeRoutes);
  });
  

