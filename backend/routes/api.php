<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\ModuleController;
use App\Http\Controllers\Api\LessonController;
use App\Http\Controllers\Api\LearningPathController;
use App\Http\Controllers\Api\QuizController;
use App\Http\Controllers\Api\AssignmentController;
use App\Http\Controllers\Api\LeaderboardController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\MysteryShopperController;
use App\Http\Controllers\Api\ImageController;

Route::middleware('api')->group(function () {
    // Public Auth Routes (No authentication required)
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);

    // Public Assignment Submission
    Route::get('/assignments/{id}', [AssignmentController::class, 'show']);
    Route::post('/assignments/{id}/submit', [AssignmentController::class, 'submitPublic']);

    // Public Mystery Shopper (no login required)
    Route::get('/mystery-shopper/public/questions', [MysteryShopperController::class, 'questions']);
    Route::post('/mystery-shopper/public/submit', [MysteryShopperController::class, 'submitPublic']);

    Route::middleware('auth:sanctum')->group(function () {
        // Auth Management
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/user', [AuthController::class, 'user']);

        // === SHARED ROUTES (All Authenticated Users) ===

        // User Profile & Personal Data
        Route::get('/profile', [UserController::class, 'profile']);
        Route::put('/profile', [UserController::class, 'updateProfile']);
        Route::post('/change-password', [UserController::class, 'changePassword']);
        Route::get('/points', [UserController::class, 'points']);
        Route::get('/certificates', [UserController::class, 'certificates']);
        Route::post('/certificates/request', [UserController::class, 'requestCertificate']);
        Route::get('/rewards', [UserController::class, 'rewards']);
        Route::post('/rewards/{id}/redeem', [UserController::class, 'redeemReward']);
        Route::get('/dashboard', [UserController::class, 'dashboard']);

        // Shared Resources
        Route::get('/roles', [UserController::class, 'getRoles']);
        Route::get('/divisions', [UserController::class, 'getDivisions']);
        Route::post('/divisions', [UserController::class, 'createDivision']);

        // Announcements (All users can view)
        Route::get('/announcements', [UserController::class, 'announcements']);

        // View Courses & Learning Content (Read-only for Staff, Full for Trainer)
        Route::get('/courses', [CourseController::class, 'index']);
        Route::get('/courses/{id}', [CourseController::class, 'show']);
        Route::get('/modules', [CourseController::class, 'modules']);
        Route::get('/modules/{id}', [CourseController::class, 'showModule']);
        Route::get('/lessons/{id}', [CourseController::class, 'showLesson']);
        Route::get('/modules/{moduleId}/lessons', [LessonController::class, 'index']);

        // User Learning Paths (Staff can view their enrolled paths)
        Route::get('/user/learning-paths', [LearningPathController::class, 'userLearningPaths']);
        Route::get('/user/learning-paths/{id}', [LearningPathController::class, 'userShow']);

        // View Quizzes & Assignments
        Route::get('/quizzes', [QuizController::class, 'index']);
        Route::get('/quizzes/{id}', [QuizController::class, 'show']);
        Route::get('/assignments', [AssignmentController::class, 'index']);
        Route::post('/assignments/video-upload', [AssignmentController::class, 'uploadVideo']);

        // Community & Gamification (All Users)
        Route::get('/leaderboard', [LeaderboardController::class, 'index']);
        Route::get('/leaderboard/division/{divisionId}', [LeaderboardController::class, 'byDivision']);
        Route::get('/leaderboard/streak', [LeaderboardController::class, 'streak']);

        // Mystery Shopper - questions visible to all, submit for staff
        Route::get('/mystery-shopper/questions', [MysteryShopperController::class, 'questions']);

        // === STAFF ONLY ROUTES ===
        Route::middleware('staff')->group(function () {
            // Mystery Shopper - staff can submit
            Route::post('/mystery-shopper/submit', [MysteryShopperController::class, 'submit']);

            // Complete Lessons
            Route::post('/lessons/{id}/progress', [CourseController::class, 'updateLessonProgress']);

            // Take Quizzes
            Route::post('/quizzes/{id}/submit', [QuizController::class, 'submit']);
            Route::get('/quizzes/{id}/results', [QuizController::class, 'results']);

            // Submit Assignments
            Route::post('/assignments/{id}/submit', [AssignmentController::class, 'submit']);
        });

        // === TRAINER ROUTES ===
        Route::middleware('trainer')->group(function () {
            // Image upload for lesson content
            Route::post('/trainer/upload-image', [ImageController::class, 'upload']);

            // Dashboard
            Route::get('/trainer/dashboard', [UserController::class, 'trainerDashboard']);

            // Staff Management
            Route::get('/trainer/staff', [UserController::class, 'trainerStaffList']);
            Route::post('/trainer/staff', [UserController::class, 'trainerCreateStaff']);
            Route::put('/trainer/staff/{id}', [UserController::class, 'trainerUpdateStaff']);
            Route::delete('/trainer/staff/{id}', [UserController::class, 'trainerDeleteStaff']);
            // Course Management
            Route::post('/courses', [CourseController::class, 'store']);
            Route::put('/courses/{id}', [CourseController::class, 'update']);
            Route::delete('/courses/{id}', [CourseController::class, 'destroy']);

            // Module Management
            Route::get('/trainer/modules', [ModuleController::class, 'index']);
            Route::post('/trainer/modules', [ModuleController::class, 'store']);
            Route::put('/trainer/modules/{id}', [ModuleController::class, 'update']);
            Route::delete('/trainer/modules/{id}', [ModuleController::class, 'destroy']);

            // Lesson Management
            Route::get('/modules/{moduleId}/lessons', [LessonController::class, 'index']);
            Route::post('/modules/{moduleId}/lessons', [LessonController::class, 'store']);
            Route::get('/modules/{moduleId}/lessons/{id}', [LessonController::class, 'show']);
            Route::put('/modules/{moduleId}/lessons/{id}', [LessonController::class, 'update']);
            Route::delete('/modules/{moduleId}/lessons/{id}', [LessonController::class, 'destroy']);
            Route::post('/modules/{moduleId}/lessons/reorder', [LessonController::class, 'reorder']);

            // Quiz Management (Create, Edit, Delete)
            Route::get('/trainer/quizzes', [QuizController::class, 'trainerIndex']);
            Route::post('/trainer/quizzes', [QuizController::class, 'trainerStore']);
            Route::get('/trainer/quizzes/{id}', [QuizController::class, 'trainerShow']);
            Route::put('/trainer/quizzes/{id}', [QuizController::class, 'trainerUpdate']);
            Route::delete('/trainer/quizzes/{id}', [QuizController::class, 'trainerDestroy']);
            Route::post('/trainer/quizzes/{quizId}/questions', [QuizController::class, 'createQuestion']);
            Route::put('/trainer/quizzes/{quizId}/questions/{questionId}', [QuizController::class, 'updateQuestion']);
            Route::delete('/trainer/quizzes/{quizId}/questions/{questionId}', [QuizController::class, 'deleteQuestion']);
            Route::get('/trainer/quizzes/{quizId}/submissions', [QuizController::class, 'trainerSubmissions']);
            Route::get('/trainer/quizzes/{quizId}/submissions/{submissionId}', [QuizController::class, 'trainerSubmissionDetail']);
            Route::post('/quizzes', [QuizController::class, 'store']);
            Route::put('/quizzes/{id}', [QuizController::class, 'update']);
            Route::delete('/quizzes/{id}', [QuizController::class, 'destroy']);

            // Assignment Management (Create, Edit, Delete)
            Route::get('/trainer/assignments', [AssignmentController::class, 'trainerIndex']);
            Route::post('/trainer/assignments', [AssignmentController::class, 'trainerStore']);
            Route::get('/trainer/assignments/{id}', [AssignmentController::class, 'trainerShow']);
            Route::put('/trainer/assignments/{id}', [AssignmentController::class, 'trainerUpdate']);
            Route::delete('/trainer/assignments/{id}', [AssignmentController::class, 'trainerDestroy']);
            Route::post('/trainer/assignments/{assignmentId}/questions', [AssignmentController::class, 'createQuestion']);
            Route::put('/trainer/assignments/{assignmentId}/questions/{questionId}', [AssignmentController::class, 'updateQuestion']);
            Route::delete('/trainer/assignments/{assignmentId}/questions/{questionId}', [AssignmentController::class, 'deleteQuestion']);
            Route::get('/assignments/{id}/submissions', [AssignmentController::class, 'submissions']);
            Route::post('/assignments', [AssignmentController::class, 'store']);
            Route::put('/assignments/{id}', [AssignmentController::class, 'update']);
            Route::delete('/assignments/{id}', [AssignmentController::class, 'destroy']);

            // Grading & Student Submissions
            Route::get('/assignments/{id}/submissions', [AssignmentController::class, 'submissions']);
            Route::post('/assignments/{id}/grade', [AssignmentController::class, 'grade']);
            Route::delete('/assignments/submissions/{submissionId}/remedial', [AssignmentController::class, 'remedial']);

            // Learning Paths
            Route::get('/trainer/learning-paths', [LearningPathController::class, 'index']);
            Route::post('/trainer/learning-paths', [LearningPathController::class, 'store']);
            Route::get('/trainer/learning-paths/{id}', [LearningPathController::class, 'show']);
            Route::put('/trainer/learning-paths/{id}', [LearningPathController::class, 'update']);
            Route::delete('/trainer/learning-paths/{id}', [LearningPathController::class, 'destroy']);
            Route::post('/trainer/learning-paths/{id}/modules', [LearningPathController::class, 'addModule']);
            Route::delete('/trainer/learning-paths/{pathId}/modules/{moduleId}', [LearningPathController::class, 'removeModule']);

            // Progress Monitoring
            Route::get('/progress/students', [UserController::class, 'studentProgress']);
            Route::get('/progress/students/{userId}', [UserController::class, 'studentDetailedProgress']);

            // Activity Logs
            Route::get('/activity-logs', [UserController::class, 'activityLogs']);

            // Announcements
            Route::get('/trainer/announcements', [UserController::class, 'trainerAnnouncements']);
            Route::post('/announcements', [UserController::class, 'createAnnouncement']);
            Route::put('/announcements/{id}', [UserController::class, 'updateAnnouncement']);
            Route::delete('/announcements/{id}', [UserController::class, 'deleteAnnouncement']);

            // Mystery Shopper Management
            Route::post('/mystery-shopper/questions', [MysteryShopperController::class, 'createQuestion']);
            Route::put('/mystery-shopper/questions/{id}', [MysteryShopperController::class, 'updateQuestion']);
            Route::delete('/mystery-shopper/questions/{id}', [MysteryShopperController::class, 'deleteQuestion']);
            Route::post('/mystery-shopper/questions/reorder', [MysteryShopperController::class, 'reorderQuestions']);
            Route::get('/mystery-shopper/submissions', [MysteryShopperController::class, 'submissions']);
            Route::get('/mystery-shopper/submissions/{id}', [MysteryShopperController::class, 'submissionDetail']);

            // Certificate Requests
            Route::get('/trainer/certificate-requests', [UserController::class, 'certificateRequests']);
            Route::put('/trainer/certificate-requests/{id}/approve', [UserController::class, 'approveCertificate']);
            Route::put('/trainer/certificate-requests/{id}/reject', [UserController::class, 'rejectCertificate']);
        });

        // === ADMIN ONLY ROUTES ===
        Route::middleware('admin')->group(function () {
            // User Management
            Route::get('/admin/users', [UserController::class, 'allUsers']);
            Route::post('/admin/users', [UserController::class, 'createUser']);
            Route::put('/admin/users/{id}', [UserController::class, 'updateUser']);
            Route::delete('/admin/users/{id}', [UserController::class, 'deleteUser']);

            // Role & Division Management
            Route::get('/admin/roles', [UserController::class, 'roles']);
            Route::get('/admin/divisions', [UserController::class, 'divisions']);
            Route::post('/admin/divisions', [UserController::class, 'createDivision']);
            Route::put('/admin/divisions/{id}', [UserController::class, 'updateDivision']);
            Route::delete('/admin/divisions/{id}', [UserController::class, 'deleteDivision']);

            // Content Moderation
            Route::get('/admin/content/review', [UserController::class, 'contentReview']);
            Route::post('/admin/content/{id}/approve', [UserController::class, 'approveContent']);
            Route::post('/admin/content/{id}/reject', [UserController::class, 'rejectContent']);

            // Analytics & Reporting
            Route::get('/admin/analytics/overview', [UserController::class, 'analyticsOverview']);
            Route::get('/admin/analytics/by-division', [UserController::class, 'analyticsByDivision']);
            Route::get('/admin/analytics/engagement', [UserController::class, 'engagementMetrics']);
            Route::get('/admin/analytics/completion', [UserController::class, 'completionRates']);

            // System Management
            Route::get('/admin/announcements', [UserController::class, 'allAnnouncements']);
            Route::post('/admin/announcements', [UserController::class, 'createSystemAnnouncement']);
            Route::post('/admin/maintenance', [UserController::class, 'systemMaintenance']);
        });
    });
});
