document.addEventListener('DOMContentLoaded', () => {
    // ==========================================================================
    // 1. STATE & CONSTANTS
    // ==========================================================================
    const TARGET_DATE = new Date('2026-12-12T18:00:00');
    const STORAGE_KEY = 'christian_party_rsvps';
    const CONFIG_KEY = 'christian_party_config';

    // ==========================================================================
    // WICHTIG: TRAGE HIER DEINE GOOGLE APPS SCRIPT WEB-APP URL EIN:
    // ==========================================================================
    const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbx5GdcF6v2FYFs-tPwvrG-vfxjoHO_-jJz9Q-6H5eS9x3g1tj95D9TI9l-BpIcxolVIfg/exec'; 

    let rsvps = [];
    let config = {
        googleSheetUrl: ''
    };

    function getGoogleSheetUrl() {
        return GOOGLE_SHEET_URL || config.googleSheetUrl || '';
    }

    // Load initial data
    loadLocalRSVPs();
    loadConfig();

    // ==========================================================================
    // 2. DOM ELEMENTS
    // ==========================================================================
    // Countdown
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    // RSVP Form & Flow
    const rsvpForm = document.getElementById('rsvp-form');
    const statusAccept = document.getElementById('status-accept');
    const statusDecline = document.getElementById('status-decline');
    const successOverlay = document.getElementById('success-message');
    const successCloseBtn = document.getElementById('success-close-btn');
    const submitBtn = document.getElementById('submit-rsvp');

    // Modals
    const adminTriggerBtn = document.getElementById('admin-trigger-btn');
    const adminLoginModal = document.getElementById('admin-login-modal');
    const loginCloseBtn = document.getElementById('login-close-btn');
    const adminLoginForm = document.getElementById('admin-login-form');
    const adminPasswordInput = document.getElementById('admin-password');
    const togglePwBtn = document.getElementById('toggle-pw-btn');
    const loginErrorMsg = document.getElementById('login-error-msg');

    const adminDashboardModal = document.getElementById('admin-dashboard-modal');
    const dashboardCloseBtn = document.getElementById('dashboard-close-btn');
    const adminLogoutBtn = document.getElementById('admin-logout-btn');

    // Admin Dashboard Elements
    const statsYesCount = document.getElementById('stats-yes-count');
    const statsNoCount = document.getElementById('stats-no-count');
    const statsTotalCount = document.getElementById('stats-total-count');

    
    // Connection Settings
    const googleSheetUrlInput = document.getElementById('google-sheet-url');
    const saveUrlBtn = document.getElementById('save-url-btn');
    const connectionStatusBadge = document.getElementById('connection-status-badge');
    const guideToggleBtn = document.getElementById('guide-toggle-btn');
    const sheetsGuidePanel = document.getElementById('sheets-guide-panel');
    const demoDataBtn = document.getElementById('demo-data-btn');

    // Guest Table
    const guestSearch = document.getElementById('guest-search');
    const statusFilter = document.getElementById('status-filter');
    const exportExcelBtn = document.getElementById('export-excel-btn');
    const clearAllBtn = document.getElementById('clear-all-btn');
    const guestTableBody = document.getElementById('guest-table-body');

    // ==========================================================================
    // 3. CANVAS SNOW SIMULATION
    // ==========================================================================
    const canvas = document.getElementById('snow-canvas');
    const ctx = canvas.getContext('2d');
    
    let flakes = [];
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    let mouseX = width / 2;

    class Flake {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * -height; // Start above viewport
            this.size = Math.random() * 3 + 1; // 1px to 4px
            this.speed = Math.random() * 0.6 + 0.2; // Slower, organic descent speed
            this.velX = Math.random() * 0.4 - 0.2; // Gentler horizontal drift
            this.opacity = Math.random() * 0.5 + 0.15;
        }

        update() {
            this.y += this.speed;
            
            // Adjust drift slightly based on mouse position (wind effect)
            const wind = (mouseX - width / 2) / (width / 2) * 0.5;
            this.x += this.velX + wind;

            // Loop flakes when they hit bottom or sides
            if (this.y > height) {
                this.reset();
                this.y = 0;
            }
            if (this.x < 0) {
                this.x = width;
            } else if (this.x > width) {
                this.x = 0;
            }
        }

        draw() {
            ctx.beginPath();
            ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function initSnow() {
        const flakeCount = Math.min(120, Math.floor(width / 8)); // Adaptive particle count
        flakes = [];
        for (let i = 0; i < flakeCount; i++) {
            flakes.push(new Flake());
            // Pre-populate vertical distribution so it starts already snowy
            flakes[i].y = Math.random() * height;
        }
    }

    function animateSnow() {
        ctx.clearRect(0, 0, width, height);
        flakes.forEach(flake => {
            flake.update();
            flake.draw();
        });
        requestAnimationFrame(animateSnow);
    }

    // Resize handling
    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        initSnow();
    });

    // Track mouse movement for wind
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
    });

    initSnow();
    animateSnow();

    // ==========================================================================
    // 4. COUNTDOWN TIMER
    // ==========================================================================
    function updateCountdown() {
        const now = new Date();
        const difference = TARGET_DATE - now;

        if (difference <= 0) {
            // Party has started!
            daysEl.textContent = "00";
            hoursEl.textContent = "00";
            minutesEl.textContent = "00";
            secondsEl.textContent = "00";
            
            const countdownContainer = document.getElementById('countdown');
            if (countdownContainer) {
                countdownContainer.style.borderColor = 'var(--color-success)';
            }
            return;
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        daysEl.textContent = String(days).padStart(2, '0');
        hoursEl.textContent = String(hours).padStart(2, '0');
        minutesEl.textContent = String(minutes).padStart(2, '0');
        secondsEl.textContent = String(seconds).padStart(2, '0');
    }

    // Run immediately and then start interval
    updateCountdown();
    setInterval(updateCountdown, 1000);



    // Handle Form Submission
    rsvpForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 1. Gather values
        const name = document.getElementById('guest-name').value.trim();
        const status = document.querySelector('input[name="status"]:checked').value;
        const message = document.getElementById('guest-message').value.trim();

        if (!name) {
            alert('Bitte trage deinen Namen ein.');
            return;
        }

        // Show loading state
        submitBtn.classList.add('loading');

        // Create response object
        const rsvpData = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
            name: name,
            status: status,
            message: message,
            timestamp: new Date().toISOString()
        };

        let remoteSuccess = false;

        // 2. Try sending to Google Sheets (if URL configured)
        const sheetUrl = getGoogleSheetUrl();
        if (sheetUrl) {
            try {
                // Using standard fetch with mode no-cors for simple Google Web Apps
                await fetch(sheetUrl, {
                    method: 'POST',
                    mode: 'no-cors',
                    cache: 'no-cache',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(rsvpData)
                });
                remoteSuccess = true;
            } catch (error) {
                console.error('Fehler beim Senden an Google Sheets:', error);
                // We proceed to save locally as fall back
            }
        }

        // 3. Save locally as backup / default mode
        saveRSVPLocally(rsvpData);

        // Slow down loading state slightly for premium micro-experience
        setTimeout(() => {
            submitBtn.classList.remove('loading');
            
            // Show Success Overlay
            if (status === 'Zusage') {
                document.getElementById('success-text').innerHTML = `Super, wir haben deine Zusage gespeichert! 🎿🍻`;
            } else {
                document.getElementById('success-text').innerHTML = `Schade, dass du nicht dabei sein kannst! Wir haben deine Absage eingetragen. ❄️`;
            }
            
            successOverlay.classList.add('active');
            
            // Trigger background animation or page scroll
            document.getElementById('rsvp-anchor').scrollIntoView({ behavior: 'smooth' });
        }, 800);
    });

    // Reset Form / close success panel
    successCloseBtn.addEventListener('click', () => {
        successOverlay.classList.remove('active');
        rsvpForm.reset();
        // Scroll slightly back up
        document.getElementById('rsvp-anchor').scrollIntoView({ behavior: 'smooth' });
    });

    // ==========================================================================
    // 6. ADMIN SYSTEM & PASSWORD LOGIN
    // ==========================================================================
    
    // Toggle Password Visibility
    togglePwBtn.addEventListener('click', () => {
        const type = adminPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        adminPasswordInput.setAttribute('type', type);
        
        const eyeIcon = togglePwBtn.querySelector('i');
        if (type === 'text') {
            eyeIcon.className = 'fa-solid fa-eye-slash';
        } else {
            eyeIcon.className = 'fa-solid fa-eye';
        }
    });

    // Open Login Modal
    adminTriggerBtn.addEventListener('click', () => {
        adminPasswordInput.value = '';
        loginErrorMsg.style.display = 'none';
        adminPasswordInput.setAttribute('type', 'password');
        togglePwBtn.querySelector('i').className = 'fa-solid fa-eye';
        adminLoginModal.classList.add('active');
    });

    // Close Login Modal
    loginCloseBtn.addEventListener('click', () => {
        adminLoginModal.classList.remove('active');
    });

    // Handle Login Form Submit
    adminLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const password = adminPasswordInput.value;

        if (password === 'Christian') {
            // Password Correct!
            adminLoginModal.classList.remove('active');
            openAdminDashboard();
        } else {
            // Invalid Password
            loginErrorMsg.style.display = 'flex';
            adminPasswordInput.value = '';
            adminPasswordInput.focus();
        }
    });

    // Close Dashboard Modal
    dashboardCloseBtn.addEventListener('click', () => {
        adminDashboardModal.classList.remove('active');
    });

    // Logout
    adminLogoutBtn.addEventListener('click', () => {
        adminDashboardModal.classList.remove('active');
    });

    // Toggle guide panel
    guideToggleBtn.addEventListener('click', () => {
        sheetsGuidePanel.classList.toggle('active');
        if (sheetsGuidePanel.classList.contains('active')) {
            guideToggleBtn.innerHTML = '<i class="fa-solid fa-book-open"></i> Anleitung schließen';
            // Scroll to the guide smoothly
            sheetsGuidePanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            guideToggleBtn.innerHTML = '<i class="fa-solid fa-book"></i> Google Sheets Anleitung anzeigen';
        }
    });

    // Save Google Webhook URL
    saveUrlBtn.addEventListener('click', () => {
        const url = googleSheetUrlInput.value.trim();
        config.googleSheetUrl = url;
        saveConfig();
        
        updateConnectionStatus();
        alert('Google Sheets URL wurde gespeichert!');
        
        // Fetch new data if URL is added
        if (url) {
            fetchRemoteRSVPs();
        }
    });

    // Close Modals on clicking background overlay
    window.addEventListener('click', (e) => {
        if (e.target === adminLoginModal) {
            adminLoginModal.classList.remove('active');
        }
        if (e.target === adminDashboardModal) {
            adminDashboardModal.classList.remove('active');
        }
    });

    // ==========================================================================
    // 7. ADMIN DASHBOARD METRICS & TABLE
    // ==========================================================================
    async function openAdminDashboard() {
        adminDashboardModal.classList.add('active');
        
        // Pre-fill configured values
        if (GOOGLE_SHEET_URL) {
            googleSheetUrlInput.value = GOOGLE_SHEET_URL;
            googleSheetUrlInput.disabled = true;
            saveUrlBtn.disabled = true;
            saveUrlBtn.innerHTML = '<i class="fa-solid fa-code"></i> Im Quellcode aktiv';
        } else {
            googleSheetUrlInput.value = config.googleSheetUrl || '';
            googleSheetUrlInput.disabled = false;
            saveUrlBtn.disabled = false;
            saveUrlBtn.innerHTML = 'Speichern';
        }
        updateConnectionStatus();

        // Load lists
        if (getGoogleSheetUrl()) {
            await fetchRemoteRSVPs();
        } else {
            loadLocalRSVPs();
            renderDashboard();
        }
    }

    function updateConnectionStatus() {
        if (GOOGLE_SHEET_URL) {
            connectionStatusBadge.className = 'badge badge-live';
            connectionStatusBadge.innerHTML = '<i class="fa-solid fa-code"></i> Google Sheets (Quellcode)';
        } else if (config.googleSheetUrl) {
            connectionStatusBadge.className = 'badge badge-live';
            connectionStatusBadge.innerHTML = '<i class="fa-solid fa-wifi"></i> Google Sheets (Browser-Test)';
        } else {
            connectionStatusBadge.className = 'badge badge-local';
            connectionStatusBadge.innerHTML = '<i class="fa-solid fa-database"></i> Lokaler Speicher';
        }
    }

    // Render stats and guests table
    function renderDashboard() {
        // 1. General Metrics
        const total = rsvps.length;
        const yesCount = rsvps.filter(r => r.status === 'Zusage').length;
        const noCount = rsvps.filter(r => r.status === 'Absage').length;

        statsTotalCount.textContent = total;
        statsYesCount.textContent = yesCount;
        statsNoCount.textContent = noCount;

        // 2. Guest list table population
        renderGuestTable();
    }



    function renderGuestTable() {
        const query = guestSearch.value.toLowerCase().trim();
        const filterVal = statusFilter.value;

        // Filter RSVPs
        const filteredRSVPs = rsvps.filter(r => {
            const matchesSearch = r.name.toLowerCase().includes(query) || (r.message && r.message.toLowerCase().includes(query));
            const matchesFilter = filterVal === 'all' || r.status === filterVal;
            return matchesSearch && matchesFilter;
        });

        guestTableBody.innerHTML = '';

        if (filteredRSVPs.length === 0) {
            guestTableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="no-data-text">Keine passenden Einträge gefunden.</td>
                </tr>
            `;
            return;
        }

        // Sort: newest first
        filteredRSVPs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        filteredRSVPs.forEach(rsvp => {
            const formattedDate = new Date(rsvp.timestamp).toLocaleDateString('de-DE', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            const trHtml = `
                <tr>
                    <td><strong>${escapeHTML(rsvp.name)}</strong></td>
                    <td>
                        <span class="badge-status ${rsvp.status === 'Zusage' ? 'badge-accept' : 'badge-decline'}">
                            ${rsvp.status === 'Zusage' ? '🎿 Zusage' : '❄️ Absage'}
                        </span>
                    </td>
                    <td class="small-text" style="max-width: 250px; white-space: normal; word-break: break-word;">
                        ${rsvp.message ? escapeHTML(rsvp.message) : '<span style="opacity:0.4;">Keine</span>'}
                    </td>
                    <td class="small-text">${formattedDate}</td>
                    <td>
                        <button class="table-action-btn delete-rsvp-btn" data-id="${rsvp.id}" title="Eintrag löschen">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </td>
                </tr>
            `;
            guestTableBody.insertAdjacentHTML('beforeend', trHtml);
        });

        // Attach action handlers to delete buttons
        document.querySelectorAll('.delete-rsvp-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = btn.getAttribute('data-id');
                const rsvpItem = rsvps.find(r => r.id === id);
                if (rsvpItem && confirm(`Möchtest du die Rückmeldung von "${rsvpItem.name}" wirklich löschen?`)) {
                    deleteRSVP(id);
                }
            });
        });
    }

    // Interactive filters
    guestSearch.addEventListener('input', renderGuestTable);
    statusFilter.addEventListener('change', renderGuestTable);

    // Escape script inputs to prevent XSS
    function escapeHTML(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // ==========================================================================
    // 8. DATA CRUD OPERATIONS & SYNC
    // ==========================================================================
    
    function loadLocalRSVPs() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                rsvps = JSON.parse(stored);
            } catch (e) {
                console.error("Fehler beim Parsen der lokalen RSVPs:", e);
                rsvps = [];
            }
        }
    }

    function saveRSVPLocally(rsvpItem) {
        // Check if a guest with the identical name already exists (case-insensitive, trimmed)
        const idx = rsvps.findIndex(r => r.name.toLowerCase().trim() === rsvpItem.name.toLowerCase().trim());
        if (idx > -1) {
            // Keep the original unique ID but update status, message, and timestamp
            rsvpItem.id = rsvps[idx].id;
            rsvps[idx] = rsvpItem;
        } else {
            rsvps.push(rsvpItem);
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(rsvps));
    }

    function deleteRSVP(id) {
        rsvps = rsvps.filter(r => r.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(rsvps));
        
        // Note: deleting locally does not delete from Google Sheet automatically due to CORS limitation,
        // but it cleans the browser cache/UI immediately.
        renderDashboard();
    }

    // Fetch from Google sheets if connected
    async function fetchRemoteRSVPs() {
        const sheetUrl = getGoogleSheetUrl();
        if (!sheetUrl) return;

        try {
            const response = await fetch(sheetUrl);
            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data)) {
                    // Normalize fetched data IDs
                    rsvps = data.map((item, idx) => ({
                        id: item.id || `row-${idx}`,
                        name: item.name || '',
                        status: item.status || 'Zusage',
                        message: item.message || '',
                        timestamp: item.timestamp || new Date().toISOString()
                    }));
                    // Save local copy as backup
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(rsvps));
                    renderDashboard();
                    return;
                }
            }
        } catch (error) {
            console.error('Fehler beim Abrufen der Live-Daten:', error);
            // Fall back to local data
            loadLocalRSVPs();
            renderDashboard();
        }
    }

    function loadConfig() {
        const stored = localStorage.getItem(CONFIG_KEY);
        if (stored) {
            try {
                config = JSON.parse(stored);
            } catch (e) {
                console.error("Config konnte nicht geladen werden.");
            }
        }
    }

    function saveConfig() {
        localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    }

    // ==========================================================================
    // 9. EXPORTS, DEMO DATA & MANAGEMENT
    // ==========================================================================
    
    // Load Demo Data for test purposes
    demoDataBtn.addEventListener('click', () => {
        if (rsvps.length > 0 && !confirm('Die aktuellen Einträge werden überschrieben. Möchtest du fortfahren?')) {
            return;
        }

        const demoGuests = [
            {
                id: 'demo-1',
                name: 'Stefan Kowalski',
                status: 'Zusage',
                message: 'Alles Gute, alter Hüttenfreund! Freue mich riesig auf die Piste ⛷️🍻',
                timestamp: new Date(Date.now() - 4 * 3600000).toISOString()
            },
            {
                id: 'demo-2',
                name: 'Sabine & Peter Müller',
                status: 'Zusage',
                message: 'Wir bringen mega gute Laune mit! ❄️ Bis im Dezember!',
                timestamp: new Date(Date.now() - 12 * 3600000).toISOString()
            },
            {
                id: 'demo-3',
                name: 'Thomas Schmidt',
                status: 'Absage',
                message: 'Wäre super gerne gekommen, bin da aber leider beruflich in den Alpen im echten Schnee. Prost Christian!',
                timestamp: new Date(Date.now() - 24 * 3600000).toISOString()
            },
            {
                id: 'demo-4',
                name: 'Anna Schneider',
                status: 'Zusage',
                message: 'Auf die nächsten 60 Jahre! Ein Willi geht immer 🥃',
                timestamp: new Date(Date.now() - 36 * 3600000).toISOString()
            },
            {
                id: 'demo-5',
                name: 'Jürgen Lehmann',
                status: 'Zusage',
                message: 'Die besten Hüttenabende sind legendär! Christian, mach den Jagertee schon mal warm!',
                timestamp: new Date(Date.now() - 48 * 3600000).toISOString()
            }
        ];

        rsvps = demoGuests;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(rsvps));
        renderDashboard();
        alert('5 Aprés-Ski Testdaten erfolgreich geladen!');
    });

    // Clear All
    clearAllBtn.addEventListener('click', () => {
        if (confirm('Bist du absolut sicher, dass du alle Einträge unwiderruflich löschen möchtest?')) {
            if (confirm('Wirklich alle Gästedaten unwiderruflich aus dem Speicher entfernen?')) {
                rsvps = [];
                localStorage.setItem(STORAGE_KEY, JSON.stringify(rsvps));
                renderDashboard();
                alert('Alle Einträge gelöscht.');
            }
        }
    });

    // Export to Excel-compatible CSV file (German Standard)
    exportExcelBtn.addEventListener('click', () => {
        if (rsvps.length === 0) {
            alert('Keine Daten zum Exportieren vorhanden.');
            return;
        }

        // CSV Header with semicolon separator for German Excel
        let csvContent = "Name;Status;Nachricht;Anmeldedatum\r\n";

        rsvps.forEach(rsvp => {
            const formattedDate = new Date(rsvp.timestamp).toLocaleString('de-DE');
            
            // Clean strings from semi-colons and double quotes to prevent CSV break
            const name = (rsvp.name || '').replace(/;/g, ',').replace(/"/g, '""');
            const status = (rsvp.status || '');
            const msg = (rsvp.message || '').replace(/;/g, ',').replace(/\r?\n|\r/g, ' ').replace(/"/g, '""');

            csvContent += `"${name}";"${status}";"${msg}";"${formattedDate}"\r\n`;
        });

        // Add UTF-8 Byte Order Mark (BOM) to force Excel to read German Umlaute (ä, ö, ü) correctly
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `Gaesteliste_Christians_60_Geburtstag.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    });
});
