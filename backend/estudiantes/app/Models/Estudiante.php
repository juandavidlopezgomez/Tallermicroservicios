<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Estudiante extends Model
{
    use HasFactory;

    protected $table = 'estudiantes'; // Nombre correcto de la tabla
    public $timestamps = false;

    protected $fillable = ['cod', 'nombres', 'email'];

    public function notas()
    {
        return $this->hasMany(Notas::class, 'codEstudiante');
    }
}
