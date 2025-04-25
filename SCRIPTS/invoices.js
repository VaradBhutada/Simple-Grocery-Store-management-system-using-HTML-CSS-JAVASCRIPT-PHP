// Invoice Management Script
document.addEventListener('DOMContentLoaded', function() {
  // Initialize mobile menu (same as other pages)
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }

  // Load invoices table
  loadInvoices();

  // Setup form submission
  const invoiceForm = document.getElementById('invoiceForm');
  if (invoiceForm) {
    invoiceForm.addEventListener('submit', handleInvoiceSubmit);
  }
});

// Load invoices into table
async function loadInvoices() {
  try {
    const response = await fetch('server/invoice_api.php?action=get_all');
    const invoices = await response.json();
    
    const tableBody = document.getElementById('invoiceTableBody');
    tableBody.innerHTML = invoices.map(invoice => `
      <tr>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#${invoice.id}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
          ${invoice.customer_name || 'Unknown Customer'}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          ${new Date(invoice.invoice_date).toLocaleDateString()}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          ₹${parseFloat(invoice.total_amount).toFixed(2)}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm">
          <span class="px-2 py-1 rounded-full text-xs ${
            invoice.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 
            invoice.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
            'bg-red-100 text-red-800'
          }">
            ${invoice.payment_status}
          </span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          <button onclick="viewInvoice(${invoice.id})" class="text-blue-500 hover:text-blue-700 mr-2">
            <i class="fas fa-eye"></i>
          </button>
          <button onclick="printInvoice(${invoice.id})" class="text-purple-500 hover:text-purple-700 mr-2">
            <i class="fas fa-print"></i>
          </button>
          <button onclick="deleteInvoice(${invoice.id})" class="text-red-500 hover:text-red-700">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `).join('');
    
  } catch (error) {
    console.error('Error loading invoices:', error);
  }
}

// Handle invoice form submission
async function handleInvoiceSubmit(e) {
  e.preventDefault();
  
  const invoiceId = document.getElementById('invoiceId').value;
  const customerId = document.getElementById('invoiceCustomer').value;
  const invoiceDate = document.getElementById('invoiceDate').value;
  
  // Collect items
  const items = [];
  document.querySelectorAll('.invoice-item').forEach(item => {
    const productId = item.querySelector('.item-product').value;
    const price = parseFloat(item.querySelector('.item-price').value);
    const quantity = parseInt(item.querySelector('.item-quantity').value);
    
    if (productId && price && quantity) {
      items.push({
        product_id: productId,
        unit_price: price,
        quantity: quantity
      });
    }
  });

  if (items.length === 0) {
    alert('Please add at least one item to the invoice');
    return;
  }

  const invoice = {
    customer_id: customerId,
    invoice_date: invoiceDate,
    items: items
  };

  // Set proper action so the backend knows whether to create or update
  const action = invoiceId ? 'update' : 'create';
  const url = `server/invoice_api.php?action=${action}`;
  const method = 'POST'; // Always using POST for create/update

  try {
    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({...invoice, id: invoiceId || null})
    });

    if (response.ok) {
      closeInvoiceModal();
      loadInvoices();
    } else {
      const error = await response.json();
      alert('Error saving invoice: ' + (error.error || 'Unknown error'));
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error saving invoice');
  }
}

// Invoice modal functions
async function openInvoiceModal(invoice = null) {
  const modal = document.getElementById('invoiceModal');
  const title = document.getElementById('invoiceModalTitle');
  
  // Load customers and products
  await loadCustomersForInvoice();
  await loadProductsForInvoice();
  
  if (invoice) {
    title.textContent = 'Edit Invoice';
    document.getElementById('invoiceId').value = invoice.id;
    document.getElementById('invoiceCustomer').value = invoice.customer_id;
    document.getElementById('invoiceDate').value = invoice.invoice_date.split('T')[0];
    
    // Load invoice items
    const itemsContainer = document.getElementById('invoiceItems');
    itemsContainer.innerHTML = '';
    
    invoice.items.forEach(item => {
      addInvoiceItem(item);
    });
    
    updateInvoiceTotal();
  } else {
    title.textContent = 'Create New Invoice';
    document.getElementById('invoiceForm').reset();
    document.getElementById('invoiceId').value = '';
    document.getElementById('invoiceItems').innerHTML = '';
    document.getElementById('invoiceTotal').textContent = '0.00';
    addInvoiceItem();
  }
  
  modal.classList.remove('hidden');
}

