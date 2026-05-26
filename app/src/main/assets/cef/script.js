/* ================= GLOBAL ================= */
let selectedItem = null;

/* ================= ALERT ================= */
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
    document.getElementById('alert-overlay').classList.add('hidden');
}

function showAlert(eventData) {
    const eventDataJson = JSON.parse(eventData);
    createAlert(eventDataJson[1], eventDataJson[2], (response) => {
        Cef.sendEvent("alert_response", JSON.stringify([parseInt(eventDataJson[0]), response]));
    });
}

/* ================= TOAST NOTIFICATION ================= */
function createToast(type, title, message, duration = 5000) {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    let icon = type === "success" ? "✔" : type === "error" ? "✖" : type === "warning" ? "⚠" : "ⓘ";

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
        setTimeout(() => toast.remove(), 400);
    }, duration);
}

function showNotification(eventData) {
    const data = JSON.parse(eventData);
    createToast(data[0], data[1] || "THÔNG BÁO", data[2] || "", parseInt(data[3] || 5000));
}

/* ================= INVENTORY & EQUIPMENT ================= */
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
    if (data[0] === "hide") {
        document.getElementById('inventory-container').classList.add('hidden');
        return;
    }
    document.getElementById('inventory-container').classList.remove('hidden');

    // FIX: Bỏ JSON.parse ở data[1] vì từ file Pawn (dùng thư viện YSI JSON) gửi qua đã là dạng Object/Array chuẩn
    const items = data[1] || [];
    const grid = document.getElementById('inv-grid');
    grid.innerHTML = "";
    
    for (let i = 0; i < 16; i++) {
        const slot = document.createElement("div");
        slot.className = "inv-slot " + (i < items.length ? "" : "empty");
        if (i < items.length) {
            slot.innerHTML = `<img class="item-icon" src="${items[i].icon}"> <div class="item-name">${items[i].name}</div> <div class="item-qty">x${items[i].amount}</div>`;
            slot.onclick = () => openActionMenu(items[i]);
        }
        grid.appendChild(slot);
    }

    // FIX: Bỏ JSON.parse ở data[2]
    if (data[2]) {
        const equips = data[2] || [];
        document.querySelectorAll('.equip-slot').forEach(s => { 
            s.innerHTML = `<div class="slot-placeholder">${s.getAttribute('data-slot-type')}</div>`; 
            s.classList.add('empty'); 
        });
        
        const typeToIdMap = {
            0: "equip-head", 1: "equip-body", 2: "equip-legs", 
            3: "equip-feet", 4: "equip-hand", 5: "equip-weapon-1", 
            6: "equip-weapon-2", 7: "equip-acc"
        };
        
        equips.forEach(equip => {
            const slot = document.getElementById(typeToIdMap[equip.type]);
            if (slot) {
                slot.innerHTML = `<img class="item-icon" src="${equip.icon}"> <div class="item-name">${equip.name}</div>`;
                slot.classList.remove('empty');
                slot.onclick = () => openEquipActionMenu(equip);
            }
        });
    }
}

function openActionMenu(item) { 
    selectedItem = item; 
    document.getElementById('action-item-name').innerText = item.name; 
    document.getElementById('item-action-modal').classList.remove('hidden'); 
}

function openEquipActionMenu(item) { 
    selectedItem = item; 
    document.getElementById('action-item-name').innerText = item.name; 
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

document.getElementById('btn-use-item').onclick = () => {
    if (!selectedItem) return;
    const action = document.getElementById('btn-use-item').innerText === "THÁO ĐỒ" ? "takeoff" : "use";
    Cef.sendEvent("inventory_action", JSON.stringify([action, selectedItem.id]));
    closeActionMenu();
};

document.getElementById('btn-info-item').onclick = () => {
    document.getElementById('info-item-title').innerText = selectedItem.name;
    document.getElementById('info-item-desc').innerText = selectedItem.desc || "Không có mô tả.";
    document.getElementById('item-info-modal').classList.remove('hidden');
};

document.getElementById('btn-drop-item').onclick = () => { 
    Cef.sendEvent("inventory_action", JSON.stringify(["drop", selectedItem.id])); 
    closeActionMenu(); 
};

document.getElementById('btn-close-action').onclick = closeActionMenu;
document.getElementById('btn-close-info').onclick = closeInfoMenu;

/* ================= HUD STATUS ================= */
function updatePlayerStatus(eventData) {
    const data = JSON.parse(eventData);
    document.getElementById('food-fill').style.width = data[0] + '%';
    document.getElementById('food-text').innerText = data[0] + '%';
    document.getElementById('water-fill').style.width = data[1] + '%';
    document.getElementById('water-text').innerText = data[1] + '%';
    const overlay = document.getElementById('screen-effect-overlay');
    if (data[0] <= 15 || data[1] <= 15) overlay.classList.add('vignette-danger'); 
    else overlay.classList.remove('vignette-danger');
}

/* ================= EVENT REGISTRATION ================= */
Cef.registerEventCallback("inventory_show", "renderInventory");
Cef.registerEventCallback("alert_show", "showAlert");
Cef.registerEventCallback("notification_show", "showNotification");
Cef.registerEventCallback("hud_update", "updatePlayerStatus");
