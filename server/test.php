
?><?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

$host = "localhost"; // Change if your DB is on a different server
$user = "root"; // Default for XAMPP/WAMP
$pass = "shubham"; // Default is empty for XAMPP, "root" for some setups
$db = "grocery_db"; // Change to your actual database name

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die("Database Connection Failed: " . $conn->connect_error);
} else {
    echo "Connected Successfully!";
}
?>
