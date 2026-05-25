// ================= ALERT =================

function createAlert(title, message, callback) {

    document.getElementById('alert-title').innerText = title;
    document.getElementById('alert-message').innerText = message;

    const overlay = document.getElementById('alert-overlay');

    overlay.classList.remove('hidden');

    document.getElementById('okay-button').onclick = () => {
        hideAlert();
        callback(true);
    };

    document.getElementById('cancel-button').onclick = () => {
        hideAlert();
        callback(false);
    };
}

function hideAlert() {
    const overlay = document.getElementById('alert-overlay');
    overlay.classList.add('hidden');
}

function showAlert(eventData) {
    const eventDataJson = JSON.parse(eventData);

    const alertId = parseInt(eventDataJson[0]);
    const alertTitle = eventDataJson[1];
    const alertMessage = eventDataJson[2];

    createAlert(alertTitle, alertMessage, (response) => {
        let outgoingEventData = new Array();

        outgoingEventData.push(alertId);
        outgoingEventData.push(response);

        console.log(`Response status: ${response}`);

        Cef.sendEvent(
            "alert_response",
            JSON.stringify(outgoingEventData)
        );
    });
}

/* ================= TOAST NOTIFICATION ================= */

function createToast(type, title, message) {
    const container = document.getElementById("toast-container");

    // Dọn sạch hộp chứa để xóa bỏ hoàn toàn tin nhắn cũ trước khi hiện tin mới
    container.innerHTML = ""; 

    const toast = document.createElement("div");

    toast.classList.add("toast");
    toast.classList.add(type);

    toast.innerHTML = `
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
    `;

    container.appendChild(toast);

    // Auto remove
    setTimeout(() => {
        toast.classList.add("hide");

        setTimeout(() => {
            toast.remove();
        }, 400);

    }, 5000);
}

function showNotification(eventData) {
    const data = JSON.parse(eventData);

    const type = data[0];     // Lấy loại thông báo: success, error, warning, info
    const message = data[2];  // Lấy nội dung thông báo từ chuỗi Pawn gửi qua

    // Tự động đặt lại Tiêu đề viết hoa dựa theo từng Loại (Type)
    let title = "THÔNG BÁO";
    if (type === "error") {
        title = "ERROR";
    } else if (type === "warning") {
        title = "WARNING";
    } else if (type === "info") {
        title = "INFO";
    } else if (type === "success") {
        title = "SUCCESS";
    }
    createToast(type, title, message);
}

/* ================= INVENTORY & EQUIPMENT (ĐÃ NÂNG CẤP) ================= */

// Biến toàn cục lưu thông tin vật phẩm được chọn (ở hành trang hoặc trang bị)
let selectedItem = null; 

// Sự kiện bấm nút đóng túi đồ lớn
document.getElementById('close-inv-btn').onclick = () => {
    document.getElementById('inventory-container').classList.add('hidden');
    
    // Tự động đóng luôn các menu con nếu đang mở
    closeActionMenu();
    closeInfoMenu();

    // Gửi tín hiệu về cho Pawn biết người chơi đã đóng túi đồ
    Cef.sendEvent("inventory_action", JSON.stringify(["close", 0]));
};

function renderInventory(eventData) {
    const data = JSON.parse(eventData);
    const action = data[0]; // "show" hoặc "hide"
    
    const container = document.getElementById('inventory-container');

    if (action === "hide") {
        container.classList.add('hidden');
        closeActionMenu();
        closeInfoMenu();
        return;
    }

    // Mở túi đồ
    container.classList.remove('hidden');
    
    // --- 1. XỬ LÝ 16 Ô HÀNH TRANG (BÊN TRÁI) ---
    const items = JSON.parse(data[1]); 
    const grid = document.getElementById('inv-grid');
    grid.innerHTML = ""; // Xóa dữ liệu cũ

    const TOTAL_SLOTS = 16; // Số ô đồ mặc định là 16 (4x4)

    for (let i = 0; i < TOTAL_SLOTS; i++) {
        const slot = document.createElement("div");
        slot.classList.add("inv-slot");

        if (i < items.length) {
            slot.innerHTML = `
                <div class="item-name">${items[i].name}</div>
                <div class="item-qty">x${items[i].amount}</div>
            `;
            
            slot.onclick = () => {
                openActionMenu(items[i]);
            };
        } else {
            slot.classList.add("empty");
        }
        grid.appendChild(slot);
    }

    // --- 2. XỬ LÝ 8 Ô TRANG BỊ BÚP BÊ (BÊN PHẢI) ---
    // Kiểm tra xem dữ liệu trang bị có được gửi kèm qua không (data[2])
    if (data[2]) {
        const equips = JSON.parse(data[2]); 

        // Khôi phục trạng thái trống (Placeholder) ban đầu cho tất cả ô trang bị
        const equipSlots = document.querySelectorAll('.equip-slot');
        equipSlots.forEach(slot => {
            const slotType = slot.getAttribute('data-slot-type');
            
            // Đặt lại tên hiển thị mặc định theo loại ô dựa trên ID gốc (Nón, Áo, Súng 1...)
            let defaultText = "Trống";
            if(slotType === "head") defaultText = "Nón";
            else if(slotType === "body") defaultText = "Áo";
            else if(slotType === "legs") defaultText = "Quần";
            else if(slotType === "feet") defaultText = "Giày";
            else if(slotType === "hand") defaultText = "Găng";
            else if(slotType === "weapon1") defaultText = "Súng 1";
            else if(slotType === "weapon2") defaultText = "Súng 2";
            else if(slotType === "acc") defaultText = "Phụ kiện";

            slot.innerHTML = `<div class="slot-placeholder">${defaultText}</div>`;
            slot.classList.add('empty');
            slot.onclick = null; // Xóa sự kiện bấm cũ nếu có
        });

        // Bản đồ tra cứu từ ID Type (Pawn) sang ID Thẻ HTML
        const typeToIdMap = {
            0: "equip-head",     // EQUIP_TYPE_HEAD
            1: "equip-body",     // EQUIP_TYPE_BODY
            2: "equip-legs",     // EQUIP_TYPE_LEGS
            3: "equip-feet",     // EQUIP_TYPE_FEET
            4: "equip-hand",     // EQUIP_TYPE_HAND
            5: "equip-weapon-1", // EQUIP_TYPE_WEAPON_1
            6: "equip-weapon-2", // EQUIP_TYPE_WEAPON_2
            7: "equip-acc"       // EQUIP_TYPE_ACC
        };

        // Vẽ các vật phẩm đang được trang bị lên búp bê
        equips.forEach(equip => {
            const targetHtmlId = typeToIdMap[equip.type];
            if (targetHtmlId) {
                const slot = document.getElementById(targetHtmlId);
                if (slot) {
                    slot.innerHTML = `<div class="item-name">${equip.name}</div>`;
                    slot.classList.remove('empty');
                    
                    // Khi click vào đồ đang mang -> Mở menu đổi nút thành "THÁO ĐỒ"
                    slot.onclick = () => {
                        openEquipActionMenu(equip);
                    };
                }
            }
        });
    }
}

