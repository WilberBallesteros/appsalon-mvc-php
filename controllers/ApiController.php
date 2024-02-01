<?php

namespace Controllers;

use Model\Cita;
use Model\CitaServicio;
use Model\Servicio;

class APIController {
    public static function index() {
        $servicios = Servicio::all();

        echo json_encode($servicios); //pasamos la consulta como json
    }

    public static function guardar() {
        //alacena la cita y deuelve el ID
        $cita = new Cita($_POST);
        $resultado = $cita->guardar();

        $id = $resultado['id'];

        // alacena la cita o citas y el servicio
        //alacena los servicios con el id de la cita
        $idServicios = explode(",", $_POST['servicios']);

        foreach($idServicios as $idServicio){
            $args = [
                'citaId' => $id,
                'servicioId' => $idServicio
            ];
            $citaServicio = new CitaServicio($args);
            $citaServicio->guardar();
        }

        //retornamos una rrespuesta
        echo json_encode(['resultado' => $resultado]);
    }

    public static function eliminar() {
        
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {

            $id = $_POST['id'];
            $cita = Cita::find($id); //encuentra la cita
            $cita->eliminar(); // la elimina
            header('Location:' . $_SERVER['HTTP_REFERER']);
        }
    }
}