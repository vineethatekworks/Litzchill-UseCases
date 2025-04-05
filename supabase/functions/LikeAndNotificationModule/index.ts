import { like_And_NotifyRoutes } from "@routes/LikeandNotification_Routes.ts";
import { routeHandler } from "@routes/Route_Handler.ts";



Deno.serve(async (req) => {
  return await routeHandler(req,like_And_NotifyRoutes);
  });
  

