let selectedItem = null;
let isEquipSlotSelected = false;

// Hàm nhận data từ Pawn đổ vào UI (Gọi khi gõ /cefinv)
function renderInventory(eventData) {
    const data = JSON.parse(eventData);
    const items = JSON.parse(data[1] || "[]");
    const equips = JSON.parse(data[2] || "[]");

    // 1. Reset panel chi tiết về trạng thái ban đầu
    document.getElementById('detail-placeholder').classList.remove('hidden');
    document.getElementById('detail-content').classList.add('hidden');
    selectedItem = null;
    isEquipSlotSelected = false;

    // 2. Render 56 ô đồ hành trang
    const grid = document.getElementById('inv-grid');
    grid.innerHTML = "";
    document.getElementById('slot-text').innerText = `${items.length} / 56 SLOT`;

    for (let i = 0; i < 56; i++) {
        const slot = document.createElement("div");
        slot.className = "inv-slot";
        
        if (i < items.length) {
            slot.innerHTML = `
                <div class="item-qty">x${items[i].amount}</div>
                <img src="${items[i].icon}" style="width:75%; height:75%; margin:12.5%; object-fit:contain;">
            `;
            // Lắng nghe click vật phẩm trong túi đồ
            slot.onclick = (e) => {
                removeActiveStates();
                slot.classList.add('active-slot'); // Thêm viền sáng khi chọn đồ
                showItemDetails(items[i], false);
            };
        }
        grid.appendChild(slot);
    }

    // 3. Render các ô trang bị (0 đến 5)
    for (let slotId = 0; slotId < 6; slotId++) {
        const eSlot = document.getElementById(`equip-${slotId}`);
        const eqItem = equips.find(e => e.type === slotId);
        
        if (eqItem) {
            eSlot.innerHTML = `<img src="${eqItem.icon}" style="width:80%; height:80%; margin:10%; object-fit:contain;">`;
            eSlot.classList.remove('empty');
            eSlot.onclick = () => {
                removeActiveStates();
                eSlot.classList.add('active-slot'); // Thêm viền sáng khi chọn đồ đang mặc
                showItemDetails(eqItem, true);
            };
        } else {
            eSlot.innerHTML = "";
            eSlot.classList.add('empty');
            // Nếu ô trống, cho phép click để nhận biết (bạn có thể viết thêm logic thông báo tại đây)
            eSlot.onclick = () => clickEquipSlot(slotId); 
        }
    }
}

// Hàm hiển thị thông tin chi tiết sang Panel Phải khi click
function showItemDetails(item, isEquipped) {
    selectedItem = item;
    isEquipSlotSelected = isEquipped;

    document.getElementById('detail-placeholder').classList.add('hidden');
    document.getElementById('detail-content').classList.remove('hidden');

    document.getElementById('detail-name').innerText = item.name;
    document.getElementById('detail-icon').src = item.icon;
    document.getElementById('detail-desc').innerText = item.desc || "Không có thông tin mô tả cho vật phẩm này.";
    
    // Cập nhật nhãn độ hiếm (Cần sa thô -> RARE, Bánh mì -> COMMON...)
    const rarityBadge = document.getElementById('detail-rarity');
    rarityBadge.innerText = item.rarity || "COMMON";
    rarityBadge.className = `rarity ${item.rarity?.toLowerCase() || 'common'}`;

    // Đổi tên và màu nút hành động chính nếu đồ đang mặc trên người
    const mainBtn = document.getElementById('btn-action-main');
    if (isEquipped) {
        mainBtn.innerText = "❌ THÁO ĐỒ";
        mainBtn.style.background = "#ff9800";
    } else {
        mainBtn.innerText = "⚡ SỬ DỤNG";
        mainBtn.style.background = "#00e5ff";
    }
}

// Hàm bổ trợ: Xóa viền sáng của các ô cũ khi click chọn ô mới
function removeActiveStates() {
    document.querySelectorAll('.inv-slot, .equip-slot').forEach(slot => {
        slot.classList.remove('active-slot');
    });
}

// Hàm xử lý khi người chơi bấm vào một ô trang bị TRỐNG (Đồng bộ với thuộc tính onclick trong HTML của bạn)
function clickEquipSlot(slotId) {
    removeActiveStates();
    // Reset thông tin bên phải nếu bấm trúng ô trống
    document.getElementById('detail-placeholder').classList.remove('hidden');
    document.getElementById('detail-content').classList.add('hidden');
    selectedItem = null;
    isEquipSlotSelected = false;
}

// Gửi lệnh về Server qua thư viện sampmobilecef
function sendAction(actionType) {
    if (!selectedItem) return;
    
    let finalAction = actionType;
    // Nếu đang chọn đồ trang bị mà nhấn nút chính -> chuyển action thành takeoff (Tháo đồ)
    if (isEquipSlotSelected && actionType === 'use') {
        finalAction = 'takeoff';
    }

    Cef.sendEvent("inventory_action", JSON.stringify([finalAction, selectedItem.id, selectedItem.type || 0]));
}

// Đăng ký nhận event hiển thị từ Server
Cef.registerEventCallback("inventory_show", "renderInventory");
