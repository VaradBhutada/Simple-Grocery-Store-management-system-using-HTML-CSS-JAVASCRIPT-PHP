<?php
require 'db_connect.php';

header('Content-Type: application/json');

$action = $_GET['action'] ?? $_POST['action'] ?? '';

try {
    switch ($action) {
        case 'get_all':
            $stmt = $conn->prepare("SELECT * FROM customers ORDER BY name");
            $stmt->execute();
            $customers = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
            echo json_encode($customers);
            break;

        case 'get':
            $id = $_GET['id'];
            $stmt = $conn->prepare("SELECT * FROM customers WHERE id = ?");
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $customer = $stmt->get_result()->fetch_assoc();
            echo json_encode($customer);
            break;

        case 'create':
            $data = json_decode(file_get_contents('php://input'), true);
            $stmt = $conn->prepare("INSERT INTO customers (name, email, phone, address) VALUES (?, ?, ?, ?)");
            $stmt->bind_param("ssss", $data['name'], $data['email'], $data['phone'], $data['address']);
            $stmt->execute();
            echo json_encode(['success' => true, 'id' => $stmt->insert_id]);
            break;

        case 'update':
            $data = json_decode(file_get_contents('php://input'), true);
            $stmt = $conn->prepare("UPDATE customers SET name = ?, email = ?, phone = ?, address = ? WHERE id = ?");
            $stmt->bind_param("ssssi", $data['name'], $data['email'], $data['phone'], $data['address'], $data['id']);
            $stmt->execute();
            echo json_encode(['success' => $stmt->affected_rows > 0]);
            break;

        case 'delete':
            $data = json_decode(file_get_contents('php://input'), true);
            $stmt = $conn->prepare("DELETE FROM customers WHERE id = ?");
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
