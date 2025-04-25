// Product Management Script
document.addEventListener('DOMContentLoaded', function () {
  // Initialize mobile menu
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }

  // Load products table
  loadProducts();

  // Setup form submission
  const productForm = document.getElementById('productForm');
  if (productForm) {
    productForm.addEventListener('submit', handleProductSubmit);
  }
});

// Load products into table
async function loadProducts() {
  try {
    const response = await fetch('server/product_api.php?action=get_all');
    const products = await response.json();

    const tableBody = document.getElementById('productTableBody');
    tableBody.innerHTML = products.map(product => `
      <tr class="${product.stock < 5 ? 'bg-red-50' : ''}">
        <td class="px-6 py-4 text-sm text-gray-500">${product.id}</td>
        <td class="px-6 py-4 text-sm font-medium text-gray-900">${product.name}</td>
        <td class="px-6 py-4 text-sm text-gray-500">₹${parseFloat(product.price).toFixed(2)}</td>
        <td class="px-6 py-4 text-sm ${product.stock < 5 ? 'text-red-500 font-bold' : 'text-gray-500'}">${product.stock}</td>
        <td class="px-6 py-4 text-sm text-gray-500">${product.category || '-'}</td>
        <td class="px-6 py-4 text-sm text-gray-500">
          <button onclick="editProduct(${product.id})" class="text-blue-500 hover:text-blue-700 mr-2">
            <i class="fas fa-edit"></i>
          </button>
          <button onclick="deleteProduct(${product.id})" class="text-red-500 hover:text-red-700">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Error loading products:', error);
  }
}

// Handle product form submission
async function handleProductSubmit(e) {
  e.preventDefault();

  const productId = document.getElementById('productId').value;
  const action = productId ? 'update' : 'create';

  const product = {
    id: productId,
    name: document.getElementById('productName').value,
    price: parseFloat(document.getElementById('productPrice').value),
    stock: parseInt(document.getElementById('productStock').value),
    category: document.getElementById('productCategory').value
  };

  try {
    const response = await fetch(`server/product_api.php?action=${action}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(product)
    });

    const result = await response.json();

    if (result.success) {
      closeProductModal();
      loadProducts();
    } else {
      alert('Error saving product: ' + result.message);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error saving product');
  }
}

// Product modal functions
function openProductModal(product = null) {
  const modal = document.getElementById('productModal');
  const title = document.getElementById('modalTitle');

  if (product) {
    title.textContent = 'Edit Product';
    document.getElementById('productId').value = product.id;
    document.getElementById('productName').value = product.name;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productStock').value = product.stock;
    document.getElementById('productCategory').value = product.category || '';
  } else {
    title.textContent = 'Add New Product';
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
  }

  modal.classList.remove('hidden');
}

function closeProductModal() {
  document.getElementById('productModal').classList.add('hidden');
  document.getElementById('productForm').reset();
  document.getElementById('productId').value = '';
}

// Edit product
async function editProduct(id) {
  try {
    const response = await fetch(`server/product_api.php?action=get&id=${id}`);
    const product = await response.json();
    openProductModal(product);
  } catch (error) {
    console.error('Error loading product:', error);
  }
}

// Delete product
async function deleteProduct(id) {
  if (!confirm('Are you sure you want to delete this product?')) return;

  try {
    const response = await fetch(`server/product_api.php?action=delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id })
    });

    const result = await response.json();

    if (result.success) {
      loadProducts();
    } else {
      alert('Error deleting product: ' + result.message);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error deleting product');
  }
}
