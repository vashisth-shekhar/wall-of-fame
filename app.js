const HARD_LOCK = false;
const HR_PASSWORD = 'Paysprint123';

let IS_HR = (function() { try { return sessionStorage.getItem('wof_hr') === 'true'; } catch(e) { return false; } })();
const STORAGE_KEY_DATA   = 'wof_awards';
const STORAGE_KEY_LOCKED = 'wof_locked';

let trophyClickCount = 0;
let trophyClickTimer = null;

function handleTrophyClick() {
    trophyClickCount++;
    clearTimeout(trophyClickTimer);
    if (trophyClickCount >= 3) {
        trophyClickCount = 0;
        if (IS_HR) {
            if (confirm('Exit HR mode?')) {
                IS_HR = false;
                try { sessionStorage.removeItem('wof_hr'); } catch(e) {}
                applyLockUI();
                alert('HR mode disabled.');
            }
        } else {
            const pwd = prompt('Enter HR password:');
            if (pwd === HR_PASSWORD) {
                IS_HR = true;
                try { sessionStorage.setItem('wof_hr', 'true'); } catch(e) {}
                applyLockUI();
                alert('HR mode enabled. Use the "Manage Wall" button to make changes.');
            }
        }
    } else {
        trophyClickTimer = setTimeout(function() { trophyClickCount = 0; }, 1000);
    }
}

const DEFAULT_AWARDS = [
    { title: "Associate of the Month",  name: "", achievement: "", photo: "" },
    { title: "Executive of the Month",  name: "", achievement: "", photo: "" },
    { title: "Manager of the Month",    name: "", achievement: "", photo: "" },
    { title: "Team Player Award",        name: "", achievement: "", photo: "" },
    { title: "Innovation Award",         name: "", achievement: "", photo: "" },
    { title: "Leadership Excellence",    name: "", achievement: "", photo: "" }
];

function loadAwards() {
    try {
        var saved = localStorage.getItem(STORAGE_KEY_DATA);
        return saved ? JSON.parse(saved) : DEFAULT_AWARDS.map(function(a) { return Object.assign({}, a); });
    } catch(e) { return DEFAULT_AWARDS.map(function(a) { return Object.assign({}, a); }); }
}

function saveAwards() {
    try { localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(awards)); } catch(e) {}
}

function loadLocked() {
    try { return localStorage.getItem(STORAGE_KEY_LOCKED) === 'true'; } catch(e) { return false; }
}

function saveLocked(val) {
    try { localStorage.setItem(STORAGE_KEY_LOCKED, val ? 'true' : 'false'); } catch(e) {}
}

var awards = loadAwards();
var isLocked = HARD_LOCK || loadLocked();
var currentEditIndex = null;

function createStars() {
    var container = document.getElementById('stars');
    for (var i = 0; i < 100; i++) {
        var star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top  = Math.random() * 100 + '%';
        container.appendChild(star);
    }
}

function renderAwards() {
    var grid = document.getElementById('awardsGrid');
    grid.innerHTML = '';
    awards.forEach(function(award) {
        var card = document.createElement('div');
        card.className = 'award-card';
        var photoHtml = award.photo
            ? '<img src="' + award.photo + '" alt="' + award.name + '">'
            : '<span class="photo-placeholder">\uD83D\uDC64</span>';
        card.innerHTML =
            '<div class="photo-frame">' + photoHtml + '</div>' +
            '<div class="award-title">' + (award.title || 'Award') + '</div>' +
            '<div class="employee-name">' + (award.name || 'No Winner Yet') + '</div>' +
            '<div class="achievement">' + (award.achievement || 'Stay tuned for the next winner!') + '</div>';
        grid.appendChild(card);
    });
}

function applyLockUI() {
    var badge   = document.getElementById('lockStatusBadge');
    var banner  = document.getElementById('lockedBanner');
    var hrBtn   = document.getElementById('hrPanelBtn');
    var hrBadge = document.getElementById('hrModeBadge');

    if (IS_HR && !HARD_LOCK) {
        hrBtn.style.display   = 'block';
        hrBadge.style.display = 'block';
        badge.style.display   = 'block';
    } else {
        hrBtn.style.display   = 'none';
        hrBadge.style.display = 'none';
        badge.style.display   = 'none';
    }

    if (isLocked) {
        banner.style.display = 'block';
        badge.textContent    = 'Published (Locked)';
        badge.className      = 'lock-status-badge locked';
    } else {
        banner.style.display = 'none';
        badge.textContent    = 'Edit Mode Active';
        badge.className      = 'lock-status-badge unlocked';
    }
}

function openHrPanel() {
    if (!IS_HR) return;
    renderSlotList();
    updateLockPanelUI();
    document.getElementById('hrPanelModal').classList.add('active');
}

function closeHrPanel() {
    document.getElementById('hrPanelModal').classList.remove('active');
}

