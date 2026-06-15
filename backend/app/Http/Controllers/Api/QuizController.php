<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Quiz;
use App\Models\QuizAnswer;
use App\Models\QuizQuestion;
use App\Models\QuizOption;
use App\Models\QuizSubmission;
use Illuminate\Http\Request;

class QuizController extends Controller
{
    public function index(Request $request)
    {
        $quizzes = Quiz::where('status', 'published')->with('module')->paginate(10);
        return response()->json($quizzes);
    }

    public function show(Request $request, $id)
    {
        $quiz = Quiz::with('questions.options')->findOrFail($id);
        $user = $request->user();

        $userAnswers = QuizAnswer::where('user_id', $user->id)->where('quiz_id', $id)->exists();

        return response()->json([
            'quiz' => $quiz,
            'has_attempted' => $userAnswers,
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('isTrainerOrAdmin', new Quiz);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'module_id' => 'required|exists:modules,id',
            'passing_score' => 'integer|min:0|max:100',
            'time_limit_minutes' => 'integer|min:1',
        ]);

        $quiz = Quiz::create($validated);

        return response()->json($quiz, 201);
    }

    public function submit(Request $request, $id)
    {
        $quiz = Quiz::with('questions.options')->findOrFail($id);
        $user = $request->user();

        $validated = $request->validate([
            'answers' => 'required|array',
            'answers.*.question_id' => 'required|exists:quiz_questions,id',
            'answers.*.selected_option_id' => 'nullable|exists:quiz_options,id',
            'answers.*.short_answer' => 'nullable|string',
            'time_spent_seconds' => 'nullable|integer',
        ]);

        $totalScore = 0;
        $correctAnswers = 0;

        foreach ($validated['answers'] as $answer) {
            $question = $quiz->questions->find($answer['question_id']);
            $isCorrect = false;
            $pointsEarned = 0;

            if ($answer['selected_option_id']) {
                $option = $question->options->find($answer['selected_option_id']);
                $isCorrect = $option->is_correct;
                $pointsEarned = $isCorrect ? ($question->points ?? 1) : 0;
            }

            if ($isCorrect) {
                $correctAnswers++;
            }

            $totalScore += $pointsEarned;

            QuizAnswer::create([
                'user_id' => $user->id,
                'quiz_id' => $id,
                'question_id' => $answer['question_id'],
                'selected_option_id' => $answer['selected_option_id'] ?? null,
                'short_answer' => $answer['short_answer'] ?? null,
                'is_correct' => $isCorrect,
                'points_earned' => $pointsEarned,
                'answered_at' => now(),
            ]);
        }

        $questionsShown = count($validated['answers']);
        $percentage = $questionsShown > 0 ? ($correctAnswers / $questionsShown) * 100 : 0;
        $passed = $percentage >= $quiz->passing_score;

        QuizSubmission::create([
            'user_id' => $user->id,
            'quiz_id' => $id,
            'score' => round($percentage, 2),
            'total_questions' => $questionsShown,
            'correct_answers' => $correctAnswers,
            'time_spent_seconds' => $validated['time_spent_seconds'] ?? null,
            'status' => 'completed',
            'submitted_at' => now(),
        ]);

        if ($passed) {
            $user->points()->increment('quiz_points', $totalScore);
            $user->points()->increment('total_points', $totalScore);
        }

        return response()->json([
            'score' => $totalScore,
            'percentage' => round($percentage, 2),
            'passed' => $passed,
            'passing_score' => $quiz->passing_score,
        ]);
    }

    public function results(Request $request, $id)
    {
        $user = $request->user();
        $answers = QuizAnswer::where('user_id', $user->id)
            ->where('quiz_id', $id)
            ->with(['question.options', 'selectedOption'])
            ->get();

        $totalScore = $answers->sum('points_earned');
        $passed = count($answers) > 0;

        return response()->json([
            'answers' => $answers,
            'total_score' => $totalScore,
            'passed' => $passed,
        ]);
    }

