<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EstudianteController;
use App\Http\Controllers\NotaController;

Route::prefix('app')->group(function () {
    // Rutas para estudiantes
    Route::get('/estudiantes', [EstudianteController::class, 'index']);
    Route::post('/estudiantes', [EstudianteController::class, 'store']);
    Route::get('/estudiante/{id}', [EstudianteController::class, 'show']);
    Route::put('/estudiante/{id}', [EstudianteController::class, 'update']);
    Route::delete('/estudiante/{id}', [EstudianteController::class, 'destroy']);

    // Rutas para notas
    Route::get('/notas/{codEstudiante}', [NotaController::class, 'obtenerNotas']);
    Route::post('/notas', [NotaController::class, 'store']);
    Route::put('/notas/{id}', [NotaController::class, 'update']);
    Route::delete('/notas/{id}', [NotaController::class, 'destroy']);
});