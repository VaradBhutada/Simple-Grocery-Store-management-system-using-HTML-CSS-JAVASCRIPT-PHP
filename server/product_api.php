<?php
require 'db_connect.php';

header('Content-Type: application/json');

$action = $_GET['action'] ?? $_POST['action'] ?? '';

try {
    switch ($action) {
        case 'get_all':
            $stmt = $conn->prepare("SELECT * FROM products ORDER BY name");
            $stmt->execute();
            $products = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
            echo json_encode($products);
            break;

        case 'get_featured':
            $stmt = $conn->prepare("SELECT * FROM products WHERE stock > 0 ORDER BY RAND() LIMIT 6");
            $stmt->execute();
            $products = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
            echo json_encode($products);
            break;

        case 'get':
            $id = $_GET['id'];
            $stmt = $conn->prepare("SELECT * FROM products WHERE id = ?");
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $product = $stmt->get_result()->fetch_assoc();
            echo json_encode($product);
            break;

        case 'create':
            $data = json_decode(file_get_contents('php://input'), true);
            $stmt = $conn->prepare("INSERT INTO products (name, price, stock, category) VALUES (?, ?, ?, ?)");
            $stmt->bind_param("sdis", $data['name'], $data['price'], $data['stock'], $data['category']);
            $stmt->execute();
            echo json_encode(['success' => true, 'id' => $stmt->insert_id]);
            break;

        case 'update':
            $data = json_decode(file_get_contents('php://input'), true);
            $stmt = $conn->prepare("UPDATE products SET name = ?, price = ?, stock = ?, category = ? WHERE id = ?");
            $stmt->bind_param("sdisi", $data['name'], $data['price'], $data['stock'], $data['category'], $data['id']);
            $stmt->execute();
            echo json_encode(['success' => $stmt->affected_rows > 0]);
            break;

        case 'delete':
            $data = json_decode(file_get_contents('php://input'), true);
            $stmt = $conn->prepare("DELETE FROM products WHERE id = ?");
            $stmt->bind_param("i", $data['id']);
            $stmt->execute();
            echo json_encode(['success' => $stmt->affected_rows > 0]);
            break;

        default:
            echo json_encode(['error' => 'Invalid action']);
            break;
    }
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}

$conn->close();
?>