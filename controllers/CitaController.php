<?php

namespace Controllers;

use MVC\Router;

class CitaController {

    public static function index(Router $router) {

        //ver si existe session si no redirigir al usuario al inicio de la web
        if (!isset($_SESSION['nombre'])){
            header('Location: /');
        } 
        

        $router->render('cita/index' , [
            'nombre' => $_SESSION['nombre'], //mostrar el nombre en la vista
            'id' => $_SESSION['id']
        ]);
    }
}