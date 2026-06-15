<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Assignment, App\Models\Module, App\Models\User;

// Get a module
$module = Module::first();
$user = User::where('email', 'staff@example.com')->first();

if ($module && $user) {
  $assignments = [
    ['title' => 'Product Knowledge Assessment', 'description' => 'Test your knowledge', 'module_id' => $module->id, 'due_date' => now()->addDays(10), 'status' => 'published', 'created_by' => 1],
    ['title' => 'Sales Pitch Development', 'description' => 'Create a compelling pitch', 'module_id' => $module->id, 'due_date' => now()->addDays(5), 'status' => 'published', 'created_by' => 1],
  ];

  foreach ($assignments as $data) {
    Assignment::create($data);
    echo "✅ Created: " . $data['title'] . "\n";
  }
}
