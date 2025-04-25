// Main application script
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (mobileMenuBtn && mobileMenu) {
      mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
      });
    }
  
    // Load featured products
    if (document.getElementById('featuredProducts')) {
      fetchProducts();
    }
  
    // Load stats
    if (document.getElementById('totalProducts')) {
      fetchStats();
    }
  });
  
  // Fetch and display products
  async function fetchProducts() {
    try {
      const response = await fetch('server/product_api.php?action=get_featured');
      const products = await response.json();
      
      const productsContainer = document.getElementById('featuredProducts');
      productsContainer.innerHTML = products.map(product => `
        <div class="product-card bg-white rounded-lg shadow-md overflow-hidden">
          <img src="${product.image_url}" alt="${product.name}" class="w-full h-48 object-cover">
          <div class="p-4">
            <h3 class="text-lg font-medium">${product.name}</h3>
            <p class="text-gray-600">$${product.price.toFixed(2)}</p>
            <div class="flex justify-between items-center mt-2">
              <span class="${product.stock < 10 ? 'text-red-500' : 'text-green-500'}">
                Stock: ${product.stock}
              </span>
              <button class="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600" 
                      onclick="addToCart(${product.id})">
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      `).join('');
    } catch (error) {
      console.error('Error loading products:', error);
    }
  }
  
  // Fetch and display stats
  async function fetchStats() {
    try {
      const response = await fetch('server/stats_api.php');
      const stats = await response.json();
      
      document.getElementById('totalProducts').textContent = stats.total_products;
      document.getElementById('totalCustomers').textContent = stats.total_customers;
      document.getElementById('totalSales').textContent = stats.total_sales;
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }
  
  // Cart functionality
  let cart = [];
  
  function addToCart(productId) {
    // Implementation would fetch product details and add to cart
    console.log(`Product ${productId} added to cart`);
    // In a real implementation, we would update the UI to show cart items
  }