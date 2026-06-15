<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
            'division_id' => 'nullable|exists:divisions,id',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $token = $user->createToken('lms-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'division_id' => $user->division_id,
                'role_id' => $user->role_id,
                'role' => [
                    'id' => $user->role?->id,
                    'name' => $user->role?->name,
                ],
                'division' => $user->division?->name,
                'avatar_url' => $user->avatar_url,
            ],
        ]);
    }

    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'division_id' => 'required|exists:divisions,id',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'division_id' => $validated['division_id'],
            'role_id' => 3,
        ]);

        $user->points()->create([
            'total_points' => 0,
            'quiz_points' => 0,
            'assignment_points' => 0,
            'daily_streak' => 0,
        ]);

        $user->load(['role', 'division']);
        $token = $user->createToken('lms-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'division_id' => $user->division_id,
                'role_id' => $user->role_id,
                'role' => [
                    'id' => $user->role?->id,
                    'name' => $user->role?->name,
                ],
                'division' => $user->division?->name,
                'avatar_url' => $user->avatar_url,
            ],
        ], 201);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }

    public function user(Request $request)
    {
        $user = $request->user()->load(['division', 'role', 'points']);

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'division_id' => $user->division_id,
            'role_id' => $user->role_id,
            'role' => [
                'id' => $user->role?->id,
                'name' => $user->role?->name,
            ],
            'division' => $user->division?->name,
            'avatar_url' => $user->avatar_url,
            'bio' => $user->bio,
            'points' => $user->points?->total_points ?? 0,
        ]);
    }
}
