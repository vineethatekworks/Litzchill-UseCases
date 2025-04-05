
//common error response 
export  function ErrorResponse(statusCode: number, message: string){
    const time = new Date();
    return new Response(JSON.stringify({statusCode,message,time}), {
        status: statusCode,
        headers: { "Content-Type": "application/json" },
    });
}

//
// export function SuccessResponse(statusCode: number,message: string,data?: any){

//     const body = data ? {statusCode, message, data } : { statusCode,message };
//     return new Response(
//         JSON.stringify({body}),
//         {
//             status: statusCode,
//             headers: { 'content-type':'application/json'},
//         }
//     );
// }

export function SuccessResponse(statusCode: number, message: string, data?: any) {
    return new Response(
        JSON.stringify({
            statusCode,
            message,
            ...(data !== undefined ? { data } : {}), // Include 'data' only if provided
            timestamp: new Date().toISOString(),
        }),
        {
            status: statusCode,
            headers: { "Content-Type": "application/json" },
        }
    );
}