<?php

use Illuminate\Support\Facades\Route;

// API-only backend
Route::get('/health', function () {
    return response()->json(['status' => 'ok']);
});
