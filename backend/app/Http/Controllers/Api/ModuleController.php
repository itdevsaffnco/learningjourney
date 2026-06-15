<?php

namespace App\Http\Controllers\Api;

use App\Models\Module;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class ModuleController extends Controller
{
    public function index(Request $request)
    {
        try {
            // Get all modules with lesson count and relationships
            $modules = Module::with('lessons')
                ->withCount([
                    'lessons',
                    'lessons as quiz_lessons_count' => fn($q) => $q->where('type', 'quiz'),
                    'assignments',
                ])
                ->paginate(12);

            // Format modules
            $formattedModules = [];
            foreach ($modules as $module) {
                // Calculate total duration from lessons (in hours, rounded to 1 decimal)
                $totalMinutes = $module->lessons->sum('duration_minutes') ?? 0;
                $totalHours = $totalMinutes > 0 ? round($totalMinutes / 60, 1) : 0;

                $formattedModules[] = [
                    'id' => $module->id,
                    'title' => $module->title,
                    'level' => $module->level ?? 'easy',
                    'description' => $module->description,
                    'duration' => $totalHours,
                    'objectives' => $module->objectives,
                    'lessons' => $module->lessons_count,
                    'quizzes' => $module->quiz_lessons_count,
                    'assignments' => $module->assignments_count,
                    'students' => 0,
                    'completion' => 0,
                ];
            }

            return response()->json([
                'modules' => $formattedModules,
                'total' => $modules->total(),
                'per_page' => $modules->perPage(),
            ]);
        } catch (\Exception $e) {
            \Log::error('Module index error: ' . $e->getMessage() . ' | ' . $e->getFile() . ':' . $e->getLine());
            return response()->json([
                'message' => 'Error fetching modules: ' . $e->getMessage(),
                'modules' => [],
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'level' => 'nullable|in:easy,medium,hard',
                'description' => 'required|string',
                'duration' => 'required|string',
                'objectives' => 'nullable|string',
            ]);

            // Set default level if not provided
            $level = $validated['level'] ?? 'easy';

            $module = Module::create([
                'title' => $validated['title'],
                'level' => $level,
                'description' => $validated['description'],
                'duration' => $validated['duration'],
                'objectives' => $validated['objectives'] ?? '',
                'created_by' => $request->user()->id,
                'status' => 'published',
            ]);

            return response()->json([
                'message' => 'Module created successfully',
                'module' => [
                    'id' => $module->id,
                    'title' => $module->title,
                    'level' => $module->level,
                    'description' => $module->description,
                    'duration' => $module->duration,
                    'objectives' => $module->objectives,
                    'created_by' => $module->created_by,
                    'lessons' => 0,
                    'quizzes' => 0,
                    'assignments' => 0,
                    'students' => 0,
                    'completion' => 0,
                ],
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Validation error: ' . json_encode($e->errors()));
            return response()->json([
                'message' => 'Validation error',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Module creation error: ' . $e->getMessage() . ' | ' . $e->getFile() . ':' . $e->getLine());
            return response()->json([
                'message' => 'Failed to create module: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function show($id)
    {
        $module = Module::with('lessons', 'assignments')->findOrFail($id);

        return response()->json([
            'module' => $module,
            'lessons_count' => $module->lessons->count(),
            'quizzes_count' => $module->lessons->where('type', 'quiz')->count(),
            'assignments_count' => $module->assignments->count(),
        ]);
    }

    public function update(Request $request, $id)
    {
        $module = Module::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'level' => 'sometimes|in:easy,medium,hard',
            'description' => 'sometimes|string',
            'duration' => 'sometimes|string',
            'objectives' => 'nullable|string',
        ]);

        $module->update($validated);

        return response()->json([
            'message' => 'Module updated successfully',
            'module' => $module,
        ]);
    }

    public function destroy($id)
    {
        $module = Module::findOrFail($id);

        $module->delete();

        return response()->json([
            'message' => 'Module deleted successfully',
        ]);
    }
}