function closeInvoiceModal() {
  document.getElementById('invoiceModal').classList.add('hidden');
}

// Load customers for invoice dropdown
async function loadCustomersForInvoice() {
  try {
    const response = await fetch('server/customer_api.php?action=get_all');
    const customers = await response.json();
    
    const select = document.getElementById('invoiceCustomer');
    select.innerHTML = '<option value="">Select Customer</option>' + 
      customers.map(customer => `
        <option value="${customer.id}">${customer.name}</option>
      `).join('');
  } catch (error) {
    console.error('Error loading customers:', error);
  }
}

// Load products for invoice items
async function loadProductsForInvoice() {
  try {
    const response = await fetch('server/product_api.php?action=get_all');
    const products = await response.json();
    
    window.invoiceProducts = products; // Store for later use
  } catch (error) {
    console.error('Error loading products:', error);
  }
}

// Add new invoice item
function addInvoiceItem(item = null) {
  const template = document.getElementById('invoiceItemTemplate');
  const clone = template.content.cloneNode(true);
  const itemElement = clone.querySelector('.invoice-item');
  
  const productsSelect = itemElement.querySelector('.item-product');
  if (window.invoiceProducts) {
    productsSelect.innerHTML = '<option value="">Select Product</option>' + 
      window.invoiceProducts.map(product => `
        <option value="${product.id}" 
                data-price="${product.price}"
                ${item && item.product_id == product.id ? 'selected' : ''}>
          ${product.name} (${Number(product.price).toFixed(2)})
        </option>
      `).join('');
  }
  
  if (item) {
    itemElement.querySelector('.item-price').value = item.unit_price;
    itemElement.querySelector('.item-quantity').value = item.quantity;
    itemElement.querySelector('.item-total').value = (item.unit_price * item.quantity).toFixed(2);
  }
  
  // Set up event listeners
  productsSelect.addEventListener('change', function() {
    const selectedOption = this.options[this.selectedIndex];
    if (selectedOption && selectedOption.dataset.price) {
      const priceInput = this.closest('.invoice-item').querySelector('.item-price');
      priceInput.value = selectedOption.dataset.price;
      calculateItemTotal(this.closest('.invoice-item'));
    }
  });
  
  itemElement.querySelector('.item-quantity').addEventListener('input', function() {
    calculateItemTotal(this.closest('.invoice-item'));
  });
  
  itemElement.querySelector('.remove-item').addEventListener('click', function() {
    this.closest('.invoice-item').remove();
    updateInvoiceTotal();
  });
  
  document.getElementById('invoiceItems').appendChild(itemElement);
  
  if (item) {
    calculateItemTotal(itemElement);
  }
}

// Calculate total for a single item
function calculateItemTotal(itemElement) {
  const price = parseFloat(itemElement.querySelector('.item-price').value) || 0;
  const quantity = parseInt(itemElement.querySelector('.item-quantity').value) || 0;
  const total = price * quantity;
  
  itemElement.querySelector('.item-total').value = total.toFixed(2);
  updateInvoiceTotal();
}

// Update the invoice total
function updateInvoiceTotal() {
  let total = 0;
  document.querySelectorAll('.invoice-item').forEach(item => {
    const itemTotal = parseFloat(item.querySelector('.item-total').value) || 0;
    total += itemTotal;
  });
  
  document.getElementById('invoiceTotal').textContent = total.toFixed(2);
}

// View invoice details
async function viewInvoice(id) {
  try {
    const response = await fetch(`server/invoice_api.php?action=get&id=${id}`);
    const invoice = await response.json();
    openInvoiceModal(invoice);
  } catch (error) {
    console.error('Error loading invoice:', error);
  }
}

// Print invoice
function printInvoice(id) {
  window.open(`invoice_print.html?id=${id}`, '_blank');
}

// Delete invoice
async function deleteInvoice(id) {
  if (!confirm('Are you sure you want to delete this invoice?')) return;
  
  try {
    const response = await fetch('server/invoice_api.php?action=delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: id })
    });

    if (response.ok) {
      loadInvoices();
    } else {
      alert('Error deleting invoice');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error deleting invoice');
  }
}

// Expose functions globally for HTML onclick attributes
window.openInvoiceModal = openInvoiceModal;
window.closeInvoiceModal = closeInvoiceModal;
window.addInvoiceItem = addInvoiceItem;
window.viewInvoice = viewInvoice;
window.printInvoice = printInvoice;
window.deleteInvoice = deleteInvoice;
