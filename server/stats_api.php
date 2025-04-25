<?php
require 'db_connect.php';
header('Content-Type: application/json');

try {
    // Total products
    $res = $conn->query("SELECT COUNT(*) AS total FROM products");
    $tp = $res->fetch_assoc()['total'];

    // Total customers
    $res = $conn->query("SELECT COUNT(*) AS total FROM customers");
    $tc = $res->fetch_assoc()['total'];

    // Total completed orders (invoices with payment_status = 'paid')
    $res = $conn->query("SELECT COUNT(*) AS total FROM invoices WHERE payment_status = 'pending'");
    $ts = $res->fetch_assoc()['total'];

    echo json_encode([
      'total_products'  => (int)$tp,
      'total_customers' => (int)$tc,
      'total_sales'  => (int)$ts
    ]);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}

$conn->close();
?>