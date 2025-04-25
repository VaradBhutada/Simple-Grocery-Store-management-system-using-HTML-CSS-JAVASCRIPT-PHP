<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
require 'db_connect.php';

header('Content-Type: application/json');

$action = $_GET['action'] ?? $_POST['action'] ?? '';

try {
    switch ($action) {
        case 'get_all':
            $stmt = $conn->prepare("
                SELECT i.*, c.name as customer_name 
                FROM invoices i
                LEFT JOIN customers c ON i.customer_id = c.id
                ORDER BY i.invoice_date DESC
            ");
            $stmt->execute();
            $invoices = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
            
            // Get items for each invoice
            foreach ($invoices as &$invoice) {
                $stmt = $conn->prepare("
                    SELECT ii.*, p.name as product_name, p.price
                    FROM invoice_items ii
                    JOIN products p ON ii.product_id = p.id
                    WHERE ii.invoice_id = ?
                ");
                $stmt->bind_param("i", $invoice['id']);
                $stmt->execute();
                $items = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
                $invoice['items'] = $items;
            }
            
            echo json_encode($invoices);
            break;

        case 'get':
            $id = $_GET['id'];
            $stmt = $conn->prepare("
                SELECT i.*, c.name as customer_name 
                FROM invoices i
                LEFT JOIN customers c ON i.customer_id = c.id
                WHERE i.id = ?
            ");
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $invoice = $stmt->get_result()->fetch_assoc();
            
            if ($invoice) {
                $stmt = $conn->prepare("
                    SELECT ii.*, p.name as product_name, p.price
                    FROM invoice_items ii
                    JOIN products p ON ii.product_id = p.id
                    WHERE ii.invoice_id = ?
                ");
                $stmt->bind_param("i", $id);
                $stmt->execute();
                $items = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
                $invoice['items'] = $items;
            }
            
            echo json_encode($invoice);
            break;

        case 'create':
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Start transaction
            $conn->begin_transaction();
            
            try {
                // Insert invoice
                $stmt = $conn->prepare("
                    INSERT INTO invoices (customer_id, invoice_date, total_amount)
                    VALUES (?, ?, ?)
                ");
                
                // Calculate total amount
                $totalAmount = 0;
                foreach ($data['items'] as $item) {
                    $totalAmount += $item['unit_price'] * $item['quantity'];
                }
                
                $stmt->bind_param("ssd", $data['customer_id'], $data['invoice_date'], $totalAmount);
                $stmt->execute();
                $invoiceId = $stmt->insert_id;
                
                // Insert items
                $stmt = $conn->prepare("
                    INSERT INTO invoice_items (invoice_id, product_id, quantity, unit_price)
                    VALUES (?,  ?, ?, ?)
                ");
                
                foreach ($data['items'] as $item) {
                    $stmt->bind_param("iiid", $invoiceId, $item['product_id'], $item['quantity'], $item['unit_price']);
                    $stmt->execute();
                    
                    // Update product stock
                    $updateStmt = $conn->prepare("
                        UPDATE products SET stock = stock - ? WHERE id = ?
                    ");
                    $updateStmt->bind_param("ii", $item['quantity'], $item['product_id']);
                    $updateStmt->execute();
                }
                
                $conn->commit();
                echo json_encode(['success' => true, 'id' => $invoiceId]);
            } catch (Exception $e) {
                $conn->rollback();
                throw $e;
            }
            break;

        case 'update':
            $data = json_decode(file_get_contents('php://input'), true);
            $invoiceId = $data['id'];
            
            // Start transaction
            $conn->begin_transaction();
            
            try {
                // Update invoice
                $stmt = $conn->prepare("
                    UPDATE invoices 
                    SET customer_id = ?, invoice_date = ?, total_amount = ?
                    WHERE id = ?
                ");
                
                // Calculate total amount
                $totalAmount = 0;
                foreach ($data['items'] as $item) {
                    $totalAmount += $item['unit_price'] * $item['quantity'];
                }
                
                $stmt->bind_param("ssdi", $data['customer_id'], $data['invoice_date'], $totalAmount, $invoiceId);
                $stmt->execute();
                
                // Delete existing items
                $deleteStmt = $conn->prepare("DELETE FROM invoice_items WHERE invoice_id = ?");
                $deleteStmt->bind_param("i", $invoiceId);
                $deleteStmt->execute();
                
                // Insert new items
                $stmt = $conn->prepare("
                    INSERT INTO invoice_items (invoice_id, product_id, quantity, unit_price)
                    VALUES (?, ?, ?, ?)
                ");
                
                foreach ($data['items'] as $item) {
                    $stmt->bind_param("iiid", $invoiceId, $item['product_id'], $item['quantity'], $item['unit_price']);
                    $stmt->execute();
                }
                
                $conn->commit();
                echo json_encode(['success' => true]);
            } catch (Exception $e) {
                $conn->rollback();
                throw $e;
            }
            break;

        case 'delete':
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Start transaction
            $conn->begin_transaction();
            
            try {
                // First delete items
                $stmt = $conn->prepare("DELETE FROM invoice_items WHERE invoice_id = ?");
                $stmt->bind_param("i", $data['id']);
                $stmt->execute();
                
                // Then delete invoice
                $stmt = $conn->prepare("DELETE FROM invoices WHERE id = ?");
                $stmt->bind_param("i", $data['id']);
                $stmt->execute();
                
                $conn->commit();
                echo json_encode(['success' => $stmt->affected_rows > 0]);
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