// ---- CÁC HÀM XỬ LÝ ĐÓNG / MỞ BẢNG TƯƠNG TÁC ----

function openActionMenu(item) {
    selectedItem = item; 
    document.getElementById('action-item-name').innerText = item.name;
    
    // Đảm bảo nút gốc hiển thị chữ "SỬ DỤNG" khi click đồ trong Hành Trang
    document.getElementById('btn-use-item').innerText = "SỬ DỤNG";
    document.getElementById('btn-drop-item').style.display = "block"; // Hiện nút vứt bỏ
    
    document.getElementById('item-action-modal').classList.remove('hidden');
}

// Hàm mở menu tương tác dành riêng cho trang bị đang mang (Để Tháo Ra)
function openEquipActionMenu(equipItem) {
    selectedItem = equipItem; // Lưu thông tin đồ đang mang được chọn
    document.getElementById('action-item-name').innerText = equipItem.name;
    
    // Biến đổi nút "SỬ DỤNG" thành nút "THÁO ĐỒ"
    document.getElementById('btn-use-item').innerText = "THÁO ĐỒ";
    // Ẩn nút "VỨT BỎ" đi (bắt buộc phải tháo ra hành trang mới cho vứt)
    document.getElementById('btn-drop-item').style.display = "none"; 
    
    document.getElementById('item-action-modal').classList.remove('hidden');
}

function closeActionMenu() {
    document.getElementById('item-action-modal').classList.add('hidden');
}

function closeInfoMenu() {
    document.getElementById('item-info-modal').classList.add('hidden');
}

// ---- SỰ KIỆN KHI BẤM CÁC NÚT TRONG MENU TƯƠNG TÁC ----

// 1. Xử lý khi bấm nút "SỬ DỤNG" (Hoặc "THÁO ĐỒ")
document.getElementById('btn-use-item').onclick = () => {
    if (!selectedItem) return;
    
    // Nếu nút đang là "THÁO ĐỒ" (Nghĩa là item này lấy từ khu trang bị búp bê)
    if (document.getElementById('btn-use-item').innerText === "THÁO ĐỒ") {
        // Gửi lệnh "takeoff" kèm ID vật phẩm về cho Pawn xử lý cất vũ khí/lột skin
        Cef.sendEvent("inventory_action", JSON.stringify(["takeoff", selectedItem.id]));
    } else {
        // Ngược lại thì gửi action "use" bình thường để mặc đồ/ăn uống
        Cef.sendEvent("inventory_action", JSON.stringify(["use", selectedItem.id]));
    }
    
    closeActionMenu(); 
};

// 2. Xử lý khi bấm nút "THÔNG TIN"
document.getElementById('btn-info-item').onclick = () => {
    if (!selectedItem) return;
    
    document.getElementById('info-item-title').innerText = selectedItem.name;
    document.getElementById('info-item-desc').innerText = selectedItem.desc || "Vật phẩm này không có mô tả chi tiết.";
    
    document.getElementById('item-info-modal').classList.remove('hidden');
};

// 3. Xử lý khi bấm nút "VỨT BỎ"
document.getElementById('btn-drop-item').onclick = () => {
    if (!selectedItem) return;
    
    Cef.sendEvent("inventory_action", JSON.stringify(["drop", selectedItem.id]));
    closeActionMenu(); 
};

// Đăng ký sự kiện cho các nút quay lại/đóng của menu con
document.getElementById('btn-close-action').onclick = closeActionMenu;
document.getElementById('btn-close-info').onclick = closeInfoMenu;

// Đăng ký event để Pawn gọi
Cef.registerEventCallback("inventory_show", "renderInventory");

/* ================= REGISTER EVENTS ================= */

Cef.registerEventCallback(
    "alert_show",
    "showAlert"
);

Cef.registerEventCallback(
    "notification_show",
    "showNotification"
);
