<?php

use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    return response()->json(['status' => 'ok']);
});

// Serve uploaded images from storage
Route::get('/storage/lesson-images/{filename}', function (string $filename) {
    $path = storage_path('app/public/lesson-images/' . $filename);
    if (!is_file($path) || !is_readable($path)) abort(404);
    return response()->file($path, ['Cache-Control' => 'public, max-age=31536000, immutable']);
});
