<?php
namespace App\Http\Controllers;

use App\Models\Estudiante;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class EstudianteController extends Controller
{
    // Listar todos los estudiantes
    public function index(): JsonResponse
    {
        $estudiantes = Estudiante::all();
        return response()->json(['data' => $estudiantes], 200);
    }

    // Crear un nuevo estudiante
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

    // Obtener un estudiante por su ID
    public function show($id): JsonResponse
    {
        $estudiante = Estudiante::find($id);
        if (!$estudiante) {
            return response()->json(['error' => 'Estudiante no encontrado'], 404);
        }
        return response()->json(['data' => $estudiante], 200);
    }

    // Actualizar un estudiante
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

    // Eliminar un estudiante
    public function destroy($id): JsonResponse
    {
        $estudiante = Estudiante::find($id);
        if (!$estudiante) {
            return response()->json(['error' => 'Estudiante no encontrado'], 404);
        }

        $estudiante->delete();
        return response()->json(['message' => 'Estudiante eliminado correctamente'], 200);
    }

    
}
