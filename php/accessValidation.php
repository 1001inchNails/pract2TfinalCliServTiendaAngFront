<?php
session_start();

if(!isset($_SESSION['autorizacion']) || $_SESSION['autorizacion']==false){  // si la validacion no existe o es negativo devuelve false (mas redundancia, mas seguridad)

    echo false;

}else{
    echo $_SESSION['userName'];
}
