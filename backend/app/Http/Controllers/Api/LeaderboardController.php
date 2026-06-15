<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Points;
use Illuminate\Http\Request;

class LeaderboardController extends Controller
{
    public function index(Request $request)
    {
        $topLearners = Points::with('user.division')
            ->orderByDesc('total_points')
            ->take(50)
            ->get()
            ->map(function ($point, $index) {
                return [
                    'rank' => $index + 1,
                    'user_id' => $point->user_id,
                    'user_name' => $point->user->name,
                    'avatar_url' => $point->user->avatar_url,
                    'division' => $point->user->division?->name,
                    'total_points' => $point->total_points,
                    'quiz_points' => $point->quiz_points,
                    'assignment_points' => $point->assignment_points,
                    'daily_streak' => $point->daily_streak,
                ];
            });

        return response()->json([
            'leaderboard' => $topLearners,
            'total' => count($topLearners),
        ]);
    }

    public function byDivision(Request $request, $divisionId)
    {
        $topLearners = Points::whereHas('user', fn($q) => $q->where('division_id', $divisionId))
            ->with('user')
            ->orderByDesc('total_points')
            ->take(50)
            ->get()
            ->map(function ($point, $index) {
                return [
                    'rank' => $index + 1,
                    'user_id' => $point->user_id,
                    'user_name' => $point->user->name,
                    'avatar_url' => $point->user->avatar_url,
                    'total_points' => $point->total_points,
                    'daily_streak' => $point->daily_streak,
                ];
            });

        return response()->json($topLearners);
    }

    public function streak(Request $request)
    {
        $streakLeaders = Points::with('user.division')
            ->orderByDesc('daily_streak')
            ->take(20)
            ->get()
            ->map(function ($point, $index) {
                return [
                    'rank' => $index + 1,
                    'user_name' => $point->user->name,
                    'avatar_url' => $point->user->avatar_url,
                    'daily_streak' => $point->daily_streak,
                    'division' => $point->user->division?->name,
                ];
            });

        return response()->json($streakLeaders);
    }
}
