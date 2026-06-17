<?php

namespace App\Http\Controllers\Api;

use App\Models\LearningPath;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class LearningPathController extends Controller
{
    public function index()
    {
        try {
            $paths = LearningPath::where('created_by', auth()->id())
                ->withCount('modules')
                ->paginate(12);

            $formattedPaths = [];
            foreach ($paths as $path) {
                $formattedPaths[] = [
                    'id' => $path->id,
                    'title' => $path->title,
                    'description' => $path->description,
                    'target_division' => $path->target_division,
                    'target_role' => $path->target_role,
                    'duration' => $path->duration,
                    'modules_count' => $path->modules_count ?? 0,
                    'status' => $path->status,
                ];
            }

            return response()->json([
                'paths' => $formattedPaths,
                'total' => $paths->total(),
                'per_page' => $paths->perPage(),
            ]);
        } catch (\Exception $e) {
            \Log::error('Learning Path index error: ' . $e->getMessage() . ' | ' . $e->getFile() . ':' . $e->getLine());
            return response()->json([
                'message' => 'Error fetching learning paths: ' . $e->getMessage(),
                'paths' => [],
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'target_division' => 'nullable|string',
                'target_role' => 'nullable|string',
                'duration' => 'nullable|integer',
            ]);

            $path = LearningPath::create([
                'title' => $validated['title'],
                'description' => $validated['description'] ?: null,
                'target_division' => $validated['target_division'] ?: null,
                'target_role' => $validated['target_role'] ?: null,
                'duration' => $validated['duration'] ?? 0,
                'created_by' => auth()->id(),
                'status' => 'draft',
            ]);

            return response()->json([
                'message' => 'Learning path created successfully',
                'path' => $path,
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Learning Path creation error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to create learning path: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function show(string $id)
    {
        try {
            $path = LearningPath::with('modules')
                ->where('created_by', auth()->id())
                ->findOrFail($id);

            return response()->json([
                'path' => $path,
                'modules' => $path->modules,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Learning path not found',
            ], 404);
        }
    }

    public function update(Request $request, string $id)
    {
        try {
            $path = LearningPath::where('created_by', auth()->id())->findOrFail($id);

            $validated = $request->validate([
                'title' => 'sometimes|string|max:255',
                'description' => 'nullable|string',
                'target_division' => 'nullable|string',
                'target_role' => 'nullable|string',
                'duration' => 'nullable|integer',
                'status' => 'nullable|in:draft,published,archived',
            ]);

            $path->update($validated);

            return response()->json([
                'message' => 'Learning path updated successfully',
                'path' => $path,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update learning path',
            ], 500);
        }
    }

    public function destroy(string $id)
    {
        try {
            $path = LearningPath::where('created_by', auth()->id())->findOrFail($id);
            $path->delete();

            return response()->json([
                'message' => 'Learning path deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete learning path',
            ], 500);
        }
    }

    public function addModule(Request $request, string $id)
    {
        try {
            $path = LearningPath::where('created_by', auth()->id())->findOrFail($id);

            $validated = $request->validate([
                'module_id' => 'required|exists:modules,id',
            ]);

            $path->modules()->attach($validated['module_id']);

            return response()->json([
                'message' => 'Module added to learning path',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to add module',
            ], 500);
        }
    }

    public function removeModule(string $pathId, string $moduleId)
    {
        try {
            $path = LearningPath::where('created_by', auth()->id())->findOrFail($pathId);
            $path->modules()->detach($moduleId);

            return response()->json([
                'message' => 'Module removed from learning path',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to remove module',
            ], 500);
        }
    }

    // Staff/User endpoint: Get single learning path with modules + completion status
    public function userShow(string $id)
    {
        try {
            $user = auth()->user();

            $path = LearningPath::with(['modules.lessons'])
                ->where('status', 'published')
                ->findOrFail($id);

            $formattedModules = [];
            foreach ($path->modules as $idx => $module) {
                $lessons = $module->lessons;
                $totalLessons = $lessons->count();
                $completedLessons = 0;

                foreach ($lessons as $lesson) {
                    $done = \App\Models\UserProgress::where('user_id', $user->id)
                        ->where('lesson_id', $lesson->id)
                        ->where('is_completed', true)
                        ->exists();
                    if ($done) $completedLessons++;
                }

                $formattedModules[] = [
                    'id'                => $module->id,
                    'stage'             => $idx + 1,
                    'title'             => $module->title,
                    'description'       => $module->description,
                    'level'             => $module->level ?? 'Dasar',
                    'duration'          => $module->duration ?? 0,
                    'lessons'           => $totalLessons,
                    'lessons_completed' => $completedLessons,
                    'completed'         => $totalLessons > 0 && $completedLessons === $totalLessons,
                    'progress'          => $totalLessons > 0 ? floor(($completedLessons / $totalLessons) * 100) : 0,
                ];
            }

            return response()->json([
                'path'    => [
                    'id'          => $path->id,
                    'title'       => $path->title,
                    'description' => $path->description,
                    'duration'    => $path->duration ?? 0,
                ],
                'modules' => $formattedModules,
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Learning path not found'], 404);
        }
    }

    // Staff/User endpoint: Get learning paths they can access based on division/role
    public function userLearningPaths()
    {
        try {
            $user = auth()->user();

            // Return ALL published paths - no division filtering
            $paths = LearningPath::where('status', 'published')
                ->with('modules')
                ->get();

            \Log::info('userLearningPaths', [
                'user_id' => $user->id,
                'total_published' => LearningPath::where('status', 'published')->count(),
                'paths_returned' => $paths->count(),
            ]);

            $formattedPaths = [];
            foreach ($paths as $path) {
                // Calculate progress for this path
                $totalLessons = 0;
                $completedLessons = 0;
                $completedModules = 0;
                $totalModules = $path->modules->count();

                foreach ($path->modules as $module) {
                    $lessons = $module->lessons()->get();
                    $moduleLessonCount = $lessons->count();
                    $moduleCompletedCount = 0;

                    foreach ($lessons as $lesson) {
                        $totalLessons++;
                        $progress = \App\Models\UserProgress::where('user_id', $user->id)
                            ->where('lesson_id', $lesson->id)
                            ->where('is_completed', true)
                            ->first();
                        if ($progress) {
                            $completedLessons++;
                            $moduleCompletedCount++;
                        }
                    }

                    // Mark module as completed if all lessons in it are completed
                    if ($moduleLessonCount > 0 && $moduleCompletedCount === $moduleLessonCount) {
                        $completedModules++;
                    }
                }

                $progressPercentage = $totalLessons > 0 ? ($completedLessons / $totalLessons) * 100 : 0;

                $formattedPaths[] = [
                    'id' => $path->id,
                    'title' => $path->title,
                    'description' => $path->description,
                    'duration' => $path->duration,
                    'duration_hours' => $path->duration ?? 0,
                    'modules_count' => $totalModules,
                    'modules_completed' => $completedModules,
                    'progress' => floor($progressPercentage),
                    'level' => 'Intermediate',
                    'last_accessed' => 'Baru saja',
                    'completed_at' => now()->format('d M Y'),
                ];
            }

            // Separate into categories based on progress (include all assigned paths)
            $inProgress = [];
            $completed = [];

            foreach ($formattedPaths as $path) {
                if ($path['progress'] >= 100) {
                    $completed[] = $path;
                } else {
                    $inProgress[] = $path;
                }
            }

            return response()->json([
                'in_progress' => $inProgress,
                'completed' => $completed,
                'total' => count($inProgress) + count($completed),
            ]);
        } catch (\Exception $e) {
            \Log::error('User Learning Paths error: ' . $e->getMessage() . ' | ' . $e->getFile() . ':' . $e->getLine());
            return response()->json([
                'message' => 'Error fetching learning paths: ' . $e->getMessage(),
                'in_progress' => [],
                'completed' => [],
                'all' => [],
            ], 500);
        }
    }
}
