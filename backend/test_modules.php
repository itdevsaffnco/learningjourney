<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Module;
use App\Models\User;

// Get trainer user
$trainer = User::where('email', 'trainer@saffnco.com')->first();

if ($trainer) {
    echo "Trainer ID: " . $trainer->id . "\n";

    // Check modules created by trainer
    $modules = Module::where('created_by', $trainer->id)->get();
    echo "Modules created by trainer: " . $modules->count() . "\n";

    foreach ($modules as $module) {
        echo "  - " . $module->title . " (ID: " . $module->id . ")\n";
    }
} else {
    echo "Trainer not found\n";
}
?>
