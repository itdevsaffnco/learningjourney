<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TrainerMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user() && in_array($request->user()->role->name, ['Trainer', 'Admin'])) {
            return $next($request);
        }

        return response()->json(['message' => 'Unauthorized. Trainer access required.'], 403);
    }
}
