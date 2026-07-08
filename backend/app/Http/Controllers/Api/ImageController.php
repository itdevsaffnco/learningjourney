<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ImageController extends Controller
{
    public function upload(Request $request)
    {
        $request->validate([
            'image' => 'required|file|image|mimes:jpg,jpeg,png,gif,webp|max:10240',
        ]);

        $file = $request->file('image');
        $path = $file->store('lesson-images', 'public');

        // Return as base64 data URL so the browser embeds the image directly
        // without a separate HTTP request (avoids QUIC streaming issues via Cloudflare)
        $mimeType = $file->getMimeType() ?: 'image/jpeg';
        $dataUrl = 'data:' . $mimeType . ';base64,' . base64_encode(
            file_get_contents(storage_path('app/public/' . $path))
        );

        return response()->json([
            'url' => $dataUrl,
        ]);
    }
}
