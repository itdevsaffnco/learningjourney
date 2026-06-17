<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use Illuminate\Http\Request;

class AssignmentController extends Controller
{
    public function index(Request $request)
    {
        try {
            $user = $request->user();

            // Extract division ID from division data (handle both string and JSON formats)
            $divisionId = null;
            if (is_array($user->division)) {
                $divisionId = $user->division['id'] ?? null;
            } else {
                $divisionId = $user->division_id;
            }

            // Get published assignments created by trainers
            $assignments = Assignment::where('status', 'published')
                ->whereHas('creator', fn($q) => $q->whereHas('role', fn($r) => $r->where('name', 'Trainer')))
                ->with(['module', 'creator', 'questions'])
                ->get();

            $formattedAssignments = [];
            foreach ($assignments as $assignment) {
                // Get user's submission status
                $submission = $assignment->submissions()
                    ->where('user_id', $user->id)
                    ->first();

                $status = 'not-started';
                if ($submission) {
                    if ($submission->status === 'graded') {
                        $status = 'graded';
                    } elseif ($submission->status === 'submitted' || $submission->status === 'late') {
                        $status = 'submitted';
                    } else {
                        $status = 'in-progress';
                    }
                }

                $formattedAssignments[] = [
                    'id' => $assignment->id,
                    'title' => $assignment->title,
                    'description' => $assignment->description,
                    'due_date' => $assignment->due_date ? $assignment->due_date->format('Y-m-d') : null,
                    'status' => $status,
                    'questions' => $assignment->questions->count(),
                    'duration' => $assignment->duration_minutes,
                    'created_by' => $assignment->creator?->name ?? 'Trainer',
                ];
            }

            return response()->json([
                'assignments' => $formattedAssignments,
                'total' => count($formattedAssignments),
            ]);
        } catch (\Exception $e) {
            \Log::error('Assignment index error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error fetching assignments',
                'assignments' => [],
                'total' => 0,
            ], 500);
        }
    }

    public function show(Request $request, $id)
    {
        $assignment = Assignment::with(['module', 'questions.options'])->findOrFail($id);

        // auth:sanctum middleware not on this public route, so resolve manually
        $user = auth('sanctum')->user();

        $submission = $user
            ? AssignmentSubmission::where('user_id', $user->id)->where('assignment_id', $id)->first()
            : null;

        return response()->json([
            'assignment' => $assignment,
            'submission' => $submission,
        ]);
    }

    public function submit(Request $request, $id)
    {
        $assignment = Assignment::findOrFail($id);
        $user = $request->user();

        $validated = $request->validate([
            'answers' => 'nullable|array',
            'submission_content' => 'nullable|string',
        ]);

        // Store answers array as JSON so read-only view can restore selections
        $content = isset($validated['answers'])
            ? json_encode($validated['answers'])
            : ($validated['submission_content'] ?? null);

        $submission = AssignmentSubmission::create([
            'user_id' => $user->id,
            'assignment_id' => $id,
            'submission_content' => $content,
            'submitted_at' => now(),
            'status' => $assignment->due_date && now() > $assignment->due_date ? 'late' : 'submitted',
        ]);

        return response()->json($submission, 201);
    }

    public function submitPublic(Request $request, $id)
    {
        try {
            $assignment = Assignment::where('status', 'published')->findOrFail($id);

            $validated = $request->validate([
                'answers' => 'required|array',
            ]);

            $userId = $request->user()?->id ?? $request->ip();

            $submission = AssignmentSubmission::create([
                'user_id' => $request->user()?->id,
                'assignment_id' => $id,
                'submission_content' => json_encode($validated['answers']),
                'submitted_at' => now(),
                'status' => $assignment->due_date && now() > $assignment->due_date ? 'late' : 'submitted',
            ]);

            return response()->json([
                'message' => 'Assignment submitted successfully',
                'submission' => $submission,
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Assignment submission error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to submit assignment',
            ], 500);
        }
    }

    public function submissions(Request $request, $id)
    {
        try {
            $assignment = Assignment::findOrFail($id);

            // Check if user is the creator or admin
            if ($request->user() && ($assignment->created_by === $request->user()->id || $request->user()->role->name === 'Admin')) {
                $submissions = AssignmentSubmission::where('assignment_id', $id)
                    ->with('user')
                    ->orderBy('submitted_at', 'desc')
                    ->get();

                return response()->json($submissions);
            }

            return response()->json([
                'message' => 'Unauthorized',
            ], 403);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch submissions',
            ], 500);
        }
    }

    public function remedial(Request $request, $submissionId)
    {
        $user = $request->user();
        if (!$user || !in_array($user->role?->name, ['Trainer', 'Admin'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $submission = AssignmentSubmission::findOrFail($submissionId);
        $submission->delete();

        return response()->json(['message' => 'Submission reset. Staff can now retake the assignment.']);
    }

    public function grade(Request $request, $id)
    {
        $user = $request->user();
        if (!$user || !in_array($user->role?->name, ['Trainer', 'Admin'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $submission = AssignmentSubmission::findOrFail($id);

        $validated = $request->validate([
            'score' => 'required|integer|min:0',
            'feedback' => 'nullable|string',
        ]);

        $submission->update([
            'score' => $validated['score'],
            'feedback' => $validated['feedback'] ?? null,
            'status' => 'graded',
        ]);

        return response()->json($submission);
    }

    public function trainerIndex(Request $request)
    {
        try {
            $assignments = Assignment::where('created_by', $request->user()->id)
                ->withCount('submissions')
                ->paginate(12);

            $formattedAssignments = [];
            foreach ($assignments as $assignment) {
                $formattedAssignments[] = [
                    'id' => $assignment->id,
                    'title' => $assignment->title,
                    'description' => $assignment->description,
                    'instructions' => $assignment->instructions,
                    'due_date' => $assignment->due_date,
                    'submissions_count' => $assignment->submissions_count ?? 0,
                    'status' => $assignment->status,
                ];
            }

            return response()->json([
                'assignments' => $formattedAssignments,
                'total' => $assignments->total(),
                'per_page' => $assignments->perPage(),
            ]);
        } catch (\Exception $e) {
            \Log::error('Assignment index error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error fetching assignments',
                'assignments' => [],
            ], 500);
        }
    }

    public function trainerStore(Request $request)
    {
        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'instructions' => 'nullable|string',
                'due_date' => 'nullable|date',
            ]);

            $assignment = Assignment::create([
                'title' => $validated['title'],
                'description' => $validated['description'] ?? null,
                'instructions' => $validated['instructions'] ?? null,
                'due_date' => $validated['due_date'] ?? null,
                'created_by' => $request->user()->id,
                'status' => 'published',
            ]);

            return response()->json([
                'message' => 'Assignment created successfully',
                'assignment' => $assignment,
            ], 201);
        } catch (\Exception $e) {
            \Log::error('Assignment creation error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to create assignment: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function trainerDestroy(Request $request, $id)
    {
        try {
            $assignment = Assignment::where('created_by', $request->user()->id)->findOrFail($id);
            $assignment->delete();

            return response()->json([
                'message' => 'Assignment deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete assignment',
            ], 500);
        }
    }

    public function trainerShow(Request $request, $id)
    {
        try {
            $assignment = Assignment::where('created_by', $request->user()->id)
                ->with('questions.options')
                ->findOrFail($id);

            return response()->json([
                'assignment' => $assignment,
                'questions' => $assignment->questions,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Assignment not found',
            ], 404);
        }
    }

    public function trainerUpdate(Request $request, $id)
    {
        try {
            $assignment = Assignment::where('created_by', $request->user()->id)->findOrFail($id);

            $validated = $request->validate([
                'title' => 'sometimes|string|max:255',
                'description' => 'nullable|string',
                'instructions' => 'nullable|string',
                'due_date' => 'nullable|date',
                'max_score' => 'nullable|integer|min:1',
                'mc_weight' => 'nullable|integer|min:0|max:100',
                'duration_minutes' => 'nullable|integer|min:1',
                'requires_camera' => 'nullable|boolean',
                'requires_location' => 'nullable|boolean',
                'show_score_to_staff' => 'nullable|boolean',
                'status' => 'nullable|in:draft,published,closed,archived',
            ]);

            $assignment->update($validated);

            return response()->json([
                'message' => 'Assignment updated successfully',
                'assignment' => $assignment,
            ]);
        } catch (\Exception $e) {
            \Log::error('Assignment update error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to update assignment',
            ], 500);
        }
    }

    public function createQuestion(Request $request, $assignmentId)
    {
        try {
            $assignment = Assignment::where('created_by', $request->user()->id)->findOrFail($assignmentId);

            $validated = $request->validate([
                'question_text' => 'required|string',
                'type' => 'required|in:multiple_choice,essay',
                'options' => 'required_if:type,multiple_choice|array|min:2|max:6',
                'options.*' => 'required_with:options|string',
                'correct_option' => 'required_if:type,multiple_choice|integer|min:0',
            ]);

            $question = \App\Models\AssignmentQuestion::create([
                'assignment_id' => $assignmentId,
                'question' => $validated['question_text'],
                'type' => $validated['type'],
            ]);

            if ($validated['type'] === 'multiple_choice') {
                foreach ($validated['options'] as $idx => $optionText) {
                    \App\Models\AssignmentOption::create([
                        'assignment_question_id' => $question->id,
                        'option_text' => $optionText,
                        'is_correct' => $idx === $validated['correct_option'],
                    ]);
                }
            }

            return response()->json([
                'message' => 'Question added successfully',
                'question' => $question->load('options'),
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Question creation error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to create question: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function updateQuestion(Request $request, $assignmentId, $questionId)
    {
        try {
            $assignment = Assignment::where('created_by', $request->user()->id)->findOrFail($assignmentId);
            $question = \App\Models\AssignmentQuestion::where('assignment_id', $assignmentId)->findOrFail($questionId);

            $validated = $request->validate([
                'question_text' => 'sometimes|string',
                'type' => 'sometimes|in:multiple_choice,essay',
                'options' => 'sometimes|array|min:2|max:6',
                'options.*' => 'required_with:options|string',
                'correct_option' => 'sometimes|integer|min:0',
            ]);

            if (isset($validated['question_text'])) {
                $question->update(['question' => $validated['question_text']]);
            }

            if (isset($validated['options'])) {
                $question->options()->delete();

                foreach ($validated['options'] as $idx => $optionText) {
                    \App\Models\AssignmentOption::create([
                        'assignment_question_id' => $question->id,
                        'option_text' => $optionText,
                        'is_correct' => $idx === ($validated['correct_option'] ?? 0),
                    ]);
                }
            }

            return response()->json([
                'message' => 'Question updated successfully',
                'question' => $question->load('options'),
            ]);
        } catch (\Exception $e) {
            \Log::error('Question update error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to update question',
            ], 500);
        }
    }

    public function deleteQuestion(Request $request, $assignmentId, $questionId)
    {
        try {
            $assignment = Assignment::where('created_by', $request->user()->id)->findOrFail($assignmentId);
            $question = \App\Models\AssignmentQuestion::where('assignment_id', $assignmentId)->findOrFail($questionId);

            $question->delete();

            return response()->json([
                'message' => 'Question deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete question',
            ], 500);
        }
    }
}
