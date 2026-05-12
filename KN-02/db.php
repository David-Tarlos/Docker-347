<?php
$host = 'kn02b-db';
$user = 'root';
$pass = 'Test1234!';
$db   = 'mysql';

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die('Verbindung fehlgeschlagen: ' . $conn->connect_error);
}

echo 'Verbindung zur Datenbank erfolgreich auf Host ' . $host;

$conn->close();
