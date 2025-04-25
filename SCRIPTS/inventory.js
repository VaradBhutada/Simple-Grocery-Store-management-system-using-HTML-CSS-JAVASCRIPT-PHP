// Inventory Management Script
document.addEventListener('DOMContentLoaded', function() {
    // Initialize mobile menu (same as other pages)
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (mobileMenuBtn && mobileMenu) {
      mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
      });
    }
  
    // Load inventory table
    loadInventory();
  
    // Setup form submission
    const stockUpdateForm = document.getElementById('stockUpdateForm');
    if (stockUpdateForm) {
      stockUpdateForm.addEventListener('submit', handleStockUpdate);
    }
  });
  
  // Load inventory data
  async function loadInventory() {
    try {
      const response = await fetch('server/inventory_api.php?action=get_all');
      const inventory = await response.json();
      
      const tableBody = document.getElementById('inventoryTableBody');
      console.log("Inventory data received:", inventory);
      tableBody.innerHTML = inventory.map(item => `
        <tr class="${item.stock < 5 ? 'bg-red-50' : ''}">
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="flex items-center">
              <div class="flex-shrink-0 h-10 w-10">
                <img class="h-10 w-10 rounded-full object-cover" src="${item.image_url || 'https://images.pexels.com/photos/264537/pexels-photo-264537.jpeg'}" alt="${item.name}">
              </div>
              <div class="ml-4">
                <div class="text-sm font-medium text-gray-900">${item.name}</div>
              </div>
            </div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            ${item.category || 'Uncategorized'}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            $${Number(item.price || 0).toFixed(2)}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm ${item.stock < 5 ? 'text-red-500 font-bold' : 'text-gray-500'}">
            ${item.stock}
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <span class="px-2 py-1 rounded-full text-xs ${
              item.stock > 20 ? 'bg-green-100 text-green-800' : 
              item.stock > 5 ? 'bg-yellow-100 text-yellow-800' : 
              'bg-red-100 text-red-800'
            }">
              ${item.stock > 20 ? 'High' : item.stock > 5 ? 'Medium' : 'Low'}
            </span>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            ${new Date(item.updated_at).toLocaleDateString()}
          </td>
        </tr>
      `).join('');
    } catch (error) {
      console.error('Error loading inventory:', error);
    }
  }
  
  // Load products for stock update dropdown
  async function loadProductsForUpdate() {
    try {
      const response = await fetch('server/product_api.php?action=get_all');
      const products = await response.json();
      
      const select = document.getElementById('updateProduct');
      select.innerHTML = '<option value="">Select Product</option>' + 
        products.map(product => `
          <option value="${product.id}">${product.name} (Current: ${product.stock})</option>
        `).join('');
    } catch (error) {
      console.error('Error loading products:', error);
    }
  }
  
  // Handle stock update form submission
  async function handleStockUpdate(e) {
    e.preventDefault();
    
    const productId = document.getElementById('updateProduct').value;
    const action = document.getElementById('updateAction').value;
    const quantity = parseInt(document.getElementById('updateQuantity').value);
    const reason = document.getElementById('updateReason').value;
  
    try {
      const response = await fetch('server/inventory_api.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: productId,
          action: action,
          quantity: quantity,
          reason: reason
        })
      });
  
      if (response.ok) {
        closeStockUpdateModal();
        loadInventory();
      } else {
        alert('Error updating stock');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error updating stock');
    }
  }
  
  // Stock update modal functions
  async function openStockUpdateModal() {
    await loadProductsForUpdate();
    document.getElementById('stockUpdateForm').reset();
    document.getElementById('stockUpdateModal').classList.remove('hidden');
  }
  
  function closeStockUpdateModal() {
    document.getElementById('stockUpdateModal').classList.add('hidden');
  }
  
  // Generate stock report
  function generateStockReport() {
    // In a real implementation, this would generate a PDF report
    alert('Stock report generation would be implemented here');
    // This could be implemented using libraries like jsPDF or by calling a server-side PDF generator
  }
  
  // Initialize low stock alerts
  function checkLowStock() {
    const lowStockItems = document.querySelectorAll('tr.bg-red-50');
    if (lowStockItems.length > 0) {
      alert(`Warning: ${lowStockItems.length} items are low in stock!`);
    }
  }
  
  // Check for low stock when page loads
  checkLowStock();