document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    const currentUser = JSON.parse(localStorage.getItem("userData"));
    if(!currentUser){
        window.location.href = "login.html";
        return;
    }

    // Initialize mock data (replace with API call later)
    const orders = [
        {
            id: 'ORD-7782-XJ',
            date: '2023-10-24 14:30',
            buyer: 'Alice Freeman',
            vendor: 'TechGadgets Inc.',
            status: 'pending', // pending, failed, successful
            total: '$1,299.00'
        },
        {
            id: 'ORD-9921-MC',
            date: '2023-10-23 09:15',
            buyer: 'Bob Smith',
            vendor: 'HomeEssentials',
            status: 'successful',
            total: '$45.50'
        },
        {
            id: 'ORD-3341-KL',
            date: '2023-10-22 18:00',
            buyer: 'Charlie Brown',
            vendor: 'FashionHub',
            status: 'failed',
            total: '$120.00'
        },
        {
            id: 'ORD-1102-PP',
            date: '2023-10-21 11:20',
            buyer: 'David Wilson',
            vendor: 'TechGadgets Inc.',
            status: 'successful',
            total: '$89.99'
        },
         {
            id: 'ORD-5541-AA',
            date: '2023-10-20 16:45',
            buyer: 'Eva Green',
            vendor: 'GreenGrocer',
            status: 'pending',
            total: '$32.15'
        }
    ];

    renderOrdersList(orders);
    
    // Mobile toggle handlers
    const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
    const sidebarToggleBtnDetail = document.getElementById('sidebarToggleBtnDetail');
    const sidebar = document.querySelector('.sidebar');
    
    function toggleSidebar() {
        sidebar.classList.toggle('closed');
    }

    if(sidebarToggleBtn) sidebarToggleBtn.addEventListener('click', toggleSidebar);
    if(sidebarToggleBtnDetail) sidebarToggleBtnDetail.addEventListener('click', toggleSidebar);

    // Initial check for mobile
    if (window.innerWidth <= 768) {
        sidebar.classList.remove('closed'); // Start open on mobile until selection
    }
});

function renderOrdersList(orders) {
    const list = document.getElementById('ordersList');
    list.innerHTML = '';

    if (orders.length === 0) {
        list.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--text-secondary);">No orders found</div>';
        return;
    }

    orders.forEach(order => {
        const div = document.createElement('div');
        div.className = 'order-item';
        div.dataset.id = order.id;
        div.onclick = () => selectOrder(order);

        div.innerHTML = `
            <div class="order-item-header">
                <span class="order-id-list">${order.id}</span>
                <span class="order-date-list">${new Date(order.date).toLocaleDateString()}</span>
            </div>
            <div class="order-parties">
                <div><strong>Buyer:</strong> ${order.buyer}</div>
                <div><strong>Vendor:</strong> ${order.vendor}</div>
            </div>
            <span class="status-badge status-${order.status}">${order.status}</span>
        `;
        list.appendChild(div);
    });
}

function selectOrder(order) {
    // Update active state in sidebar
    document.querySelectorAll('.order-item').forEach(el => el.classList.remove('active'));
    const activeItem = document.querySelector(`.order-item[data-id="${order.id}"]`);
    if(activeItem) activeItem.classList.add('active');

    // Show Main View
    document.getElementById('ordersEmpty').style.display = 'none';
    const orderView = document.getElementById('orderView');
    orderView.style.display = 'flex';

    // Populate Details
    document.getElementById('orderIdHeader').textContent = order.id;
    
    const statusHeader = document.getElementById('orderStatusHeader');
    statusHeader.textContent = order.status;
    statusHeader.className = `order-status-badge status-header-${order.status}`;

    document.getElementById('vendorName').textContent = order.vendor;
    document.getElementById('buyerName').textContent = order.buyer;
    document.getElementById('orderDate').textContent = order.date;
    document.getElementById('orderTotal').textContent = order.total;

    // Update QR Code (Dynamic)
    const qrData = encodeURIComponent(JSON.stringify({id: order.id, status: order.status}));
    document.getElementById('qrCodeImage').src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${qrData}`;

    // On mobile, hide sidebar when order is selected
    if (window.innerWidth <= 768) {
        document.querySelector('.sidebar').classList.add('closed');
    }
}


// Tab Switching Logic
function switchTab(tabName) {
    // Update Buttons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.querySelector(`.tab-btn[onclick="switchTab('${tabName}')"]`);
    if(activeBtn) activeBtn.classList.add('active');

    // Update Content
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(`${tabName}Tab`).classList.add('active');
}
