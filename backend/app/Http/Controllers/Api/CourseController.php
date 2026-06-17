<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\Module;
use App\Models\UserProgress;
use Illuminate\Http\Request;

class CourseController extends Controller
{
    public function index(Request $request)
    {
        try {
            $user = $request->user();

            $modules = \App\Models\Module::where('status', 'published')
                ->whereHas('creator', fn($q) => $q->whereHas('role', fn($r) => $r->where('name', 'Trainer')))
                ->with(['lessons', 'creator'])
                ->get();

            $formattedCourses = [];
            foreach ($modules as $module) {
                $totalLessons = $module->lessons->count();
                $totalMinutes = $module->lessons->sum('duration_minutes');

                $lessonIds = $module->lessons->pluck('id');
                $completedLessons = UserProgress::where('user_id', $user->id)
                    ->whereIn('lesson_id', $lessonIds)
                    ->where('is_completed', true)
                    ->count();

                $progressPercentage = $totalLessons > 0 ? round(($completedLessons / $totalLessons) * 100) : 0;

                $formattedCourses[] = [
                    'id' => $module->id,
                    'title' => $module->title,
                    'description' => $module->description,
                    'duration' => $totalMinutes > 0 ? round($totalMinutes / 60, 1) : 0,
                    'rating' => 4.8,
                    'students' => 0,
                    'progress' => $progressPercentage,
                    'difficulty' => ucfirst($module->level ?? 'beginner'),
                    'instructor' => $module->creator?->name ?? 'Trainer',
                    'lessons_count' => $totalLessons,
                ];
            }

            return response()->json([
                'courses' => $formattedCourses,
                'total' => count($formattedCourses),
            ]);
        } catch (\Exception $e) {
            \Log::error('Course index error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error fetching courses',
                'courses' => [],
                'total' => 0,
            ], 500);
        }
    }

    public function show(Request $request, $id)
    {
        $course = Course::with(['modules.lessons', 'modules.quizzes'])->findOrFail($id);
        $user = $request->user();

        $userProgress = UserProgress::where('user_id', $user->id)
            ->whereHas('lesson', fn($q) => $q->whereHas('module', fn($m) => $m->where('course_id', $id)))
            ->count();

        $totalLessons = Lesson::whereHas('module', fn($q) => $q->where('course_id', $id))->count();

        return response()->json([
            'course' => $course,
            'progress' => [
                'completed' => $userProgress,
                'total' => $totalLessons,
                'percentage' => $totalLessons > 0 ? round(($userProgress / $totalLessons) * 100, 1) : 0,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('isTrainerOrAdmin', new Course);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'division_id' => 'required|exists:divisions,id',
            'level' => 'in:beginner,intermediate,advanced',
            'thumbnail_url' => 'nullable|url',
        ]);

        $course = Course::create($validated);

        return response()->json($course, 201);
    }

    public function update(Request $request, $id)
    {
        $course = Course::findOrFail($id);
        $this->authorize('isTrainerOrAdmin', $course);

        $validated = $request->validate([
            'name' => 'string|max:255',
            'description' => 'nullable|string',
            'level' => 'in:beginner,intermediate,advanced',
            'thumbnail_url' => 'nullable|url',
            'status' => 'in:draft,published,archived',
        ]);

        $course->update($validated);

        return response()->json($course);
    }

    public function destroy(Request $request, $id)
    {
        $course = Course::findOrFail($id);
        $this->authorize('isTrainerOrAdmin', $course);

        $course->delete();

        return response()->json(['message' => 'Course deleted']);
    }

    public function modules(Request $request)
    {
        $modules = Module::with('lessons')->paginate(10);

        return response()->json($modules);
    }

    public function showModule(Request $request, $id)
    {
        $module = Module::with(['lessons', 'quizzes'])->findOrFail($id);

        return response()->json($module);
    }

    public function storeModule(Request $request)
    {
        $this->authorize('isTrainerOrAdmin', new Module);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'course_id' => 'required|exists:courses,id',
            'description' => 'nullable|string',
        ]);

        $module = Module::create($validated);

        return response()->json($module, 201);
    }

    public function showLesson(Request $request, $id)
    {
        $lesson = Lesson::findOrFail($id);
        $user = $request->user();

        $progress = UserProgress::where('user_id', $user->id)
            ->where('lesson_id', $id)
            ->first();

        return response()->json([
            'lesson' => $lesson,
            'progress' => $progress ?? [
                'progress_percentage' => 0,
                'is_completed' => false,
                'time_spent_minutes' => 0,
            ],
        ]);
    }

    public function updateLessonProgress(Request $request, $id)
    {
        $lesson = Lesson::findOrFail($id);
        $user = $request->user();

        $validated = $request->validate([
            'progress_percentage' => 'integer|min:0|max:100',
            'time_spent_minutes' => 'integer|min:0',
            'is_completed' => 'boolean',
        ]);

        // Fetch existing record first so we can accumulate time and check prior completion
        $existing = UserProgress::where('user_id', $user->id)->where('lesson_id', $id)->first();
        $wasAlreadyCompleted = $existing?->is_completed ?? false;

        $progress = UserProgress::updateOrCreate(
            ['user_id' => $user->id, 'lesson_id' => $id],
            [
                'progress_percentage' => $validated['progress_percentage'] ?? 0,
                'time_spent_minutes'  => ($existing?->time_spent_minutes ?? 0) + ($validated['time_spent_minutes'] ?? 0),
                'is_completed'        => $validated['is_completed'] ?? false,
                'completed_at'        => ($validated['is_completed'] ?? false) ? now() : null,
                'started_at'          => $existing?->started_at ?? now(),
            ]
        );

        // Award 10 points only on first completion — never double-count
        if (($validated['is_completed'] ?? false) && !$wasAlreadyCompleted) {
            $points = \App\Models\Points::firstOrCreate(
                ['user_id' => $user->id],
                ['total_points' => 0, 'quiz_points' => 0, 'assignment_points' => 0, 'streak_bonus' => 0, 'daily_streak' => 0]
            );
            $points->increment('total_points', 10);

            $today        = now()->toDateString();
            $lastActivity = $points->last_activity_date ? $points->last_activity_date->toDateString() : null;

            if ($lastActivity === $today) {
                $currentStreak = $points->daily_streak;
            } else {
                $currentStreak = ($lastActivity === now()->subDay()->toDateString())
                    ? $points->daily_streak + 1
                    : 1;
                if ($currentStreak > 1) {
                    $points->increment('streak_bonus', 5);
                    $points->increment('total_points', 5);
                }
            }

            $points->forceFill([
                'daily_streak'       => $currentStreak,
                'last_activity_date' => now()->toDateString(),
            ])->save();
        }

        return response()->json($progress);
    }
}
