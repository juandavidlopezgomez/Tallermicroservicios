<?php
namespace App\Http\Controllers;

use App\Models\Notas;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class NotaController extends Controller
{
    // Listar todas las notas de un estudiante
    public function obtenerNotas($codEstudiante): JsonResponse
    {
        $notas = Notas::where('codEstudiante', $codEstudiante)->get();
        return response()->json(['data' => $notas], 200);
    }

    // Crear una nueva nota
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'codEstudiante' => 'required|exists:estudiantes,cod',
            'actividad' => 'required|string|max:255',
            'nota' => 'required|numeric|between:0,5',
        ]);

        $nota = Notas::create($validated);
        return response()->json(['data' => $nota], 201);
    }

    // Actualizar una nota
    public function update(Request $request, $id): JsonResponse
    {
        $nota = Notas::find($id);
        if (!$nota) {
            return response()->json(['error' => 'Nota no encontrada'], 404);
        }

        $validated = $request->validate([
            'actividad' => 'string|max:255',
            'nota' => 'numeric|between:0,5',
        ]);

        $nota->update($validated);
        return response()->json(['data' => $nota], 200);
    }

    // Eliminar una nota
    public function destroy($id): JsonResponse
    {
        $nota = Notas::find($id);
        if (!$nota) {
            return response()->json(['error' => 'Nota no encontrada'], 404);
        }

        $nota->delete();
        return response()->json(['message' => 'Nota eliminada correctamente'], 200);
    }
}