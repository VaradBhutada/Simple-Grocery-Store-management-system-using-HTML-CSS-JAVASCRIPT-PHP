<?php
require 'db_connect.php';

header('Content-Type: application/json');

$action = $_GET['action'] ?? $_POST['action'] ?? '';

try {
    switch ($action) {
        case 'get_all':
            $stmt = $conn->prepare("
                SELECT * FROM products
                ORDER BY stock ASC, name

            ");
            $stmt->execute();
            $inventory = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
            echo json_encode($inventory);
            break;

        case 'update':
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Start transaction
            $conn->begin_transaction();
            
            try {
                // Get current stock
                $stmt = $conn->prepare("SELECT stock FROM products WHERE id = ?");
                $stmt->bind_param("i", $data['product_id']);
                $stmt->execute();
                $result = $stmt->get_result()->fetch_assoc();
                $currentStock = $result['stock'];
                
                // Calculate new stock
                $newStock = $currentStock;
                switch ($data['action']) {
                    case 'add':
                        $newStock += $data['quantity'];
                        break;
                    case 'remove':
                        $newStock -= $data['quantity'];
                        break;
                    case 'set':
                        $newStock = $data['quantity'];
                        break;
                }
                
                // Update product stock
                $stmt = $conn->prepare("UPDATE products SET stock = ? WHERE id = ?");
                $stmt->bind_param("ii", $newStock, $data['product_id']);
                $stmt->execute();
                
                // Log the inventory change
                $stmt = $conn->prepare("
                    INSERT INTO inventory_logs 
                    (product_id, action, quantity, previous_stock, new_stock, reason)
                    VALUES (?, ?, ?, ?, ?, ?)
                ");
                $stmt->bind_param(
                    "isiiss", 
                    $data['product_id'], 
                    $data['action'], 
                    $data['quantity'], 
                    $currentStock, 
                    $newStock, 
                    $data['reason']
                );
                $stmt->execute();
                
                $conn->commit();
                echo json_encode(['success' => true, 'new_stock' => $newStock]);
            } catch (Exception $e) {
                $conn->rollback();
                throw $e;
            }
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