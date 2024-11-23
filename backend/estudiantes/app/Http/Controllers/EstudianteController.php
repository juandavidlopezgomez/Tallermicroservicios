<?php 

namespace App\Http\Controllers;

use App\Models\Estudiante;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class EstudianteController extends Controller 
{
    public function index(Request $request): JsonResponse 
{
    $query = Estudiante::query();

    if ($request->filled('cod')) {
        $query->where('cod', $request->cod);
    }

    if ($request->filled('nombres')) {
        $query->where('nombres', 'like', '%' . $request->nombres . '%');
    }

    if ($request->filled('email')) {
        $query->where('email', 'like', '%' . $request->email . '%');
    }

    if ($request->filled('estado')) {
        $query->whereHas('notas', function($q) use ($request) {
            if ($request->estado == 'aprobado') {
                $q->havingRaw('AVG(nota) >= ?', [3]);
            } elseif ($request->estado == 'reprobado') {
                $q->havingRaw('AVG(nota) < ?', [3]);
            }
        });
    }

    $estudiantes = $query->with('notas')->get();

    $resumen = [
        'aprobados' => $estudiantes->filter(fn($e) => $e->notas->avg('nota') >= 3)->count(),
        'reprobados' => $estudiantes->filter(fn($e) => $e->notas->avg('nota') < 3)->count(),
        'sinNotas' => $estudiantes->filter(fn($e) => $e->notas->isEmpty())->count(),
    ];

    return response()->json(['data' => $estudiantes, 'resumen' => $resumen], 200);
}

    public function store(Request $request): JsonResponse 
    {
        $validated = $request->validate([
            'cod' => 'required|integer|unique:estudiantes,cod',
            'nombres' => 'required|string|max:255',
            'email' => 'required|email|unique:estudiantes,email',
        ]);

        $estudiante = Estudiante::create($validated);
        return response()->json(['data' => $estudiante], 201);
    }

    public function show($id): JsonResponse 
    {
        $estudiante = Estudiante::find($id);
        if (!$estudiante) {
            return response()->json(['error' => 'Estudiante no encontrado'], 404);
        }
        return response()->json(['data' => $estudiante], 200);
    }

    public function update(Request $request, $id): JsonResponse 
    {
        $estudiante = Estudiante::find($id);
        if (!$estudiante) {
            return response()->json(['error' => 'Estudiante no encontrado'], 404);
        }

        $validated = $request->validate([
            'nombres' => 'string|max:255',
            'email' => 'email|unique:estudiantes,email,' . $id,
        ]);

        $estudiante->update($validated);
        return response()->json(['data' => $estudiante], 200);
    }

    public function destroy($id): JsonResponse 
{
    try {
        $estudiante = Estudiante::find($id);
        if (!$estudiante) {
            return response()->json(['error' => 'Estudiante no encontrado'], 404);
        }

        // Verificar si tiene notas asociadas
        if ($estudiante->notas()->count() > 0) {
            return response()->json(['error' => 'No se puede eliminar un estudiante con notas registradas'], 403);
        }

        $estudiante->delete();

        return response()->json(['message' => 'Estudiante eliminado correctamente'], 200);
    } catch (\Exception $e) {
        return response()->json(['error' => 'Error interno del servidor', 'details' => $e->getMessage()], 500);
    }
}

}