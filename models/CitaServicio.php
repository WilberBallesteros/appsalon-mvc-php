<?php

namespace Model;

class CitaServicio extends ActiveRecord {
     //base de datos
    protected static $tabla = 'citasservicios';
    protected static $columnasDB = ['id', 'citaId', 'servicioId'];

    // atributos
    public $id;
    public $citaId;
    public $servicioId;

    public function __construct($args = []) {
        $this->id = $args['id'] ?? null;
        $this->citaId = $args['citaId'] ?? '';
        $this->servicioId = $args['servicioId'] ?? '';
    }
}