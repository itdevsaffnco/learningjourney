<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use App\Models\Points;
use App\Models\Reward;
use App\Models\User;
use App\Models\UserReward;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function profile(Request $request)
    {
        $user = $request->user()->load(['division', 'role', 'points']);

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'division' => $user->division,
            'role' => $user->role,
            'avatar_url' => $user->avatar_url,
            'bio' => $user->bio,
            'points' => $user->points?->total_points ?? 0,
            'created_at' => $user->created_at,
        ]);
    }

    public function updateProfile(Request $request)
    {
        $validated = $request->validate([
            'name' => 'string|max:255',
            'avatar_url' => 'nullable|url',
            'bio' => 'nullable|string|max:500',
        ]);

        $request->user()->update($validated);

        return response()->json($request->user());
    }

    public function changePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        // Verify current password
        if (!\Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'message' => 'Current password is incorrect',
            ], 401);
        }

        // Update password
        $user->update([
            'password' => \Hash::make($validated['password']),
        ]);

        return response()->json([
            'message' => 'Password changed successfully',
        ]);
    }

    public function points(Request $request)
    {
        $user = $request->user();
        $points = $user->points;

        return response()->json([
            'total_points' => $points?->total_points ?? 0,
            'quiz_points' => $points?->quiz_points ?? 0,
            'assignment_points' => $points?->assignment_points ?? 0,
            'streak_bonus' => $points?->streak_bonus ?? 0,
            'daily_streak' => $points?->daily_streak ?? 0,
        ]);
    }

    public function certificates(Request $request)
    {
        $user = $request->user();
        // course_id stores learning_path_id for path-based certificates
        $certificates = Certificate::where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($cert) {
                $path = \App\Models\LearningPath::find($cert->course_id);
                return [
                    'id'                  => $cert->id,
                    'certificate_number'  => $cert->certificate_number,
                    'status'              => $cert->status,
                    'issued_date'         => $cert->issued_date,
                    'created_at'          => $cert->created_at,
                    'learning_path_id'    => $cert->course_id,
                    'learning_path_title' => $path?->title ?? 'Unknown Path',
                ];
            });

        return response()->json($certificates);
    }

    public function requestCertificate(Request $request)
    {
        $validated = $request->validate([
            'learning_path_id' => 'required|exists:learning_paths,id',
        ]);

        $user = $request->user();
        $pathId = $validated['learning_path_id'];

        // Verify the learning path is fully completed
        $path = \App\Models\LearningPath::with('modules.lessons')->findOrFail($pathId);

        $totalLessons = 0;
        $completedLessons = 0;
        foreach ($path->modules as $module) {
            foreach ($module->lessons as $lesson) {
                $totalLessons++;
                $done = \App\Models\UserProgress::where('user_id', $user->id)
                    ->where('lesson_id', $lesson->id)
                    ->where('is_completed', true)
                    ->exists();
                if ($done) $completedLessons++;
            }
        }

        if ($totalLessons === 0 || $completedLessons < $totalLessons) {
            return response()->json(['message' => 'Selesaikan semua modul learning path terlebih dahulu'], 422);
        }

        $existing = Certificate::where('user_id', $user->id)
            ->where('course_id', $pathId)
            ->first();

        if ($existing) {
            return response()->json(['message' => 'Request sudah ada', 'certificate' => $existing], 422);
        }

        $certificate = Certificate::create([
            'user_id'            => $user->id,
            'course_id'          => $pathId,
            'certificate_number' => 'CERT-' . strtoupper(substr(md5($user->id . '-LP-' . $pathId . '-' . time()), 0, 8)),
            'issued_date'        => now(),
            'status'             => 'pending',
        ]);

        return response()->json([
            'message'     => 'Request berhasil dikirim',
            'certificate' => $certificate,
        ], 201);
    }

    public function certificateRequests(Request $request)
    {
        $status = $request->query('status', 'pending');

        $certificates = Certificate::where('status', $status)
            ->with('user.division')
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($cert) {
                $path = \App\Models\LearningPath::find($cert->course_id);
                return [
                    'id'                  => $cert->id,
                    'certificate_number'  => $cert->certificate_number,
                    'status'              => $cert->status,
                    'issued_date'         => $cert->issued_date,
                    'created_at'          => $cert->created_at,
                    'learning_path_title' => $path?->title ?? 'Unknown Path',
                    'user_name'           => $cert->user->name,
                    'user_division'       => $cert->user->division?->name ?? '-',
                ];
            });

        return response()->json(['requests' => $certificates]);
    }

    public function approveCertificate(Request $request, $id)
    {
        $cert = Certificate::findOrFail($id);
        $cert->update(['status' => 'issued', 'issued_date' => now()]);

        return response()->json(['message' => 'Sertifikat disetujui', 'certificate' => $cert]);
    }

    public function rejectCertificate(Request $request, $id)
    {
        $cert = Certificate::findOrFail($id);
        $cert->update(['status' => 'rejected']);

        return response()->json(['message' => 'Sertifikat ditolak', 'certificate' => $cert]);
    }

    public function rewards(Request $request)
    {
        $allRewards = Reward::where('is_active', true)->get();
        $userRewardsIds = UserReward::where('user_id', $request->user()->id)
            ->pluck('reward_id')
            ->toArray();

        return response()->json([
            'available' => $allRewards,
            'redeemed' => $userRewardsIds,
        ]);
    }

    public function redeemReward(Request $request, $rewardId)
    {
        $user = $request->user();
        $reward = Reward::findOrFail($rewardId);

        $points = $user->points;

        if (!$points || $points->total_points < $reward->points_required) {
            return response()->json([
                'message' => 'Insufficient points to redeem this reward',
            ], 400);
        }

        if ($reward->stock <= 0) {
            return response()->json([
                'message' => 'Reward out of stock',
            ], 400);
        }

        $reward->decrement('stock');
        $points->decrement('total_points', $reward->points_required);

        $userReward = UserReward::create([
            'user_id' => $user->id,
            'reward_id' => $rewardId,
            'redeemed_at' => now(),
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Reward redeemed successfully',
            'user_reward' => $userReward,
        ]);
    }

    public function dashboard(Request $request)
    {
        $user = $request->user()->load(['division', 'points', 'progress']);

        $completedLessons = $user->progress->where('is_completed', true)->count();
        $totalLessons = \App\Models\Lesson::whereHas('module', fn($q) => $q->where('status', 'published'))->count();

        return response()->json([
            'user' => [
                'name' => $user->name,
                'division' => $user->division?->name,
                'avatar_url' => $user->avatar_url,
            ],
            'stats' => [
                'total_points'         => $user->points?->total_points ?? 0,
                'daily_streak'         => $user->points?->daily_streak ?? 0,
                'lessons_completed'    => $completedLessons,
                'total_lessons'        => $totalLessons,
                'completion_percentage' => $totalLessons > 0 ? round(($completedLessons / $totalLessons) * 100) : 0,
            ],
        ]);
    }

    public function allUsers(Request $request)
    {
        $this->authorize('isAdmin', new User);

        $users = User::with(['division', 'role', 'points'])
            ->paginate(20);

        return response()->json($users);
    }

    public function createUser(Request $request)
    {
        $this->authorize('isAdmin', new User);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8',
            'division_id' => 'required|exists:divisions,id',
            'role_id' => 'required|exists:roles,id',
        ]);

        $user = User::create([
            ...$validated,
            'password' => Hash::make($validated['password']),
        ]);

        $user->points()->create([
            'total_points' => 0,
            'quiz_points' => 0,
            'assignment_points' => 0,
        ]);

        return response()->json($user, 201);
    }

    public function updateUser(Request $request, $id)
    {
        $this->authorize('isAdmin', new User);

        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'string|max:255',
            'email' => 'email|unique:users,email,' . $id,
            'division_id' => 'exists:divisions,id',
            'role_id' => 'exists:roles,id',
        ]);

        $user->update($validated);

        return response()->json($user);
    }

    public function deleteUser(Request $request, $id)
    {
        $this->authorize('isAdmin', new User);

        User::findOrFail($id)->delete();

        return response()->json(['message' => 'User deleted']);
    }

    public function studentProgress(Request $request)
    {
        $students = User::whereHas('role', fn($q) => $q->where('name', 'Staff'))
            ->with(['progress', 'points'])
            ->get()
            ->map(function ($user) {
                $completedLessons = $user->progress->where('is_completed', true)->count();
                $totalLessons = $user->progress->count();
                $completionRate = $totalLessons > 0 ? $completedLessons / $totalLessons : 0;

                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'completed_lessons' => $completedLessons,
                    'total_points' => $user->points?->total_points ?? 0,
                    'completion_rate' => $completionRate,
                ];
            });

        return response()->json([
            'students' => $students,
        ]);
    }

    public function studentDetailedProgress(Request $request, $userId)
    {
        $student = User::with(['progress.lesson', 'points', 'assignments'])
            ->findOrFail($userId);

        $completedLessons = $student->progress->where('is_completed', true)->count();
        $totalLessons = $student->progress->count();
        $completionRate = $totalLessons > 0 ? $completedLessons / $totalLessons : 0;

        // Get modules from completed lessons
        $completedModuleIds = $student->progress
            ->where('is_completed', true)
            ->pluck('lesson.module_id')
            ->unique()
            ->toArray();

        $modulesLearned = \App\Models\Module::whereIn('id', $completedModuleIds)
            ->with('lessons')
            ->get()
            ->map(function ($module) use ($userId) {
                $quizLessons = $module->lessons->where('type', 'quiz')->filter(fn($l) => $l->quiz_id);

                $quizStats = $quizLessons->map(function ($lesson) use ($userId) {
                    $quiz = \App\Models\Quiz::find($lesson->quiz_id);
                    if (!$quiz) return null;

                    $submissions = \App\Models\QuizSubmission::where('user_id', $userId)
                        ->where('quiz_id', $lesson->quiz_id)
                        ->orderBy('created_at', 'asc')
                        ->get();

                    $bestScore = $submissions->max('score');
                    $passingScore = $quiz->passing_score ?? 70;

                    return [
                        'lesson_title' => $lesson->title,
                        'quiz_id' => $lesson->quiz_id,
                        'passing_score' => $passingScore,
                        'attempts' => $submissions->count(),
                        'best_score' => $bestScore,
                        'passed' => $bestScore !== null && $bestScore >= $passingScore,
                        'attempt_details' => $submissions->values()->map(fn($s, $i) => [
                            'attempt_number' => $i + 1,
                            'score' => $s->score,
                            'correct_answers' => $s->correct_answers,
                            'total_questions' => $s->total_questions,
                            'submitted_at' => $s->submitted_at?->format('d M Y, H:i'),
                        ]),
                    ];
                })->filter()->values();

                return [
                    'id' => $module->id,
                    'title' => $module->title,
                    'description' => $module->description,
                    'lessons_count' => $module->lessons->count(),
                    'duration_minutes' => $module->lessons->sum('duration_minutes') ?? 0,
                    'quiz_stats' => $quizStats,
                ];
            });

        // Get assignment submissions for this student
        $assignmentSubmissions = \App\Models\AssignmentSubmission::where('user_id', $userId)
            ->with('assignment')
            ->get()
            ->map(function ($submission) {
                return [
                    'id' => $submission->id,
                    'title' => $submission->assignment?->title,
                    'description' => $submission->assignment?->description,
                    'status' => $submission->status,
                    'score' => $submission->score,
                    'max_score' => $submission->assignment?->max_score ?? 100,
                    'submitted_at' => $submission->submitted_at,
                ];
            });

        $progressDetails = $student->progress->map(function ($progress) {
            return [
                'lesson_id' => $progress->lesson_id,
                'lesson_name' => $progress->lesson?->title,
                'progress_percentage' => $progress->progress_percentage,
                'time_spent_minutes' => $progress->time_spent_minutes,
                'is_completed' => $progress->is_completed,
                'completed_at' => $progress->completed_at,
                'started_at' => $progress->started_at,
            ];
        });

        return response()->json([
            'student' => [
                'id' => $student->id,
                'name' => $student->name,
                'email' => $student->email,
                'division' => $student->division?->name,
            ],
            'progress_summary' => [
                'completed_lessons' => $completedLessons,
                'total_lessons' => $totalLessons,
                'completion_rate' => $completionRate,
                'total_points' => $student->points?->total_points ?? 0,
                'quiz_points' => $student->points?->quiz_points ?? 0,
                'assignment_points' => $student->points?->assignment_points ?? 0,
            ],
            'modules_learned' => $modulesLearned,
            'assignment_results' => $assignmentSubmissions,
            'lesson_progress' => $progressDetails,
        ]);
    }

    public function announcements(Request $request)
    {
        $announcements = \App\Models\Announcement::where('status', 'published')
            ->whereHas('creator', fn($q) => $q->whereHas('role', fn($r) => $r->where('name', 'Trainer')))
            ->orderByDesc('published_at')
            ->with('creator:id,name')
            ->get();

        return response()->json($announcements);
    }

    public function trainerAnnouncements(Request $request)
    {
        $user = $request->user();
        $announcements = \App\Models\Announcement::where('created_by', $user->id)
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'announcements' => $announcements,
        ]);
    }

    public function createAnnouncement(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        $announcement = \App\Models\Announcement::create([
            ...$validated,
            'created_by' => $request->user()->id,
            'status' => 'published',
            'published_at' => now(),
        ]);

        return response()->json([
            'message' => 'Announcement created successfully',
            'announcement' => $announcement,
        ], 201);
    }

    public function updateAnnouncement(Request $request, $id)
    {
        $announcement = \App\Models\Announcement::findOrFail($id);

        if ($announcement->created_by !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title' => 'string|max:255',
            'content' => 'string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
        ]);

        $announcement->update($validated);

        return response()->json([
            'message' => 'Announcement updated successfully',
            'announcement' => $announcement,
        ]);
    }

    public function deleteAnnouncement(Request $request, $id)
    {
        $announcement = \App\Models\Announcement::findOrFail($id);

        if ($announcement->created_by !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $announcement->delete();

        return response()->json([
            'message' => 'Announcement deleted successfully',
        ]);
    }

    public function trainerDashboard(Request $request)
    {
        $user = $request->user();

        // Get staff count by role
        $staffRole = \App\Models\Role::where('name', 'Staff')->first();
        $totalStaff = $staffRole ? User::where('role_id', $staffRole->id)->count() : 0;
        $activeStudents = $staffRole ? User::where('role_id', $staffRole->id)->whereNotNull('last_login_at')->count() : 0;

        // Get trainer's module count
        $totalModules = \App\Models\Module::where('created_by', $user->id)->count();

        // Get trainer's quiz count
        $totalQuizzes = \App\Models\Quiz::where('created_by', $user->id)->count();

        // Get trainer's assignment count
        $totalAssignments = \App\Models\Assignment::where('created_by', $user->id)->count();

        // Get trainer's learning path count
        $totalPaths = \App\Models\LearningPath::where('created_by', $user->id)->count();

        // Calculate average rating from student feedback (if implemented)
        $avgRating = 4.8; // Placeholder

        // Get recent quiz submissions (from quizzes created by this trainer)
        $recentQuizSubmissions = [];
        try {
            $recentQuizSubmissions = \DB::table('quiz_submissions')
                ->join('quizzes', 'quiz_submissions.quiz_id', '=', 'quizzes.id')
                ->join('users', 'quiz_submissions.user_id', '=', 'users.id')
                ->where('quizzes.created_by', $user->id)
                ->select('users.name as user_name', 'quizzes.title as quiz_title', 'quiz_submissions.submitted_at')
                ->orderBy('quiz_submissions.submitted_at', 'DESC')
                ->limit(10)
                ->get();
        } catch (\Exception $e) {
            \Log::error('Error fetching quiz submissions: ' . $e->getMessage());
        }

        // Get recent assignment submissions (from assignments created by this trainer)
        $recentAssignmentSubmissions = [];
        try {
            $submissions = \App\Models\AssignmentSubmission::with('user', 'assignment')
                ->whereHas('assignment', fn($q) => $q->where('created_by', $user->id))
                ->orderBy('submitted_at', 'DESC')
                ->limit(10)
                ->get();

            $recentAssignmentSubmissions = $submissions->map(function($submission) {
                return [
                    'user_name' => $submission->user?->name,
                    'assignment_title' => $submission->assignment?->title,
                    'submitted_at' => $submission->submitted_at,
                ];
            })->toArray();
        } catch (\Exception $e) {
            \Log::error('Error fetching assignment submissions: ' . $e->getMessage());
        }

        // Get recent module completions (from modules created by this trainer)
        $recentCompletions = [];
        try {
            $completions = \App\Models\UserProgress::where('is_completed', true)
                ->with('lesson.module', 'user')
                ->orderBy('completed_at', 'DESC')
                ->limit(10)
                ->get();

            $recentCompletions = $completions
                ->filter(fn($c) => $c->lesson?->module?->created_by == $user->id)
                ->map(function($completion) {
                    return [
                        'user_name' => $completion->user?->name,
                        'module_title' => $completion->lesson?->module?->title,
                        'completed_at' => $completion->completed_at,
                    ];
                })
                ->values()
                ->toArray();
        } catch (\Exception $e) {
            \Log::error('Error fetching completions: ' . $e->getMessage());
        }

        return response()->json([
            'stats' => [
                'totalStaff' => $totalStaff,
                'totalModules' => $totalModules,
                'totalQuizzes' => $totalQuizzes,
                'totalAssignments' => $totalAssignments,
                'totalPaths' => $totalPaths,
                'activeStudents' => $activeStudents,
                'avgRating' => $avgRating,
            ],
            'recent_quiz_submissions' => $recentQuizSubmissions,
            'recent_assignment_submissions' => $recentAssignmentSubmissions,
            'recent_completions' => $recentCompletions,
        ]);
    }

    public function trainerStaffList(Request $request)
    {
        $staffRole = \App\Models\Role::where('name', 'Staff')->first();
        $staff = User::where('role_id', $staffRole?->id)
            ->with(['division', 'role'])
            ->get();

        return response()->json([
            'data' => $staff,
        ]);
    }

    public function trainerCreateStaff(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8',
            'division_id' => 'required|exists:divisions,id',
            'role_id' => 'required|exists:roles,id',
        ]);

        $user = User::create([
            ...$validated,
            'password' => Hash::make($validated['password']),
        ]);

        $user->points()->create([
            'total_points' => 0,
            'quiz_points' => 0,
            'assignment_points' => 0,
        ]);

        return response()->json([
            'message' => 'Staff created successfully',
            'data' => $user->load(['division', 'role']),
        ], 201);
    }

    public function trainerUpdateStaff(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'string|max:255',
            'division_id' => 'exists:divisions,id',
            'role_id' => 'exists:roles,id',
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Staff updated successfully',
            'data' => $user->load(['division', 'role']),
        ]);
    }

    public function trainerDeleteStaff(Request $request, $id)
    {
        User::findOrFail($id)->delete();

        return response()->json([
            'message' => 'Staff deleted successfully',
        ]);
    }

    public function getRoles(Request $request)
    {
        $roles = \App\Models\Role::all();

        return response()->json([
            'data' => $roles,
        ]);
    }

    public function getDivisions(Request $request)
    {
        $divisions = \App\Models\Division::all();

        return response()->json([
            'data' => $divisions,
        ]);
    }

    public function createDivision(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:divisions',
        ]);

        $division = \App\Models\Division::create($validated);

        return response()->json([
            'data' => $division,
        ], 201);
    }

    public function activityLogs(Request $request)
    {
        $user = $request->user();

        // Get recent activities - combine multiple sources
        $activities = [];

        // Recent modules created by this trainer
        $modules = \App\Models\Module::where('created_by', $user->id)
            ->orderBy('created_at', 'DESC')
            ->limit(20)
            ->get()
            ->map(function($module) use ($user) {
                return [
                    'type' => 'module_created',
                    'description' => "Module \"$module->title\" created",
                    'user' => $user->name,
                    'created_at' => $module->created_at,
                ];
            });
        $activities = array_merge($activities, $modules->toArray());

        // Recent quizzes created by this trainer
        $quizzes = \App\Models\Quiz::where('created_by', $user->id)
            ->orderBy('created_at', 'DESC')
            ->limit(20)
            ->get()
            ->map(function($quiz) use ($user) {
                return [
                    'type' => 'quiz_created',
                    'description' => "Quiz \"$quiz->title\" created",
                    'user' => $user->name,
                    'created_at' => $quiz->created_at,
                ];
            });
        $activities = array_merge($activities, $quizzes->toArray());

        // Recent assignments created by this trainer
        $assignments = \App\Models\Assignment::where('created_by', $user->id)
            ->orderBy('created_at', 'DESC')
            ->limit(20)
            ->get()
            ->map(function($assignment) use ($user) {
                return [
                    'type' => 'assignment_created',
                    'description' => "Assignment \"$assignment->title\" created",
                    'user' => $user->name,
                    'created_at' => $assignment->created_at,
                ];
            });
        $activities = array_merge($activities, $assignments->toArray());

        // Recent learning paths created by this trainer
        $paths = \App\Models\LearningPath::where('created_by', $user->id)
            ->orderBy('created_at', 'DESC')
            ->limit(20)
            ->get()
            ->map(function($path) use ($user) {
                return [
                    'type' => 'learning_path_created',
                    'description' => "Learning Path \"$path->title\" created",
                    'user' => $user->name,
                    'created_at' => $path->created_at,
                ];
            });
        $activities = array_merge($activities, $paths->toArray());

        // Recent announcements created by this trainer
        $announcements = \App\Models\Announcement::where('created_by', $user->id)
            ->orderBy('created_at', 'DESC')
            ->limit(20)
            ->get()
            ->map(function($announcement) use ($user) {
                return [
                    'type' => 'announcement_created',
                    'description' => "Announcement \"$announcement->title\" created",
                    'user' => $user->name,
                    'created_at' => $announcement->created_at,
                ];
            });
        $activities = array_merge($activities, $announcements->toArray());

        // Sort by created_at (newest first)
        usort($activities, function($a, $b) {
            return strtotime($b['created_at']) - strtotime($a['created_at']);
        });

        // Take top 100
        $activities = array_slice($activities, 0, 100);

        return response()->json([
            'logs' => $activities,
        ]);
    }
}
