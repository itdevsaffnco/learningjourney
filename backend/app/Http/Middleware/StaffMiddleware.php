<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class StaffMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user() && $request->user()->role->name === 'Staff') {
            return $next($request);
        }

        return response()->json(['message' => 'Unauthorized. Staff access required.'], 403);
    }
}
