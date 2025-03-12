<?php

session_start();


if ($_SERVER["REQUEST_METHOD"] == "POST") {
  $nombre = $_POST["nombre"];
}
  
$_SESSION['userName'] = $nombre;
$_SESSION['autorizacion'] = true;

echo "alrigh alright alright";
?>