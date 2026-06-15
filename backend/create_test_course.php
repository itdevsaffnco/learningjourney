<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Course;

// Create courses for division 1 (Sales)
$courses = [
  ['name' => 'Product Knowledge Basics', 'description' => 'Learn about our product portfolio', 'duration_hours' => 8, 'level' => 'beginner', 'division_id' => 1, 'status' => 'published'],
  ['name' => 'Advanced Sales Techniques', 'description' => 'Master the art of selling', 'duration_hours' => 16, 'level' => 'advanced', 'division_id' => 1, 'status' => 'published'],
  ['name' => 'Customer Service Excellence', 'description' => 'Deliver outstanding customer service', 'duration_hours' => 12, 'level' => 'intermediate', 'division_id' => 1, 'status' => 'published'],
];

foreach ($courses as $data) {
  Course::create($data);
  echo "✅ Created: " . $data['name'] . "\n";
}
