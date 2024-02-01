<?php

namespace Controllers;


use Classes\Email;
use Model\Usuario;
use MVC\Router;


class LoginController {

    public static function login(Router $router) {

        $alertas = [];

        $auth = new Usuario;

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $auth = new Usuario($_POST);

            $alertas = $auth->validarLogin();
            if (empty($alertas)) {
                //comprobar q existe el usuario
                $usuario = Usuario::where('email', $auth->email);

                if ($usuario) {
                    //verificar el password
                    //lo q el usuario escribio en el formulario
                    if ($usuario->comprobarPasswordAndVerificado($auth->password)) {
                        //autenticar el usuario
                        if(!isset($_SESSION)) {
                            session_start(); //iniciar sesion para q no de errores
                        }

                        $_SESSION['id'] = $usuario->id;
                        $_SESSION['nombre'] = $usuario->nombre . " " . $usuario->apellido;
                        $_SESSION['email'] = $usuario->email;
                        $_SESSION['login'] = true;

                        //redireccionamiento (si es asdmin o no)
                        if ($usuario->admin ===  "1") {
                            $_SESSION['admin'] = $usuario->admin ?? null; //para los admin

                            header('Location: /admin');
                        } else {
                            header('Location: /cita'); //para los clientes
                        }
                    }
                     
                } else {
                    Usuario::setAlerta('error', 'Usuario no encontrado');
                }
            }
        }

        $alertas = Usuario::getAlertas();
        
        $router->render('auth/login', [
            'alertas' => $alertas,
            'auth' => $auth
        ]);
    }

    public static function logout() {
        if(!isset($_SESSION)) {
            session_start();
        }

        $_SESSION = [];

        header('Location: /');
    }

    public static function olvide(Router $router) {

        $alertas = [];

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $auth = new Usuario($_POST);
            $alertas = $auth->validarEmail();

            if (empty($alertas)) { //osea q si escribio el email
                $usuario = Usuario::where('email', $auth->email);

                if ($usuario && $usuario->confirmado === "1") { //usuario no retorne null, = 1
                   //generar token de un solo uso
                    $usuario->crearToken(); //creamos token
                    $usuario->guardar(); //actualizamos en la BD

                    //Enviar el email (enviamos las instrucciones)
                    $email = new Email($usuario->email, $usuario->nombre, $usuario->token);
                    $email->enviarInstrucciones();

                    //alerta de exito
                    Usuario::setAlerta('exito', 'Revisa tu email');
                
                } else {
                    Usuario::setAlerta('error', 'El Usuario No existe o no está confirmado');
                }
            }
        }

        $alertas = Usuario::getAlertas();

        $router->render('auth/olvide-password', [
            'alertas' => $alertas
        ]);
    }

    public static function recuperar(Router $router) {

        $alertas = [];
        $error = false;

        $token = s($_GET['token'] ?? "");

        //buscar usuario por su token
        $usuario = Usuario::where('token', $token);

        if (empty($usuario)) {
            Usuario::setAlerta('error', 'Token No Válido');
            $error = true;
        }

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
           //leer el nuevo password y guardarlo
           $password = new Usuario($_POST);
           $alertas = $password->validarPassword();

           if (empty($alertas)) {
            $usuario->password = null; //elimina el password q tenia 

            $usuario->password = $password->password;
            $usuario->hashPassword();
            $usuario->token = null;

            $resultado = $usuario->guardar();

            if ($resultado) {
                header('Location: /');
            }
           }
        }

        // debuguear($usuario);

        $alertas = Usuario::getAlertas();

        $router->render('auth/recuperar-password', [
            'alertas' => $alertas,
            'error' => $error
        ]);
}


    public static function crear(Router $router) {

        $usuario = new Usuario();

        //alertas vacias
        $alertas = [];
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            
            //lena el arreglo con lo q escriben en los formularios, ver crear-cuenta.php
            $usuario->sincronizar($_POST); 
            $alertas = $usuario->validarNuevaCuenta();

            //revisar que alerta esta vacio
            if (empty($alertas)) {
                //verificar que el usuario no este registrado
                $resultado = $usuario->existeUsuario();

                if ($resultado->num_rows) {
                    $alertas = Usuario::getAlertas();
                } else {
                    //hashear el Password
                    $usuario->hashPassword();

                    //GENERAR UN tOKEN UNICO
                    $usuario->crearToken();

                    //enviar el email
                    $email = new Email($usuario->email, $usuario->nombre, $usuario->token);

                    //enviar confirmacion
                    $email->enviarConfirmacion();

                    //crear el usuario
                    $resultado = $usuario->guardar();

                    if ($resultado) {
                        header('Location: /mensaje');
                    }
                }
            }
        
        }

        $router->render('auth/crear-cuenta', [
            'usuario' => $usuario, //variable q pasamos a la vista crear-cuenta
            'alertas' => $alertas
        ]);
    }

    public static function mensaje(Router $router) {
        $router->render('auth/mensaje');
    }

    public static function confirmar(Router $router) {

        $alertas = [];
        $token = s($_GET['token']);
        $usuario = Usuario::where('token', $token);
        
        if (empty($usuario)) {
            //mostrar mensaje de error
            Usuario::setAlerta('error', 'Token No Válido'); //error es la clase de css
        } else {
            //modificar a usuario confirmado
           $usuario->confirmado = "1"; //confirmado esta en el objeto al debugear
           $usuario->token = null;
           $usuario->guardar();
           Usuario::setAlerta('exito', 'Cuenta Comprobada Correctamente'); //exito clase css
        }

        //obtener alertas
        $alertas = Usuario::getAlertas(); //lea las alertas poco antes de renderizar la vista

        //renderizar la vista
        $router->render('auth/confirmar-cuenta', [
            'alertas' => $alertas
        ]);
    }

}