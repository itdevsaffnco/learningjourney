<?php

use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    return response()->json(['status' => 'ok']);
});

// Serve uploaded files from storage (fallback when nginx symlink fails)
Route::get('/storage/{path}', function (string $path) {
    $fullPath = storage_path('app/public/' . $path);
    $basePath = realpath(storage_path('app/public'));
    $realPath = realpath($fullPath);

    if (!$realPath || !$basePath || !str_starts_with($realPath, $basePath) || !is_file($realPath)) {
        abort(404);
    }

    return response()->file($realPath, [
        'Cache-Control' => 'public, max-age=31536000, immutable',
    ]);
})->where('path', '.*');
