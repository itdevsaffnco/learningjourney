<?php

namespace App\Http\Controllers\Api;

use App\Models\Lesson;
use App\Models\Module;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Http\Controllers\Controller;

class LessonController extends Controller
{
    public function index($moduleId)
    {
        $module = Module::findOrFail($moduleId);
        $lessons = $module->lessons()->orderBy("order")->get();

        return response()->json([
            "lessons" => $lessons,
        ]);
    }

    public function store(Request $request, $moduleId)
    {
        $module = Module::findOrFail($moduleId);

        $validated = $request->validate([
            "title" => "required|string|max:255",
            "description" => "nullable|string",
            "type" => "required|in:text,video,audio,quiz,image",
            "content" => "nullable|string",
            "video" => "nullable|file|mimes:mp4,mov,avi,webm|max:102400",
            "video_url" => "nullable|string",
            "audio_url" => "nullable|string",
            "image_url" => "nullable|string",
            "quiz_id" => "nullable|exists:quizzes,id",
            "randomize_questions" => "nullable|boolean",
            "num_questions_to_show" => "nullable|integer|min:1",
            "duration_minutes" => "nullable|integer",
            "order" => "nullable|integer",
        ]);

        try {
            $lesson = new Lesson();
            $lesson->module_id = $moduleId;
            $lesson->title = $validated["title"];
            $lesson->description = $validated["description"] ?? null;
            $lesson->type = $validated["type"];
            $lesson->duration_minutes = $validated["duration_minutes"] ?? 0;
            $lesson->order = $validated["order"] ?? 0;

            if ($validated["type"] === "text") {
                $lesson->content = $validated["content"] ?? null;
            } elseif ($validated["type"] === "video") {
                if ($request->hasFile('video')) {
                    $path = $request->file('video')->store('videos', 'public');
                    $lesson->video_url = Storage::url($path);
                } else {
                    $lesson->video_url = $validated["video_url"] ?? null;
                }
                $lesson->content = $validated["content"] ?? null;
            } elseif ($validated["type"] === "audio") {
                $lesson->audio_url = $validated["audio_url"] ?? null;
                $lesson->content = $validated["content"] ?? null;
            } elseif ($validated["type"] === "image") {
                $lesson->image_url = $validated["image_url"] ?? null;
                $lesson->content = $validated["content"] ?? null;
            } elseif ($validated["type"] === "quiz") {
                $lesson->quiz_id = $validated["quiz_id"] ?? null;
                $lesson->randomize_questions = $validated["randomize_questions"] ?? false;
                $lesson->num_questions_to_show = $validated["num_questions_to_show"] ?? null;
            }

            $lesson->save();

            return response()->json([
                "message" => "Lesson created successfully",
                "lesson" => $lesson,
            ], 201);
        } catch (\Exception $e) {
            \Log::error("Lesson creation error: " . $e->getMessage());
            return response()->json([
                "message" => "Failed to create lesson: " . $e->getMessage(),
            ], 500);
        }
    }

    public function show($moduleId, $id)
    {
        $lesson = Lesson::where("module_id", $moduleId)->findOrFail($id);

        return response()->json([
            "lesson" => $lesson,
        ]);
    }

    public function update(Request $request, $moduleId, $id)
    {
        $lesson = Lesson::where("module_id", $moduleId)->findOrFail($id);

        $validated = $request->validate([
            "title" => "sometimes|string|max:255",
            "description" => "nullable|string",
            "type" => "sometimes|in:text,video,audio,quiz,image",
            "content" => "nullable|string",
            "video" => "nullable|file|mimes:mp4,mov,avi,webm|max:102400",
            "video_url" => "nullable|string",
            "audio_url" => "nullable|string",
            "image_url" => "nullable|string",
            "quiz_id" => "nullable|exists:quizzes,id",
            "randomize_questions" => "nullable|boolean",
            "num_questions_to_show" => "nullable|integer|min:1",
            "duration_minutes" => "nullable|integer",
            "order" => "nullable|integer",
        ]);

        try {
            if ($request->hasFile('video')) {
                $path = $request->file('video')->store('videos', 'public');
                $validated["video_url"] = Storage::url($path);
            }

            if (isset($validated["type"])) {
                if ($validated["type"] === "text") {
                    $validated["video_url"] = null;
                    $validated["audio_url"] = null;
                    $validated["quiz_id"] = null;
                } elseif ($validated["type"] === "video") {
                    $validated["audio_url"] = null;
                    $validated["quiz_id"] = null;
                } elseif ($validated["type"] === "audio") {
                    $validated["video_url"] = null;
                    $validated["image_url"] = null;
                    $validated["quiz_id"] = null;
                } elseif ($validated["type"] === "image") {
                    $validated["video_url"] = null;
                    $validated["audio_url"] = null;
                    $validated["quiz_id"] = null;
                } elseif ($validated["type"] === "quiz") {
                    $validated["content"] = null;
                    $validated["video_url"] = null;
                    $validated["audio_url"] = null;
                }
            }

            unset($validated["video"]);
            $lesson->update($validated);

            return response()->json([
                "message" => "Lesson updated successfully",
                "lesson" => $lesson,
            ]);
        } catch (\Exception $e) {
            \Log::error("Lesson update error: " . $e->getMessage());
            return response()->json([
                "message" => "Failed to update lesson: " . $e->getMessage(),
            ], 500);
        }
    }

    public function destroy($moduleId, $id)
    {
        $lesson = Lesson::where("module_id", $moduleId)->findOrFail($id);

        try {
            $lesson->delete();

            return response()->json([
                "message" => "Lesson deleted successfully",
            ]);
        } catch (\Exception $e) {
            \Log::error("Lesson delete error: " . $e->getMessage());
            return response()->json([
                "message" => "Failed to delete lesson: " . $e->getMessage(),
            ], 500);
        }
    }

    public function reorder(Request $request, $moduleId)
    {
        $validated = $request->validate([
            "lessons" => "required|array",
            "lessons.*.id" => "required|integer",
            "lessons.*.order" => "required|integer",
        ]);

        try {
            foreach ($validated["lessons"] as $item) {
                Lesson::where("module_id", $moduleId)
                    ->where("id", $item["id"])
                    ->update(["order" => $item["order"]]);
            }

            return response()->json([
                "message" => "Lessons reordered successfully",
            ]);
        } catch (\Exception $e) {
            \Log::error("Lesson reorder error: " . $e->getMessage());
            return response()->json([
                "message" => "Failed to reorder lessons: " . $e->getMessage(),
            ], 500);
        }
    }
}
