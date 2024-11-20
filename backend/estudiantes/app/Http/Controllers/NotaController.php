<?php

namespace App\Http\Controllers;

use App\Models\Notas;
use App\Models\Estudiante;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class NotaController extends Controller
{

    public function obtenerNotas($codEstudiante): JsonResponse
    {
        $notas = Notas::where('codEstudiante', $codEstudiante)->get();
        $estudiante = Estudiante::where('cod', $codEstudiante)->first();

        if (!$estudiante) {
            return response()->json(['error' => 'Estudiante no encontrado'], 404);
        }

        
        $promedio = $notas->avg('nota');
        $notasBajo3 = $notas->where('nota', '<', 3)->count();
        $notasSobre3 = $notas->where('nota', '>=', 3)->count();

        return response()->json([
            'data' => $notas,
            'resumen' => [
                'promedio' => round($promedio, 2),
                'notasBajo3' => $notasBajo3,
                'notasSobre3' => $notasSobre3
            ]
        ], 200);
    }


    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'codEstudiante' => 'required|exists:estudiantes,cod',
            'actividad' => 'required|string|max:255',
            'nota' => 'required|numeric|between:0,5',
        ]);

       
        $notaExistente = Notas::where('codEstudiante', $validated['codEstudiante'])
            ->where('actividad', $validated['actividad'])
            ->first();

        if ($notaExistente) {
            return response()->json(['error' => 'Ya existe una nota registrada para esta actividad'], 409);
        }

        $nota = Notas::create($validated);
        return response()->json(['data' => $nota], 201);
    }

    
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

        
        if (isset($validated['actividad'])) {
            $conflicto = Notas::where('codEstudiante', $nota->codEstudiante)
                ->where('actividad', $validated['actividad'])
                ->where('id', '!=', $id)
                ->first();

            if ($conflicto) {
                return response()->json(['error' => 'Ya existe una nota registrada para esta actividad'], 409);
            }
        }

        $nota->update($validated);
        return response()->json(['data' => $nota], 200);
    }

   
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
