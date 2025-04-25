// Customer Management Script
document.addEventListener('DOMContentLoaded', function () {
  // Initialize mobile menu
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }

  // Load customers table
  loadCustomers();

  // Setup form submission
  const customerForm = document.getElementById('customerForm');
  if (customerForm) {
    customerForm.addEventListener('submit', handleCustomerSubmit);
  }
});

// Load customers into table
async function loadCustomers() {
  try {
    const response = await fetch('server/customer_api.php?action=get_all');
    const customers = await response.json();

    const tableBody = document.getElementById('customerTableBody');
    tableBody.innerHTML = customers.map(customer => `
      <tr>
        <td class="px-6 py-4 text-sm text-gray-500">${customer.id}</td>
        <td class="px-6 py-4 text-sm font-medium text-gray-900">${customer.name}</td>
        <td class="px-6 py-4 text-sm text-gray-500">${customer.email || '-'}</td>
        <td class="px-6 py-4 text-sm text-gray-500">${customer.phone || '-'}</td>
        <td class="px-6 py-4 text-sm text-gray-500">
          <button onclick="editCustomer(${customer.id})" class="text-blue-500 hover:text-blue-700 mr-2">
            <i class="fas fa-edit"></i>
          </button>
          <button onclick="deleteCustomer(${customer.id})" class="text-red-500 hover:text-red-700">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Error loading customers:', error);
  }
}

// Handle customer form submission
async function handleCustomerSubmit(e) {
  e.preventDefault();

  const customerId = document.getElementById('customerId').value;
  const action = customerId ? 'update' : 'create';

  const customer = {
    id: customerId,
    name: document.getElementById('customerName').value,
    email: document.getElementById('customerEmail').value,
    phone: document.getElementById('customerPhone').value,
    address: document.getElementById('customerAddress').value
  };

  try {
    const response = await fetch(`server/customer_api.php?action=${action}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(customer)
    });

    const result = await response.json();

    if (result.success) {
      closeCustomerModal();
      loadCustomers();
    } else {
      alert('Error saving customer: ' + result.message);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error saving customer');
  }
}

// Customer modal functions
function openCustomerModal(customer = null) {
  const modal = document.getElementById('customerModal');
  const title = document.getElementById('customerModalTitle');

  if (customer) {
    title.textContent = 'Edit Customer';
    document.getElementById('customerId').value = customer.id;
    document.getElementById('customerName').value = customer.name;
    document.getElementById('customerEmail').value = customer.email || '';
    document.getElementById('customerPhone').value = customer.phone || '';
    document.getElementById('customerAddress').value = customer.address || '';
  } else {
    title.textContent = 'Add New Customer';
    document.getElementById('customerForm').reset();
    document.getElementById('customerId').value = '';
  }

  modal.classList.remove('hidden');
}

function closeCustomerModal() {
  document.getElementById('customerModal').classList.add('hidden');
  document.getElementById('customerForm').reset();
  document.getElementById('customerId').value = '';
}

// Edit customer
async function editCustomer(id) {
  try {
    const response = await fetch(`server/customer_api.php?action=get&id=${id}`);
    const customer = await response.json();
    openCustomerModal(customer);
  } catch (error) {
    console.error('Error loading customer:', error);
  }
}

// Delete customer
async function deleteCustomer(id) {
  if (!confirm('Are you sure you want to delete this customer?')) return;

  try {
    const response = await fetch('server/customer_api.php?action=delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id })
    });

    const result = await response.json();

    if (result.success) {
      loadCustomers();
    } else {
      alert('Error deleting customer: ' + result.message);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error deleting customer');
  }
}