    public function trainerIndex(Request $request)
    {
        try {
            $quizzes = Quiz::where('created_by', $request->user()->id)
                ->withCount('questions')
                ->paginate(12);

            $formattedQuizzes = [];
            foreach ($quizzes as $quiz) {
                $formattedQuizzes[] = [
                    'id' => $quiz->id,
                    'title' => $quiz->title,
                    'description' => $quiz->description,
                    'passing_score' => $quiz->passing_score,
                    'time_limit' => $quiz->time_limit_minutes,
                    'questions_count' => $quiz->questions_count ?? 0,
                    'status' => $quiz->status,
                ];
            }

            return response()->json([
                'quizzes' => $formattedQuizzes,
                'total' => $quizzes->total(),
                'per_page' => $quizzes->perPage(),
            ]);
        } catch (\Exception $e) {
            \Log::error('Quiz index error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error fetching quizzes',
                'quizzes' => [],
            ], 500);
        }
    }

    public function trainerStore(Request $request)
    {
        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'passing_score' => 'nullable|integer|min:0|max:100',
                'time_limit' => 'nullable|integer|min:1',
            ]);

            $quiz = Quiz::create([
                'title' => $validated['title'],
                'description' => $validated['description'] ?? null,
                'passing_score' => $validated['passing_score'] ?? 70,
                'time_limit_minutes' => $validated['time_limit'] ?? 30,
                'created_by' => $request->user()->id,
                'status' => 'draft',
            ]);

            return response()->json([
                'message' => 'Quiz created successfully',
                'quiz' => $quiz,
            ], 201);
        } catch (\Exception $e) {
            \Log::error('Quiz creation error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to create quiz: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function trainerDestroy(Request $request, $id)
    {
        try {
            $quiz = Quiz::where('created_by', $request->user()->id)->findOrFail($id);
            $quiz->delete();

            return response()->json([
                'message' => 'Quiz deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete quiz',
            ], 500);
        }
    }

    public function trainerShow(Request $request, $id)
    {
        try {
            $quiz = Quiz::where('created_by', $request->user()->id)
                ->with('questions.options')
                ->findOrFail($id);

            return response()->json([
                'quiz' => $quiz,
                'questions' => $quiz->questions,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Quiz not found',
            ], 404);
        }
    }

    public function trainerUpdate(Request $request, $id)
    {
        try {
            $quiz = Quiz::where('created_by', $request->user()->id)->findOrFail($id);

            $validated = $request->validate([
                'title' => 'sometimes|string|max:255',
                'description' => 'nullable|string',
                'passing_score' => 'nullable|integer|min:0|max:100',
                'time_limit_minutes' => 'nullable|integer|min:1',
                'status' => 'nullable|in:draft,published,archived',
            ]);

            $quiz->update($validated);

            return response()->json([
                'message' => 'Quiz updated successfully',
                'quiz' => $quiz,
            ]);
        } catch (\Exception $e) {
            \Log::error('Quiz update error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to update quiz',
            ], 500);
        }
    }

    public function createQuestion(Request $request, $quizId)
    {
        try {
            $quiz = Quiz::where('created_by', $request->user()->id)->findOrFail($quizId);

            $validated = $request->validate([
                'question_text' => 'required|string',
                'options' => 'required|array|min:2|max:6',
                'options.*' => 'required|string',
                'correct_option' => 'required|integer|min:0',
                'points' => 'nullable|integer|min:1',
            ]);

            $question = QuizQuestion::create([
                'quiz_id' => $quizId,
                'question' => $validated['question_text'],
                'type' => 'multiple_choice',
                'points' => $validated['points'] ?? 1,
            ]);

            foreach ($validated['options'] as $idx => $optionText) {
                QuizOption::create([
                    'question_id' => $question->id,
                    'option_text' => $optionText,
                    'is_correct' => $idx === $validated['correct_option'],
                ]);
            }

            $quiz->increment('total_questions');

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

    public function updateQuestion(Request $request, $quizId, $questionId)
    {
        try {
            $quiz = Quiz::where('created_by', $request->user()->id)->findOrFail($quizId);
            $question = QuizQuestion::where('quiz_id', $quizId)->findOrFail($questionId);

            $validated = $request->validate([
                'question_text' => 'sometimes|string',
                'options' => 'sometimes|array|min:2|max:6',
                'options.*' => 'required_with:options|string',
                'correct_option' => 'sometimes|integer|min:0',
                'points' => 'nullable|integer|min:1',
            ]);

            if (isset($validated['question_text'])) {
                $question->update(['question' => $validated['question_text']]);
            }

            if (isset($validated['points'])) {
                $question->update(['points' => $validated['points']]);
            }

            if (isset($validated['options'])) {
                $question->options()->delete();

                foreach ($validated['options'] as $idx => $optionText) {
                    QuizOption::create([
                        'question_id' => $question->id,
                        'option_text' => $optionText,
                        'is_correct' => $idx === ($validated['correct_option'] ?? 0),
                    ]);
                }
            }

            return response()->json([
                'message' => 'Question updated successfully',
                'question' => $question->load('options'),
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Question update error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to update question',
            ], 500);
        }
    }

    public function deleteQuestion(Request $request, $quizId, $questionId)
    {
        try {
            $quiz = Quiz::where('created_by', $request->user()->id)->findOrFail($quizId);
            $question = QuizQuestion::where('quiz_id', $quizId)->findOrFail($questionId);

            $question->delete();
            $quiz->decrement('total_questions');

            return response()->json([
                'message' => 'Question deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete question',
            ], 500);
        }
    }

    public function trainerSubmissions(Request $request, $quizId)
    {
        try {
            $quiz = Quiz::where('created_by', $request->user()->id)->findOrFail($quizId);

            $submissions = QuizSubmission::where('quiz_id', $quizId)
                ->with(['user:id,name,email', 'quiz'])
                ->orderBy('submitted_at', 'desc')
                ->paginate(10);

            $formattedSubmissions = [];
            foreach ($submissions as $submission) {
                $formattedSubmissions[] = [
                    'id' => $submission->id,
                    'user_name' => $submission->user->name ?? 'Unknown',
                    'user_email' => $submission->user->email ?? 'N/A',
                    'score' => $submission->score,
                    'total_questions' => $submission->total_questions,
                    'correct_answers' => $submission->correct_answers,
                    'percentage' => $submission->total_questions > 0
                        ? round(($submission->correct_answers / $submission->total_questions) * 100, 2)
                        : 0,
                    'submitted_at' => $submission->submitted_at,
                    'status' => $submission->status,
                ];
            }

            return response()->json([
                'submissions' => $formattedSubmissions,
                'total' => $submissions->total(),
                'per_page' => $submissions->perPage(),
            ]);
        } catch (\Exception $e) {
            \Log::error('Quiz submissions error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error fetching submissions',
            ], 500);
        }
    }

    public function trainerSubmissionDetail(Request $request, $quizId, $submissionId)
    {
        try {
            $quiz = Quiz::where('created_by', $request->user()->id)->findOrFail($quizId);
            $submission = QuizSubmission::where('quiz_id', $quizId)->findOrFail($submissionId);

            $answers = QuizAnswer::where('user_id', $submission->user_id)
                ->where('quiz_id', $quizId)
                ->with(['question', 'selectedOption'])
                ->get();

            return response()->json([
                'submission' => [
                    'id' => $submission->id,
                    'user_name' => $submission->user->name,
                    'user_email' => $submission->user->email,
                    'score' => $submission->score,
                    'total_questions' => $submission->total_questions,
                    'correct_answers' => $submission->correct_answers,
                    'percentage' => $submission->total_questions > 0
                        ? round(($submission->correct_answers / $submission->total_questions) * 100, 2)
                        : 0,
                    'submitted_at' => $submission->submitted_at,
                    'time_spent_seconds' => $submission->time_spent_seconds,
                ],
                'answers' => $answers,
            ]);
        } catch (\Exception $e) {
            \Log::error('Quiz submission detail error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error fetching submission details',
            ], 500);
        }
    }
}
