<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notas extends Model
{
    use HasFactory;

    protected $table = 'notas';
    public $timestamps = false;

    protected $fillable = ['codEstudiante', 'actividad', 'nota'];

    public function estudiante()
    {
        return $this->belongsTo(Estudiante::class, 'codEstudiante');
    }
}