function updateLockPanelUI() {
    var lockBtn   = document.getElementById('lockBtn');
    var unlockBtn = document.getElementById('unlockBtn');
    var infoText  = document.getElementById('lockInfoText');

    if (HARD_LOCK) {
        lockBtn.style.display   = 'none';
        unlockBtn.style.display = 'none';
        infoText.textContent    = 'The wall is permanently locked.';
        return;
    }

    if (isLocked) {
        lockBtn.style.display   = 'none';
        unlockBtn.style.display = 'block';
        infoText.innerHTML      = 'Status: Published & Locked. Click Unlock to make changes.';
    } else {
        lockBtn.style.display   = 'block';
        unlockBtn.style.display = 'none';
        infoText.innerHTML      = 'Status: Edit Mode Active. Click Publish & Lock when done.';
    }
}

function renderSlotList() {
    var list = document.getElementById('slotList');
    list.innerHTML = '';
    document.getElementById('slotCountBadge').textContent = awards.length + ' slot' + (awards.length !== 1 ? 's' : '');

    awards.forEach(function(award, index) {
        var item = document.createElement('div');
        item.className = 'slot-item';
        var photoHtml = award.photo
            ? '<img src="' + award.photo + '" alt="' + award.name + '">'
            : '\uD83D\uDC64';
        item.innerHTML =
            '<div class="slot-item-photo">' + photoHtml + '</div>' +
            '<div class="slot-item-info">' +
                '<div class="slot-item-title">' + (award.title || 'Untitled') + '</div>' +
                '<div class="slot-item-name">' + (award.name || 'No winner yet') + '</div>' +
            '</div>' +
            '<div class="slot-item-actions">' +
                '<button class="icon-btn edit" onclick="openEditModal(' + index + ')">Edit</button>' +
                '<button class="icon-btn remove" onclick="removeSlot(' + index + ')">Remove</button>' +
            '</div>';
        list.appendChild(item);
    });
}

function addSlots() {
    var count = parseInt(document.getElementById('bulkCount').value, 10);
    for (var i = 0; i < count; i++) {
        awards.push({ title: "New Award", name: "", achievement: "", photo: "" });
    }
    saveAwards();
    renderAwards();
    renderSlotList();
}

function removeSlot(index) {
    if (awards.length <= 1) { alert('At least one slot must remain.'); return; }
    if (!confirm('Remove "' + (awards[index].title || 'this award') + '"?')) return;
    awards.splice(index, 1);
    saveAwards();
    renderAwards();
    renderSlotList();
}

function openEditModal(index) {
    if (!IS_HR) return;
    currentEditIndex = index;
    var award = awards[index];
    document.getElementById('editTitle').value       = award.title;
    document.getElementById('editName').value        = award.name;
    document.getElementById('editAchievement').value = award.achievement;
    document.getElementById('editPhotoUrl').value    = award.photo;
    document.getElementById('editModal').classList.add('active');
}

function closeEditModal() {
    document.getElementById('editModal').classList.remove('active');
    document.getElementById('editTitle').value       = '';
    document.getElementById('editName').value        = '';
    document.getElementById('editAchievement').value = '';
    document.getElementById('editPhotoUrl').value    = '';
    document.getElementById('editPhoto').value       = '';
}

function handlePhotoUpload(event) {
    var file = event.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(e) { document.getElementById('editPhotoUrl').value = e.target.result; };
    reader.readAsDataURL(file);
}

function saveEdit() {
    var title = document.getElementById('editTitle').value.trim();
    if (!title) { alert('Award Title is required.'); return; }
    awards[currentEditIndex] = {
        title:       title,
        name:        document.getElementById('editName').value.trim(),
        achievement: document.getElementById('editAchievement').value.trim(),
        photo:       document.getElementById('editPhotoUrl').value.trim()
    };
    saveAwards();
    renderAwards();
    renderSlotList();
    closeEditModal();
}

function publishAndLock() {
    if (!confirm('Publish & Lock the Wall of Fame?')) return;
    isLocked = true;
    saveLocked(true);
    applyLockUI();
    updateLockPanelUI();
    document.getElementById('hrPanelBtn').style.display = 'none';
    alert('Wall of Fame is now Published & Locked!');
}

function unlockForEditing() {
    if (!confirm('Unlock the Wall of Fame for editing?')) return;
    isLocked = false;
    saveLocked(false);
    applyLockUI();
    updateLockPanelUI();
    document.getElementById('hrPanelBtn').style.display = 'block';
    alert('Wall of Fame is now Unlocked.');
}

document.addEventListener('DOMContentLoaded', function() {
    ['hrPanelModal', 'editModal'].forEach(function(id) {
        document.getElementById(id).addEventListener('click', function(e) {
            if (e.target === this) {
                id === 'hrPanelModal' ? closeHrPanel() : closeEditModal();
            }
        });
    });
    createStars();
    renderAwards();
    applyLockUI();
});
