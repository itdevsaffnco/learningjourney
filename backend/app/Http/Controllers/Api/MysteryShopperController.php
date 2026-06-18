<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MysteryShopperAnswer;
use App\Models\MysteryShopperQuestion;
use App\Models\MysteryShopperSubmission;
use Illuminate\Http\Request;

class MysteryShopperController extends Controller
{
    // ── QUESTIONS ────────────────────────────────────────────────────────────

    public function questions()
    {
        return response()->json(
            MysteryShopperQuestion::orderBy('sort_order')->get()
        );
    }

    public function createQuestion(Request $request)
    {
        $validated = $request->validate([
            'question_text' => 'required|string|max:500',
            'type' => 'required|in:text,textarea,multiple_choice,checkbox,rating,yes_no',
            'options' => 'nullable|array',
            'options.*' => 'string|max:255',
            'is_required' => 'boolean',
            'sort_order' => 'integer',
        ]);

        $question = MysteryShopperQuestion::create($validated);

        return response()->json($question, 201);
    }

    public function updateQuestion(Request $request, $id)
    {
        $question = MysteryShopperQuestion::findOrFail($id);

        $validated = $request->validate([
            'question_text' => 'string|max:500',
            'type' => 'in:text,textarea,multiple_choice,checkbox,rating,yes_no',
            'options' => 'nullable|array',
            'options.*' => 'string|max:255',
            'is_required' => 'boolean',
            'sort_order' => 'integer',
        ]);

        $question->update($validated);

        return response()->json($question);
    }

    public function deleteQuestion($id)
    {
        MysteryShopperQuestion::findOrFail($id)->delete();

        return response()->json(['message' => 'Question deleted']);
    }

    public function reorderQuestions(Request $request)
    {
        $request->validate([
            'order' => 'required|array',
            'order.*' => 'integer',
        ]);

        foreach ($request->order as $index => $id) {
            MysteryShopperQuestion::where('id', $id)->update(['sort_order' => $index]);
        }

        return response()->json(['message' => 'Reordered']);
    }

    // ── SUBMISSIONS ──────────────────────────────────────────────────────────

    public function submitPublic(Request $request)
    {
        $request->validate([
            'submitter_name' => 'required|string|max:255',
            'submitter_email' => 'nullable|email|max:255',
            'store_location' => 'nullable|string|max:255',
            'evaluated_staff_name' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'answers' => 'required|array',
            'answers.*.question_id' => 'required|exists:mystery_shopper_questions,id',
            'answers.*.answer' => 'nullable',
        ]);

        $submission = MysteryShopperSubmission::create([
            'user_id' => null,
            'submitter_name' => $request->submitter_name,
            'submitter_email' => $request->submitter_email,
            'store_location' => $request->store_location,
            'evaluated_staff_name' => $request->evaluated_staff_name,
            'notes' => $request->notes,
        ]);

        foreach ($request->answers as $ans) {
            $answer = is_array($ans['answer']) ? implode(', ', $ans['answer']) : $ans['answer'];
            MysteryShopperAnswer::create([
                'submission_id' => $submission->id,
                'question_id' => $ans['question_id'],
                'answer' => $answer,
            ]);
        }

        return response()->json(['message' => 'Submitted successfully'], 201);
    }

    public function submit(Request $request)
    {
        $request->validate([
            'store_location' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'answers' => 'required|array',
            'answers.*.question_id' => 'required|exists:mystery_shopper_questions,id',
            'answers.*.answer' => 'nullable',
        ]);

        $submission = MysteryShopperSubmission::create([
            'user_id' => $request->user()->id,
            'store_location' => $request->store_location,
            'notes' => $request->notes,
        ]);

        foreach ($request->answers as $ans) {
            $answer = is_array($ans['answer']) ? implode(', ', $ans['answer']) : $ans['answer'];
            MysteryShopperAnswer::create([
                'submission_id' => $submission->id,
                'question_id' => $ans['question_id'],
                'answer' => $answer,
            ]);
        }

        return response()->json(['message' => 'Submitted successfully', 'data' => $submission], 201);
    }

    public function submissions()
    {
        $submissions = MysteryShopperSubmission::with(['user', 'answers.question'])
            ->orderByDesc('created_at')
            ->get();

        return response()->json($submissions);
    }

    public function submissionDetail($id)
    {
        $submission = MysteryShopperSubmission::with(['user', 'answers.question'])
            ->findOrFail($id);

        return response()->json($submission);
    }
}
