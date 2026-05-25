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

function createToast(type, title, message, duration = 5000) {
    const container = document.getElementById("toast-container");

    const toast = document.createElement("div");
    toast.classList.add("toast");
    toast.classList.add(type);

    let icon = "🔔";
    if (type === "success") icon = "✔";
    else if (type === "error") icon = "✖";
    else if (type === "warning") icon = "⚠";
    else if (type === "info") icon = "ⓘ";

    toast.innerHTML = `
        <div class="toast-icon">${icon}</div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <div class="toast-progress"></div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add("hide");
        setTimeout(() => {
            toast.remove();
        }, 400);
    }, duration);
}

function showNotification(eventData) {
    const data = JSON.parse(eventData);

    const type = data[0];
    const title = data[1] || "THÔNG BÁO";
    const message = data[2] || "";
    const duration = parseInt(data[3] || 5000);

    createToast(type, title, message, duration);
}

/* ================= INVENTORY & EQUIPMENT ================= */

let selectedItem = null;

function resetActionMenuState() {
    document.getElementById('btn-use-item').innerText = "SỬ DỤNG";
    document.getElementById('btn-drop-item').style.display = "block";
    selectedItem = null;
}

document.getElementById('close-inv-btn').onclick = () => {
    document.getElementById('inventory-container').classList.add('hidden');

    closeActionMenu();
    closeInfoMenu();

    Cef.sendEvent("inventory_action", JSON.stringify(["close", 0]));
};

function renderInventory(eventData) {
    const data = JSON.parse(eventData);
    const action = data[0];

    const container = document.getElementById('inventory-container');

    if (action === "hide") {
        container.classList.add('hidden');
        closeActionMenu();
        closeInfoMenu();
        return;
    }

    container.classList.remove('hidden');

    // ================= HÀNH TRANG =================
    const items = JSON.parse(data[1] || "[]");
    const grid = document.getElementById('inv-grid');
    grid.innerHTML = "";

    const TOTAL_SLOTS = 16;

    for (let i = 0; i < TOTAL_SLOTS; i++) {
        const slot = document.createElement("div");
        slot.classList.add("inv-slot");

        if (i < items.length) {
            const item = items[i];
            // ĐÃ SỬA: Lấy trực tiếp đường dẫn từ Server Pawn (Ví dụ: "images/items/banhmi.jpeg")
            const iconPath = item.icon ? item.icon : "";

            slot.innerHTML = `
                ${item.icon ? `<img class="item-icon" src="${iconPath}" alt="">` : ""}
                <div class="item-name">${item.name}</div>
                <div class="item-qty">x${item.amount}</div>
            `;

            slot.onclick = () => {
                openActionMenu(item);
            };
        } else {
            slot.classList.add("empty");
        }

        grid.appendChild(slot);
    }

    // ================= TRANG BỊ =================
    if (data[2]) {
        const equips = JSON.parse(data[2] || "[]");

        const equipSlots = document.querySelectorAll('.equip-slot');
        equipSlots.forEach(slot => {
            const slotType = slot.getAttribute('data-slot-type');

            let defaultText = "Trống";
            if (slotType === "head") defaultText = "Nón";
            else if (slotType === "body") defaultText = "Áo";
            else if (slotType === "legs") defaultText = "Quần";
            else if (slotType === "feet") defaultText = "Giày";
            else if (slotType === "hand") defaultText = "Găng";
            else if (slotType === "weapon1") defaultText = "Súng 1";
            else if (slotType === "weapon2") defaultText = "Súng 2";
            else if (slotType === "acc") defaultText = "Phụ kiện";

            slot.innerHTML = `<div class="slot-placeholder">${defaultText}</div>`;
            slot.classList.add('empty');
            slot.onclick = null;
        });

        const typeToIdMap = {
            0: "equip-head",
            1: "equip-body",
            2: "equip-legs",
            3: "equip-feet",
            4: "equip-hand",
            5: "equip-weapon-1",
            6: "equip-weapon-2",
            7: "equip-acc"
        };

        equips.forEach(equip => {
            const targetHtmlId = typeToIdMap[equip.type];
            if (targetHtmlId) {
                const slot = document.getElementById(targetHtmlId);
                if (slot) {
                    // ĐÃ SỬA: Lấy trực tiếp đường dẫn từ Server Pawn cho phần trang bị luôn
                    const iconPath = equip.icon ? equip.icon : "";

                    slot.innerHTML = `
                        ${equip.icon ? `<img class="item-icon" src="${iconPath}" alt="">` : ""}
                        <div class="item-name">${equip.name}</div>
                    `;

                    slot.classList.remove('empty');
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

    document.getElementById('btn-use-item').innerText = "SỬ DỤNG";
    document.getElementById('btn-drop-item').style.display = "block";

    document.getElementById('item-action-modal').classList.remove('hidden');
}

function openEquipActionMenu(equipItem) {
    selectedItem = equipItem;
    document.getElementById('action-item-name').innerText = equipItem.name;

    document.getElementById('btn-use-item').innerText = "THÁO ĐỒ";
    document.getElementById('btn-drop-item').style.display = "none";

    document.getElementById('item-action-modal').classList.remove('hidden');
}

function closeActionMenu() {
    document.getElementById('item-action-modal').classList.add('hidden');
    resetActionMenuState();
}

function closeInfoMenu() {
    document.getElementById('item-info-modal').classList.add('hidden');
}

// ---- SỰ KIỆN KHI BẤM CÁC NÚT TRONG MENU TƯƠNG TÁC ----

document.getElementById('btn-use-item').onclick = () => {
    if (!selectedItem) return;

    if (document.getElementById('btn-use-item').innerText === "THÁO ĐỒ") {
        Cef.sendEvent("inventory_action", JSON.stringify(["takeoff", selectedItem.id]));
    } else {
        Cef.sendEvent("inventory_action", JSON.stringify(["use", selectedItem.id]));
    }

    closeActionMenu();
};

document.getElementById('btn-info-item').onclick = () => {
    if (!selectedItem) return;

    document.getElementById('info-item-title').innerText = selectedItem.name;
    document.getElementById('info-item-desc').innerText = selectedItem.desc || "Vật phẩm này không có mô tả chi tiết.";

    document.getElementById('item-info-modal').classList.remove('hidden');
};

document.getElementById('btn-drop-item').onclick = () => {
    if (!selectedItem) return;

    Cef.sendEvent("inventory_action", JSON.stringify(["drop", selectedItem.id]));
    closeActionMenu();
};

document.getElementById('btn-close-action').onclick = closeActionMenu;
document.getElementById('btn-close-info').onclick = closeInfoMenu;

// Đăng ký event để Pawn gọi
Cef.registerEventCallback("inventory_show", "renderInventory");

/* ================= REGISTER EVENTS ================= */

Cef.registerEventCallback("alert_show", "showAlert");
Cef.registerEventCallback("notification_show", "showNotification");
/* ================= UPDATE HUD STATUS (FOOD & WATER) ================= */

function updatePlayerStatus(eventData) {
    const data = JSON.parse(eventData);
    const food = parseInt(data[0]);
    const water = parseInt(data[1]);

    // Cập nhật thanh thức ăn (Hunger)
    document.getElementById('food-fill').style.width = food + '%';
    document.getElementById('food-text').innerText = food + '%';

    // Cập nhật thanh nước (Thirst)
    document.getElementById('water-fill').style.width = water + '%';
    document.getElementById('water-text').innerText = water + '%';
}

// Đăng ký sự kiện với hệ thống CEF để Pawn có thể gọi sang
Cef.registerEventCallback("hud_update", "updatePlayerStatus");
function updatePlayerStatus(eventData) {
    const data = JSON.parse(eventData);
    const food = parseInt(data[0]);
    const water = parseInt(data[1]);

    // 1. Cập nhật thanh hiển thị % như cũ
    document.getElementById('food-fill').style.width = food + '%';
    document.getElementById('food-text').innerText = food + '%';
    document.getElementById('water-fill').style.width = water + '%';
    document.getElementById('water-text').innerText = water + '%';

    // 2. XỬ LÝ HIỆU ỨNG TOÀN MÀN HÌNH (DÀNH CHO Ý TƯỞNG 2)
    const overlay = document.getElementById('screen-effect-overlay');
    
    // Nếu đói hoặc khát xuống dưới mức báo động (15%) -> Bật viền đỏ nhấp nháy
    if (food <= 15 || water <= 15) {
        overlay.classList.add('vignette-danger');
    } else {
        overlay.classList.remove('vignette-danger');
    }

    // Nếu khát nghiêm trọng (dưới 10%) -> Bật sương mù mờ ảo giác do mất nước
    if (water <= 10) {
        overlay.classList.add('dehydration-effect');
    } else {
        overlay.classList.remove('dehydration-effect');
    }
}
