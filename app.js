/**
 * Home Automation System IoT Home Automation Simulation Controller
 * Author: Antigravity AI
 * Year: 2026
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- STATE INITIALIZATION ---
    let state = {
        settings: {
            userName: "Alex Rivera",
            tempUnit: "F", // F or C
            notifications: true,
            simDrift: true
        },
        securityMode: "disarmed", // disarmed, armed-home, armed-away, panic
        currentTab: "dashboard",
        schedules: [
            {
                id: 1,
                name: "Sprinkler Morning Cycle",
                time: "06:30",
                routine: "sprinkler-on",
                days: [1, 3, 5],
                active: true
            },
            {
                id: 2,
                name: "Auto Arm Night Mode",
                time: "23:00",
                routine: "good-night",
                days: [0, 1, 2, 3, 4, 5, 6],
                active: true
            }
        ],
        devices: [
            // Living Room
            { id: "living-light", name: "Main Chandelier", room: "living-room", type: "lighting", power: 45, status: true, value: 80, color: "#fef08a" },
            { id: "living-tv", name: "Smart TV 65\"", room: "living-room", type: "appliance", power: 120, status: false, value: 25 },
            { id: "living-ac", name: "Climate AC", room: "living-room", type: "climate", power: 950, status: true, value: 72, mode: "cool" },
            { id: "living-lock", name: "Front Door Lock", room: "living-room", type: "security", power: 2, status: true },
            
            // Kitchen
            { id: "kitchen-light", name: "Ceiling LED Panel", room: "kitchen", type: "lighting", power: 30, status: false, value: 100, color: "#ffffff" },
            { id: "kitchen-fridge", name: "Smart Refrigerator", room: "kitchen", type: "appliance", power: 150, status: true, value: 37 },
            { id: "kitchen-oven", name: "Convection Oven", room: "kitchen", type: "appliance", power: 2200, status: false, value: 350 },
            { id: "kitchen-coffee", name: "Espresso Maker", room: "kitchen", type: "appliance", power: 850, status: false, value: "medium" },

            // Bedroom
            { id: "bedroom-light", name: "Bedside Lamp", room: "bedroom", type: "lighting", power: 15, status: true, value: 30, color: "#fed7aa" },
            { id: "bedroom-ac", name: "Split AC", room: "bedroom", type: "climate", power: 750, status: false, value: 68, mode: "cool" },
            { id: "bedroom-humidifier", name: "Humidifier", room: "bedroom", type: "appliance", power: 35, status: false, value: 45 },
            
            // Bathroom
            { id: "bathroom-light", name: "Vanity Mirror Light", room: "bathroom", type: "lighting", power: 25, status: false, value: 75, color: "#ffffff" },
            { id: "bathroom-fan", name: "Exhaust Fan", room: "bathroom", type: "appliance", power: 40, status: false },

            // Backyard & Outdoor
            { id: "outdoor-light", name: "Patio Floodlights", room: "outdoor", type: "lighting", power: 65, status: false, value: 100, color: "#ffffff" },
            { id: "outdoor-sprinkler", name: "Lawn Sprinklers", room: "outdoor", type: "appliance", power: 80, status: false },
            { id: "outdoor-gate", name: "Driveway Gate Lock", room: "outdoor", type: "security", power: 5, status: true }
        ],
        logs: [
            { time: "10:45:02 AM", type: "info", message: "Home Automation System UI initialized successfully." },
            { time: "10:45:10 AM", type: "success", message: "Front Door Lock securely locked by System." },
            { time: "10:46:15 AM", type: "info", message: "Eco-Mode optimization applied to Living Room AC." }
        ],
        powerHistory: [380, 420, 395, 410, 385, 400, 370, 390, 405, 380], // Last 10 readings
        tempDriftVal: 72.4
    };

    // Load state from LocalStorage if it exists
    const savedState = localStorage.getItem('home_automation_state');
    if (savedState) {
        try {
            const parsed = JSON.parse(savedState);
            if (parsed.devices && parsed.settings && parsed.schedules) {
                state = { ...state, ...parsed };
            }
        } catch (e) {
            console.error("Error loading localStorage state:", e);
        }
    }

    // --- DOM REFERENCES ---
    const navItems = document.querySelectorAll('.nav-item');
    const viewPanels = document.querySelectorAll('.view-panel');
    const logsContainer = document.getElementById('log-list');
    const devicesGrid = document.getElementById('devices-grid');
    const timeDisplay = document.getElementById('current-time');
    const dateDisplay = document.getElementById('current-date');
    const welcomeHeader = document.getElementById('main-heading');
    
    // Quick Dashboard Stats
    const statPowerVal = document.getElementById('stat-power-demand');
    const statActiveVal = document.getElementById('stat-active-devices');
    const statAvgTemp = document.getElementById('stat-avg-temp');
    const statSecurityVal = document.getElementById('stat-security-status');
    const statLockCount = document.getElementById('stat-lock-count');
    const statPowerTrend = document.getElementById('stat-power-trend');
    const statAcStatus = document.getElementById('stat-ac-status');

    // House Mode Buttons
    const modeButtons = document.querySelectorAll('.mode-btn');

    // Quick Controls Buttons
    const btnQuickLights = document.getElementById('btn-quick-lights');
    const btnQuickHvac = document.getElementById('btn-quick-hvac');
    const btnQuickLocks = document.getElementById('btn-quick-locks');
    const btnQuickSprinkler = document.getElementById('btn-quick-sprinkler');

    // Security Panel
    const shieldLarge = document.getElementById('security-shield-large');
    const shieldIconLarge = document.getElementById('shield-icon-large');
    const shieldStatusText = document.getElementById('shield-status-text');
    const btnDisarm = document.getElementById('btn-security-disarm');
    const btnArmHome = document.getElementById('btn-security-arm-home');
    const btnArmAway = document.getElementById('btn-security-arm-away');
    const btnPanic = document.getElementById('btn-panic-trigger');

    // Schedules Form
    const scheduleForm = document.getElementById('routine-schedule-form');
    const schedulesList = document.getElementById('schedules-list');

    // Settings Modal
    const modalSettings = document.getElementById('modal-settings');
    const triggerSettings = document.getElementById('btn-settings-trigger');
    const closeSettings = document.getElementById('btn-close-settings');
    const saveSettings = document.getElementById('btn-save-settings');
    const resetSettings = document.getElementById('btn-reset-settings');
    
    // Settings inputs
    const inputUserName = document.getElementById('input-user-name');
    const selectTempUnit = document.getElementById('select-temp-unit');
    const checkAlertNotifs = document.getElementById('check-alert-notifications');
    const checkSimDrift = document.getElementById('check-sim-drift');

    // --- CHARTS OBJECTS ---
    let liveEnergyChart = null;
    let roomsEnergyChart = null;
    let categoryEnergyChart = null;

    // --- HELPER FUNCTIONS ---
    function saveToStorage() {
        localStorage.setItem('home_automation_state', JSON.stringify({
            settings: state.settings,
            securityMode: state.securityMode,
            schedules: state.schedules,
            devices: state.devices,
            logs: state.logs
        }));
    }

    function addLog(message, type = "info") {
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        state.logs.unshift({ time: timeStr, type, message });
        
        // Limit logs size
        if (state.logs.length > 50) state.logs.pop();
        
        renderLogs();
        saveToStorage();
    }

    function renderLogs() {
        if (!logsContainer) return;
        logsContainer.innerHTML = '';
        state.logs.forEach(log => {
            const entry = document.createElement('div');
            entry.className = `log-entry ${log.type}`;
            
            const timeSpan = document.createElement('span');
            timeSpan.className = 'log-time';
            timeSpan.textContent = `[${log.time}]`;
            
            const msgSpan = document.createElement('span');
            msgSpan.className = 'log-msg';
            msgSpan.textContent = log.message;
            
            entry.appendChild(timeSpan);
            entry.appendChild(msgSpan);
            logsContainer.appendChild(entry);
        });
    }

    function updateTime() {
        const now = new Date();
        const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
        const dateOptions = { month: 'long', day: 'numeric', year: 'numeric' };
        
        if (timeDisplay) timeDisplay.textContent = now.toLocaleTimeString([], timeOptions);
        if (dateDisplay) dateDisplay.textContent = now.toLocaleDateString('en-US', dateOptions);

        // Check routines scheduler every minute
        if (now.getSeconds() === 0) {
            checkSchedules(now);
        }
    }

    // --- TELEMETRY ENGINE & FLUID LOGIC ---
    function calculatePowerDemand() {
        let total = 0;
        state.devices.forEach(device => {
            if (device.status) {
                if (device.type === 'lighting') {
                    // Dimmer scales power consumption
                    total += Math.round(device.power * (device.value / 100));
                } else if (device.id === 'living-tv') {
                    // TV volume increases consumption slightly
                    total += Math.round(device.power + (device.value * 0.2));
                } else {
                    total += device.power;
                }
            }
        });
        
        // Add random fluctuation (-2W to +2W) to simulate grid noise
        const noise = Math.floor(Math.random() * 5) - 2;
        return Math.max(10, total + noise);
    }

    function getTempString(tempInF) {
        if (state.settings.tempUnit === 'C') {
            const tempInC = (tempInF - 32) * 5 / 9;
            return `${tempInC.toFixed(1)}°C`;
        }
        return `${tempInF.toFixed(1)}°F`;
    }

    function runTelemetryDrift() {
        if (!state.settings.simDrift) return;

        // Climate drift simulation
        const livingAc = state.devices.find(d => d.id === 'living-ac');
        const bedroomAc = state.devices.find(d => d.id === 'bedroom-ac');
        const outdoorTemp = 84; // Fixed outdoor hot day temperature
        
        let targetTemp = 72; // Default baseline temperature if AC is idle
        let activeAcs = 0;
        let acFactor = 0;

        if (livingAc.status) {
            targetTemp = livingAc.value;
            activeAcs++;
        }
        if (bedroomAc.status) {
            targetTemp = bedroomAc.status && livingAc.status 
                ? (livingAc.value + bedroomAc.value) / 2 
                : bedroomAc.value;
            activeAcs++;
        }

        // Simulating the temperature drifting slowly
        // If AC is active, drift towards setpoint fast. If inactive, drift towards outdoor temp slowly.
        const currentTemp = state.tempDriftVal;
        if (activeAcs > 0) {
            const diff = targetTemp - currentTemp;
            // temperature drops/rises toward target
            state.tempDriftVal += diff * 0.05; 
            acFactor = activeAcs;
        } else {
            const diff = outdoorTemp - currentTemp;
            state.tempDriftVal += diff * 0.008; // slow drift upwards
        }

        // Random noise fluctuation (-0.1 to 0.1)
        state.tempDriftVal += (Math.random() * 0.2) - 0.1;

        // Update UI
        if (statAvgTemp) statAvgTemp.textContent = getTempString(state.tempDriftVal);
        
        if (statAcStatus) {
            if (activeAcs > 0) {
                statAcStatus.textContent = `${activeAcs} A/C Active`;
                statAcStatus.className = "stat-subtext text-active";
            } else {
                statAcStatus.textContent = "A/C Idle";
                statAcStatus.className = "stat-subtext";
            }
        }

        // Telemetry log chance
        if (Math.random() < 0.05) {
            const sensorMsgs = [
                "Indoor air quality: Excellent (AQI 32).",
                "Humidity level stable at 46% inside.",
                "Solar panels generating surplus power (+420W).",
                "Smart Fridge compressor cycling: Optimal cooling."
            ];
            const msg = sensorMsgs[Math.floor(Math.random() * sensorMsgs.length)];
            addLog(msg, "info");
        }
    }

    function refreshDashboardStats() {
        const livePower = calculatePowerDemand();
        
        // Update power demand stat
        if (statPowerVal) statPowerVal.textContent = `${livePower} W`;
        
        // Update power history array and chart
        state.powerHistory.push(livePower);
        if (state.powerHistory.length > 12) state.powerHistory.shift();
        
        if (liveEnergyChart) {
            liveEnergyChart.data.datasets[0].data = state.powerHistory;
            liveEnergyChart.update('none'); // fast update without reset transition
        }

        // Active Devices
        const activeCount = state.devices.filter(d => d.status && d.power > 10).length;
        const totalCount = state.devices.length;
        if (statActiveVal) statActiveVal.textContent = `${activeCount} / ${totalCount}`;

        // Locks Count
        const locks = state.devices.filter(d => d.type === 'security');
        const lockedCount = locks.filter(d => d.status === true).length;
        if (statLockCount) statLockCount.textContent = `${lockedCount} of ${locks.length} Engaged`;

        // Eco Trend Status
        const isEco = state.devices.find(d => d.id === 'living-ac').mode === 'eco' || state.securityMode === 'eco';
        if (statPowerTrend) {
            if (isEco || livePower < 200) {
                statPowerTrend.innerHTML = `<i data-lucide="trending-down"></i> Eco Active`;
                statPowerTrend.className = "stat-trend trend-down";
            } else {
                statPowerTrend.innerHTML = `<i data-lucide="trending-up"></i> Peak Power`;
                statPowerTrend.className = "stat-trend text-muted";
            }
            lucide.createIcons(); // refresh trends icon
        }

        // Update Analytics charts if tabs are changed
        updateAnalyticsCharts();
    }

    // --- DOM NAVIGATION ---
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const tabName = item.getAttribute('data-tab');
            switchTab(tabName);
        });
    });

    function switchTab(tabName) {
        state.currentTab = tabName;
        
        // Toggle Nav item active classes
        navItems.forEach(btn => {
            if (btn.getAttribute('data-tab') === tabName) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Toggle View Panels
        viewPanels.forEach(panel => {
            if (panel.id === `view-${tabName}`) {
                panel.classList.add('active');
            } else {
                panel.classList.remove('active');
            }
        });

        // Specific view actions
        if (tabName === 'rooms') {
            renderDevicesGrid();
        } else if (tabName === 'analytics') {
            initAnalyticsCharts();
        } else if (tabName === 'security') {
            initCameraCams();
        }
        
        addLog(`Switched view to ${tabName.toUpperCase()}`, "info");
    }

    // --- ROOMS VIEW & DEVICE CONTROLS ---
    let activeRoomFilter = "all";
    const roomFilters = document.querySelectorAll('.room-filter');
    roomFilters.forEach(filter => {
        filter.addEventListener('click', () => {
            roomFilters.forEach(f => f.classList.remove('active'));
            filter.classList.add('active');
            activeRoomFilter = filter.getAttribute('data-room');
            renderDevicesGrid();
        });
    });

    function renderDevicesGrid() {
        if (!devicesGrid) return;
        devicesGrid.innerHTML = '';

        const filtered = state.devices.filter(d => activeRoomFilter === 'all' || d.room === activeRoomFilter);

        filtered.forEach(device => {
            const card = document.createElement('div');
            card.className = 'device-card glass-card';
            card.setAttribute('data-device-id', device.id);
            card.setAttribute('data-device-type', device.type);

            // Icon class determination
            let typeClass = "";
            let lucideIcon = "power";
            if (device.type === 'lighting') {
                typeClass = "lighting";
                lucideIcon = "lightbulb";
            } else if (device.type === 'climate') {
                typeClass = "climate";
                lucideIcon = "thermometer";
            } else if (device.type === 'appliance') {
                typeClass = "appliance";
                if (device.id.includes('tv')) lucideIcon = "tv";
                else if (device.id.includes('coffee')) lucideIcon = "coffee";
                else if (device.id.includes('fridge')) lucideIcon = "chef-hat";
                else if (device.id.includes('oven')) lucideIcon = "microwave";
                else lucideIcon = "pocket-knife";
            } else if (device.type === 'security') {
                typeClass = "security";
                lucideIcon = device.status ? "lock" : "lock-open";
            }

            const header = document.createElement('div');
            header.className = 'device-card-header';

            const meta = document.createElement('div');
            meta.className = 'device-meta';

            const iconWrapper = document.createElement('div');
            iconWrapper.className = `device-icon-wrapper ${device.status ? 'active' : ''} ${typeClass}`;
            iconWrapper.innerHTML = `<i data-lucide="${lucideIcon}"></i>`;

            const infoText = document.createElement('div');
            infoText.className = 'device-info-text';
            
            const title = document.createElement('h3');
            title.textContent = device.name;

            const roomName = document.createElement('span');
            roomName.className = 'device-room';
            roomName.textContent = device.room.replace('-', ' ');

            infoText.appendChild(title);
            infoText.appendChild(roomName);
            meta.appendChild(iconWrapper);
            meta.appendChild(infoText);

            // Control Toggle
            const toggleLabel = document.createElement('label');
            toggleLabel.className = 'switch-control';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = device.status;
            checkbox.addEventListener('change', (e) => {
                toggleDevice(device.id, e.target.checked);
            });

            const sliderSpan = document.createElement('span');
            sliderSpan.className = 'switch-slider';

            toggleLabel.appendChild(checkbox);
            toggleLabel.appendChild(sliderSpan);
            
            header.appendChild(meta);
            header.appendChild(toggleLabel);
            card.appendChild(header);

            // Extra Controls (Dimmers, Temp adjust, Color picker)
            if (device.status) {
                const controlsBlock = document.createElement('div');
                controlsBlock.className = 'device-controls-block';

                if (device.type === 'lighting') {
                    // Dimmer Slider
                    const sliderRow = document.createElement('div');
                    sliderRow.className = 'control-label-row';
                    sliderRow.innerHTML = `<span>Brightness</span><span class="slider-val">${device.value}%</span>`;
                    
                    const slider = document.createElement('input');
                    slider.type = 'range';
                    slider.className = 'control-slider';
                    slider.min = '10';
                    slider.max = '100';
                    slider.value = device.value;
                    slider.addEventListener('input', (e) => {
                        updateDeviceValue(device.id, parseInt(e.target.value));
                        sliderRow.querySelector('.slider-val').textContent = `${e.target.value}%`;
                    });

                    // Color Picker Row
                    const colorLabel = document.createElement('div');
                    colorLabel.className = 'control-label-row';
                    colorLabel.innerHTML = `<span>Ambient Tone</span>`;

                    const colorPickers = document.createElement('div');
                    colorPickers.className = 'color-picker-row';
                    
                    const colors = [
                        { name: "Warm Light", val: "#fef08a" },
                        { name: "Soft Amber", val: "#fed7aa" },
                        { name: "Ice Blue", val: "#bae6fd" },
                        { name: "Atmosphere Purple", val: "#f472b6" },
                        { name: "Neo Violet", val: "#c084fc" }
                    ];

                    colors.forEach(col => {
                        const dot = document.createElement('div');
                        dot.className = `color-dot ${device.color === col.val ? 'active' : ''}`;
                        dot.style.backgroundColor = col.val;
                        dot.title = col.name;
                        dot.addEventListener('click', () => {
                            updateDeviceColor(device.id, col.val);
                            renderDevicesGrid(); // re-render to update dot active class and style
                        });
                        colorPickers.appendChild(dot);
                    });

                    controlsBlock.appendChild(sliderRow);
                    controlsBlock.appendChild(slider);
                    controlsBlock.appendChild(colorLabel);
                    controlsBlock.appendChild(colorPickers);
                    card.appendChild(controlsBlock);

                    // Add color reflection to icon wrapper
                    iconWrapper.style.color = device.color;
                    iconWrapper.style.boxShadow = `0 0 15px ${device.color}50`;

                } else if (device.type === 'climate') {
                    // Temperature Adjust
                    const tempRow = document.createElement('div');
                    tempRow.className = 'control-label-row';
                    tempRow.innerHTML = `<span>Target Temperature</span><span class="slider-val">${device.value}°${state.settings.tempUnit}</span>`;
                    
                    const slider = document.createElement('input');
                    slider.type = 'range';
                    slider.className = 'control-slider';
                    
                    // Temp boundaries
                    if (state.settings.tempUnit === 'C') {
                        slider.min = '16';
                        slider.max = '28';
                    } else {
                        slider.min = '60';
                        slider.max = '82';
                    }
                    slider.value = device.value;
                    slider.addEventListener('input', (e) => {
                        updateDeviceValue(device.id, parseInt(e.target.value));
                        tempRow.querySelector('.slider-val').textContent = `${e.target.value}°${state.settings.tempUnit}`;
                    });

                    // AC mode selection
                    const modeRow = document.createElement('div');
                    modeRow.className = 'control-label-row';
                    modeRow.innerHTML = `<span>Operational Mode</span><span class="device-status-val text-active">${device.mode.toUpperCase()}</span>`;

                    const modeSelect = document.createElement('div');
                    modeSelect.className = 'color-picker-row';
                    
                    const modes = ["cool", "heat", "eco", "fan"];
                    modes.forEach(mode => {
                        const mBtn = document.createElement('button');
                        mBtn.className = `execute-routine-btn ${device.mode === mode ? 'active-run' : ''}`;
                        mBtn.style.padding = "0.25rem 0.6rem";
                        mBtn.style.fontSize = "0.75rem";
                        mBtn.textContent = mode.toUpperCase();
                        mBtn.addEventListener('click', () => {
                            updateDeviceMode(device.id, mode);
                            renderDevicesGrid();
                        });
                        modeSelect.appendChild(mBtn);
                    });

                    controlsBlock.appendChild(tempRow);
                    controlsBlock.appendChild(slider);
                    controlsBlock.appendChild(modeRow);
                    controlsBlock.appendChild(modeSelect);
                    card.appendChild(controlsBlock);

                } else if (device.id === 'living-tv') {
                    // TV Volume Control
                    const volumeRow = document.createElement('div');
                    volumeRow.className = 'control-label-row';
                    volumeRow.innerHTML = `<span>Speaker Volume</span><span class="slider-val">Vol ${device.value}%</span>`;
                    
                    const slider = document.createElement('input');
                    slider.type = 'range';
                    slider.className = 'control-slider';
                    slider.min = '0';
                    slider.max = '100';
                    slider.value = device.value;
                    slider.addEventListener('input', (e) => {
                        updateDeviceValue(device.id, parseInt(e.target.value));
                        volumeRow.querySelector('.slider-val').textContent = `Vol ${e.target.value}%`;
                    });

                    controlsBlock.appendChild(volumeRow);
                    controlsBlock.appendChild(slider);
                    card.appendChild(controlsBlock);

                } else if (device.id === 'kitchen-coffee') {
                    // Coffee Strength
                    const brewRow = document.createElement('div');
                    brewRow.className = 'control-label-row';
                    brewRow.innerHTML = `<span>Brew Strength</span><span class="device-status-val text-active">${device.value.toUpperCase()}</span>`;

                    const brewSelector = document.createElement('div');
                    brewSelector.className = 'color-picker-row';

                    const strengths = ["mild", "medium", "bold"];
                    strengths.forEach(str => {
                        const sBtn = document.createElement('button');
                        sBtn.className = `execute-routine-btn ${device.value === str ? 'active-run' : ''}`;
                        sBtn.style.padding = "0.25rem 0.6rem";
                        sBtn.style.fontSize = "0.75rem";
                        sBtn.textContent = str.toUpperCase();
                        sBtn.addEventListener('click', () => {
                            updateDeviceValue(device.id, str);
                            renderDevicesGrid();
                        });
                        brewSelector.appendChild(sBtn);
                    });

                    controlsBlock.appendChild(brewRow);
                    controlsBlock.appendChild(brewSelector);
                    card.appendChild(controlsBlock);
                } else if (device.id === 'kitchen-oven') {
                    // Oven temperature
                    const tempRow = document.createElement('div');
                    tempRow.className = 'control-label-row';
                    tempRow.innerHTML = `<span>Target Temperature</span><span class="slider-val">${device.value}°F</span>`;

                    const slider = document.createElement('input');
                    slider.type = 'range';
                    slider.className = 'control-slider';
                    slider.min = '150';
                    slider.max = '450';
                    slider.step = '10';
                    slider.value = device.value;
                    slider.addEventListener('input', (e) => {
                        updateDeviceValue(device.id, parseInt(e.target.value));
                        tempRow.querySelector('.slider-val').textContent = `${e.target.value}°F`;
                    });

                    controlsBlock.appendChild(tempRow);
                    controlsBlock.appendChild(slider);
                    card.appendChild(controlsBlock);
                }
            }

            devicesGrid.appendChild(card);
        });

        lucide.createIcons(); // refresh icons inside newly rendered HTML
    }

    function toggleDevice(id, status) {
        const device = state.devices.find(d => d.id === id);
        if (!device) return;

        device.status = status;
        
        // Security Lock special logic
        if (device.type === 'security') {
            addLog(`${device.name} is now ${status ? 'LOCKED' : 'UNLOCKED'}.`, status ? "success" : "warning");
        } else {
            addLog(`${device.name} turned ${status ? 'ON' : 'OFF'}.`, status ? "info" : "info");
        }
        
        refreshDashboardStats();
        saveToStorage();
    }

    function updateDeviceValue(id, value) {
        const device = state.devices.find(d => d.id === id);
        if (!device) return;
        
        device.value = value;
        saveToStorage();
    }

    function updateDeviceColor(id, color) {
        const device = state.devices.find(d => d.id === id);
        if (!device) return;
        
        device.color = color;
        addLog(`${device.name} ambient color set to ${color}.`, "info");
        saveToStorage();
    }

    function updateDeviceMode(id, mode) {
        const device = state.devices.find(d => d.id === id);
        if (!device) return;
        
        device.mode = mode;
        addLog(`${device.name} mode changed to ${mode.toUpperCase()}.`, "info");
        saveToStorage();
    }

    // --- QUICK DASHBOARD CONTROLS ---
    if (btnQuickLights) {
        btnQuickLights.addEventListener('click', () => {
            const hasOn = state.devices.some(d => d.type === 'lighting' && d.status === true);
            state.devices.forEach(d => {
                if (d.type === 'lighting') d.status = !hasOn;
            });
            addLog(hasOn ? "Quick Action: Toggled all lights OFF." : "Quick Action: Toggled all lights ON.", "info");
            refreshDashboardStats();
            if (state.currentTab === 'rooms') renderDevicesGrid();
            saveToStorage();
        });
    }

    if (btnQuickHvac) {
        btnQuickHvac.addEventListener('click', () => {
            const isEcoNow = state.devices.find(d => d.id === 'living-ac').mode === 'eco';
            state.devices.forEach(d => {
                if (d.type === 'climate') {
                    d.status = true;
                    d.mode = isEcoNow ? 'cool' : 'eco';
                    d.value = isEcoNow ? 72 : 78;
                }
            });
            addLog(isEcoNow ? "Quick Action: Klimatisierung to Comfort cooling (72°F)." : "Quick Action: Klimatisierung to Eco Mode (78°F).", "success");
            refreshDashboardStats();
            if (state.currentTab === 'rooms') renderDevicesGrid();
            saveToStorage();
        });
    }

    if (btnQuickLocks) {
        btnQuickLocks.addEventListener('click', () => {
            const hasUnlocked = state.devices.some(d => d.type === 'security' && d.status === false);
            state.devices.forEach(d => {
                if (d.type === 'security') d.status = true;
            });
            addLog("Quick Action: Engaged all secure door/gate locks.", "success");
            refreshDashboardStats();
            if (state.currentTab === 'rooms') renderDevicesGrid();
            saveToStorage();
        });
    }

    if (btnQuickSprinkler) {
        btnQuickSprinkler.addEventListener('click', () => {
            const sprinkler = state.devices.find(d => d.id === 'outdoor-sprinkler');
            sprinkler.status = !sprinkler.status;
            addLog(`Quick Action: Backyard Lawn Sprinklers are now ${sprinkler.status ? 'ON' : 'OFF'}.`, "info");
            refreshDashboardStats();
            if (state.currentTab === 'rooms') renderDevicesGrid();
            saveToStorage();
        });
    }

    if (document.getElementById('btn-clear-logs')) {
        document.getElementById('btn-clear-logs').addEventListener('click', () => {
            state.logs = [{ time: new Date().toLocaleTimeString(), type: "info", message: "Logs cleared by Admin." }];
            renderLogs();
            saveToStorage();
        });
    }

    // --- QUICK HOUSE MODES ---
    modeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const mode = btn.getAttribute('data-mode');
            setHouseMode(mode);
        });
    });

    function setHouseMode(mode) {
        modeButtons.forEach(b => {
            if (b.getAttribute('data-mode') === mode) {
                b.classList.add('active');
            } else {
                b.classList.remove('active');
            }
        });

        if (mode === 'home') {
            state.securityMode = "disarmed";
            state.devices.find(d => d.id === 'living-light').status = true;
            state.devices.find(d => d.id === 'living-ac').status = true;
            state.devices.find(d => d.id === 'living-ac').value = 72;
            state.devices.find(d => d.id === 'living-ac').mode = "cool";
            state.devices.find(d => d.id === 'living-lock').status = false; // unlocked
            addLog("House Mode: switched to HOME. Security disarmed.", "info");
        } 
        else if (mode === 'away') {
            state.securityMode = "armed-away";
            // Turn off all lights
            state.devices.forEach(d => {
                if (d.type === 'lighting') d.status = false;
                if (d.type === 'appliance' && d.id !== 'kitchen-fridge') d.status = false;
            });
            // AC to eco
            state.devices.forEach(d => {
                if (d.type === 'climate') {
                    d.status = true;
                    d.mode = 'eco';
                    d.value = 78;
                }
            });
            // Locks
            state.devices.find(d => d.id === 'living-lock').status = true;
            state.devices.find(d => d.id === 'outdoor-gate').status = true;
            addLog("House Mode: switched to AWAY. All appliances/lights minimized, security ARMED.", "warning");
        } 
        else if (mode === 'night') {
            state.securityMode = "armed-home";
            state.devices.forEach(d => {
                if (d.type === 'lighting' && d.id !== 'bedroom-light') d.status = false;
                if (d.type === 'appliance' && d.id !== 'kitchen-fridge' && d.id !== 'bedroom-humidifier') d.status = false;
            });
            // Living AC off, Bed AC on
            state.devices.find(d => d.id === 'living-ac').status = false;
            state.devices.find(d => d.id === 'bedroom-ac').status = true;
            state.devices.find(d => d.id === 'bedroom-ac').value = 68;
            // Locks
            state.devices.find(d => d.id === 'living-lock').status = true;
            state.devices.find(d => d.id === 'outdoor-gate').status = true;
            addLog("House Mode: switched to NIGHT. Smart lighting adapted, locks engaged.", "info");
        } 
        else if (mode === 'eco') {
            // Adapt system to eco modes
            state.devices.forEach(d => {
                if (d.type === 'climate') {
                    d.mode = 'eco';
                    d.value = 78;
                }
                if (d.type === 'lighting' && d.status) {
                    d.value = Math.min(d.value, 60); // dim light ceiling to save power
                }
            });
            addLog("House Mode: Eco-Mode optimizations applied housewide.", "success");
        }

        updateSecurityUI();
        refreshDashboardStats();
        if (state.currentTab === 'rooms') renderDevicesGrid();
        saveToStorage();
    }

    function updateSecurityUI() {
        if (!shieldLarge || !shieldStatusText || !shieldIconLarge) return;
        
        // Remove old security styling classes
        shieldLarge.className = "status-shield";
        
        // Synchronize Active security state buttons
        if (btnDisarm && btnArmHome && btnArmAway) {
            btnDisarm.classList.remove('active');
            btnArmHome.classList.remove('active');
            btnArmAway.classList.remove('active');
        }

        if (state.securityMode === 'disarmed') {
            shieldLarge.classList.add('disarmed');
            shieldIconLarge.setAttribute('data-lucide', 'shield-alert');
            shieldStatusText.textContent = "SYSTEM DISARMED";
            if (btnDisarm) btnDisarm.classList.add('active');
            if (statSecurityVal) statSecurityVal.textContent = "Disarmed";
        } 
        else if (state.securityMode === 'armed-home') {
            shieldLarge.classList.add('armed');
            shieldIconLarge.setAttribute('data-lucide', 'shield-check');
            shieldStatusText.textContent = "ARMED (HOME)";
            if (btnArmHome) btnArmHome.classList.add('active');
            if (statSecurityVal) statSecurityVal.textContent = "Armed (Home)";
        }
        else if (state.securityMode === 'armed-away') {
            shieldLarge.classList.add('armed');
            shieldIconLarge.setAttribute('data-lucide', 'shield-check');
            shieldStatusText.textContent = "ARMED (AWAY)";
            if (btnArmAway) btnArmAway.classList.add('active');
            if (statSecurityVal) statSecurityVal.textContent = "Armed (Away)";
        }
        else if (state.securityMode === 'panic') {
            shieldLarge.classList.add('alarm');
            shieldIconLarge.setAttribute('data-lucide', 'shield-alert');
            shieldStatusText.textContent = "ALARM RINGING";
            if (statSecurityVal) statSecurityVal.textContent = "ALARM DETECTED";
        }

        lucide.createIcons();
    }

    // --- ROUTINE EXECUTION & CUSTOM RULES ---
    const executeBtns = document.querySelectorAll('.routine-card');
    executeBtns.forEach(card => {
        const btn = card.querySelector('.execute-routine-btn');
        const trigger = card.getAttribute('data-routine-trigger');
        
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // prevent card click conflict
            executeRoutine(trigger);
            
            // Temporary click UI feedback
            card.classList.add('active-run');
            setTimeout(() => { card.classList.remove('active-run'); }, 1200);
        });
    });

    function executeRoutine(name) {
        if (name === 'good-morning') {
            state.devices.find(d => d.id === 'living-ac').status = true;
            state.devices.find(d => d.id === 'living-ac').value = 72;
            state.devices.find(d => d.id === 'bedroom-light').status = true;
            state.devices.find(d => d.id === 'bedroom-light').value = 40;
            state.devices.find(d => d.id === 'kitchen-coffee').status = true;
            state.devices.find(d => d.id === 'outdoor-light').status = false;
            addLog("Routine: 'Good Morning' executed. Climate set, espresso starting.", "success");
        } 
        else if (name === 'movie-night') {
            state.devices.find(d => d.id === 'living-light').status = true;
            state.devices.find(d => d.id === 'living-light').value = 10;
            state.devices.find(d => d.id === 'living-light').color = "#c084fc"; // Violet ambient
            state.devices.find(d => d.id === 'living-tv').status = true;
            state.devices.find(d => d.id === 'living-ac').status = true;
            state.devices.find(d => d.id === 'living-ac').value = 70;
            state.devices.find(d => d.id === 'bedroom-light').status = false;
            addLog("Routine: 'Movie Night' executed. Dimm lights violet, Smart TV ON.", "success");
        } 
        else if (name === 'away') {
            setHouseMode('away');
            return;
        } 
        else if (name === 'good-night') {
            setHouseMode('night');
            return;
        }
        else if (name === 'all-off') {
            state.devices.forEach(d => {
                if (d.id !== 'kitchen-fridge' && d.type !== 'security') {
                    d.status = false;
                }
            });
            addLog("Routine: Shut down all house lights & utilities.", "info");
        }

        refreshDashboardStats();
        if (state.currentTab === 'rooms') renderDevicesGrid();
        saveToStorage();
    }

    // Custom scheduler submission
    if (scheduleForm) {
        scheduleForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const schedName = document.getElementById('schedule-name').value;
            const schedTime = document.getElementById('schedule-time').value;
            const schedRoutine = document.getElementById('schedule-routine').value;
            
            // Get selected days
            const dayChecks = document.querySelectorAll('input[name="days"]:checked');
            const selectedDays = Array.from(dayChecks).map(c => parseInt(c.value));

            if (selectedDays.length === 0) {
                alert("Please select at least one day for the trigger.");
                return;
            }

            const newSchedule = {
                id: Date.now(),
                name: schedName,
                time: schedTime,
                routine: schedRoutine,
                days: selectedDays,
                active: true
            };

            state.schedules.push(newSchedule);
            addLog(`Automation Rule '${schedName}' added at ${schedTime}.`, "success");
            
            // Reset form
            scheduleForm.reset();
            renderSchedulesList();
            saveToStorage();
        });
    }

    function renderSchedulesList() {
        if (!schedulesList) return;
        schedulesList.innerHTML = '';

        if (state.schedules.length === 0) {
            schedulesList.innerHTML = `<div class="schedule-sub-txt" style="text-align:center; padding: 1.5rem 0;">No active automation rules.</div>`;
            return;
        }

        const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

        state.schedules.forEach(sched => {
            const item = document.createElement('div');
            item.className = 'schedule-item';

            const meta = document.createElement('div');
            meta.className = 'schedule-meta-info';

            const title = document.createElement('span');
            title.className = 'schedule-title-txt';
            title.textContent = `${sched.name} (${sched.time})`;

            const sub = document.createElement('span');
            sub.className = 'schedule-sub-txt';
            const daysNames = sched.days.map(d => weekdays[d]).join(', ');
            sub.textContent = `Triggers routine [${sched.routine.toUpperCase()}] on: ${daysNames}`;

            meta.appendChild(title);
            meta.appendChild(sub);

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-schedule-btn';
            deleteBtn.innerHTML = `<i data-lucide="trash-2"></i>`;
            deleteBtn.addEventListener('click', () => {
                deleteSchedule(sched.id);
            });

            item.appendChild(meta);
            item.appendChild(deleteBtn);
            schedulesList.appendChild(item);
        });

        lucide.createIcons();
    }

    function deleteSchedule(id) {
        state.schedules = state.schedules.filter(s => s.id !== id);
        addLog("Automation rule deleted.", "info");
        renderSchedulesList();
        saveToStorage();
    }

    function checkSchedules(now) {
        const currentHourMin = now.toTimeString().slice(0, 5); // "HH:MM"
        const currentDay = now.getDay(); // 0-6

        state.schedules.forEach(sched => {
            if (sched.active && sched.time === currentHourMin && sched.days.includes(currentDay)) {
                addLog(`Scheduler matched trigger rule: '${sched.name}'`, "success");
                executeRoutine(sched.routine);
            }
        });
    }

    // --- SECURITY ARMING HANDLERS ---
    if (btnDisarm) btnDisarm.addEventListener('click', () => { state.securityMode = "disarmed"; updateSecurityUI(); addLog("Security: System disarmed via Control Board.", "info"); saveToStorage(); });
    if (btnArmHome) btnArmHome.addEventListener('click', () => { state.securityMode = "armed-home"; updateSecurityUI(); addLog("Security: System ARMED in Home mode.", "info"); saveToStorage(); });
    if (btnArmAway) btnArmAway.addEventListener('click', () => { state.securityMode = "armed-away"; updateSecurityUI(); addLog("Security: System ARMED in Away mode. Motion detectors active.", "warning"); saveToStorage(); });
    
    if (btnPanic) {
        btnPanic.addEventListener('click', () => {
            if (state.securityMode === 'panic') {
                // Disarm / Shut down panic
                state.securityMode = "disarmed";
                btnPanic.textContent = "TRIGGER PANIC ALARM";
                btnPanic.classList.remove('ringing');
                addLog("Security Panic alarm cancelled.", "success");
            } else {
                state.securityMode = "panic";
                btnPanic.textContent = "SILENCE PANIC ALARM";
                btnPanic.classList.add('ringing');
                addLog("EMERGENCY PANIC ALARM TRIGGERED! Dispatching alerts.", "danger");
            }
            updateSecurityUI();
            saveToStorage();
        });
    }

    // --- MOCK CCTV CAMERAS CONTROLLER ---
    let camIntervals = {};
    let camActiveFeeds = { front: true, back: true, living: true, driveway: true };

    function initCameraCams() {
        const cameras = ["front", "back", "living", "driveway"];
        
        cameras.forEach(cam => {
            const canvas = document.getElementById(`canvas-cam-${cam}`);
            if (!canvas) return;

            // Clear old loops if any
            if (camIntervals[cam]) clearInterval(camIntervals[cam]);

            const ctx = canvas.getContext('2d');
            canvas.width = 320;
            canvas.height = 200;

            // Simple drawing telemetry loop for simulated CCTV feeds
            let frame = 0;
            camIntervals[cam] = setInterval(() => {
                drawCameraFeed(cam, canvas, ctx, frame++);
            }, 100);
        });

        // Setup individual pause toggles
        const feedToggleBtns = document.querySelectorAll('.toggle-feed');
        feedToggleBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const cam = btn.getAttribute('data-cam');
                camActiveFeeds[cam] = !camActiveFeeds[cam];
                
                const icon = btn.querySelector('i');
                if (camActiveFeeds[cam]) {
                    btn.innerHTML = `<i data-lucide="pause"></i>`;
                    addLog(`Resumed security camera ${cam.toUpperCase()} stream.`, "info");
                } else {
                    btn.innerHTML = `<i data-lucide="play"></i>`;
                    addLog(`Paused security camera ${cam.toUpperCase()} stream.`, "warning");
                }
                lucide.createIcons();
            });
        });

        // Setup motion simulation buttons
        const simulateMotionBtns = document.querySelectorAll('.trigger-alert');
        simulateMotionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const cam = btn.getAttribute('data-cam');
                addLog(`Security Alert: Motion detected on CAM-${cam.toUpperCase()}!`, "danger");
                
                // Temp UI alert border flashing
                const camBox = btn.closest('.cam-box');
                camBox.style.borderColor = 'var(--color-crimson)';
                camBox.style.boxShadow = '0 0 20px var(--color-crimson-glow)';
                
                setTimeout(() => {
                    camBox.style.borderColor = 'var(--border-glass)';
                    camBox.style.boxShadow = 'none';
                }, 4000);
            });
        });
    }

    function drawCameraFeed(cam, canvas, ctx, frame) {
        ctx.fillStyle = "#0c0f17";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (!camActiveFeeds[cam]) {
            // Draw paused screen
            ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
            ctx.font = "bold 14px monospace";
            ctx.textAlign = "center";
            ctx.fillText("CAM PAUSED - STANDBY", canvas.width / 2, canvas.height / 2);
            return;
        }

        // Draw Simulated CCTV Landscape Grid lines
        ctx.strokeStyle = "rgba(6, 182, 212, 0.05)";
        ctx.lineWidth = 1;
        
        // Perspectives
        ctx.beginPath();
        if (cam === 'front') {
            // Porch pillars / steps
            ctx.moveTo(40, 200); ctx.lineTo(100, 80);
            ctx.moveTo(280, 200); ctx.lineTo(220, 80);
            ctx.moveTo(100, 80); ctx.lineTo(220, 80);
            ctx.moveTo(70, 140); ctx.lineTo(250, 140);
        } else if (cam === 'back') {
            // Deck rails & pool
            ctx.moveTo(0, 150); ctx.lineTo(320, 150);
            ctx.ellipse(160, 175, 120, 20, 0, 0, Math.PI * 2);
        } else if (cam === 'living') {
            // Living room wall lines / couch
            ctx.moveTo(50, 0); ctx.lineTo(50, 200);
            ctx.moveTo(270, 0); ctx.lineTo(270, 200);
            ctx.strokeRect(80, 120, 160, 60); // couch
        } else if (cam === 'driveway') {
            // Driveway gate & fence
            ctx.moveTo(0, 100); ctx.lineTo(320, 100);
            ctx.moveTo(100, 100); ctx.lineTo(100, 200);
            ctx.moveTo(220, 100); ctx.lineTo(220, 200);
        }
        ctx.stroke();

        // Animate moving shadows/elements
        ctx.fillStyle = "rgba(255, 255, 255, 0.02)";
        const movement = Math.sin(frame * 0.05) * 15;
        if (cam === 'front' || cam === 'back') {
            // swaying tree shadow
            ctx.beginPath();
            ctx.arc(40 + movement, 60, 30, 0, Math.PI * 2);
            ctx.fill();
        } else if (cam === 'living') {
            // Light adaptation (change backdrop lighting intensity depending on smart lights)
            const livingLight = state.devices.find(d => d.id === 'living-light');
            if (livingLight.status) {
                ctx.fillStyle = `${livingLight.color}0a`;
                ctx.fillRect(0,0, canvas.width, canvas.height);
            }
        }

        // Apply CCTV scanning overlay line
        const scanlineY = (frame * 3) % canvas.height;
        ctx.fillStyle = "rgba(6, 182, 212, 0.08)";
        ctx.fillRect(0, scanlineY, canvas.width, 2);

        // Frame status / text details (rendered inside canvas)
        ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
        ctx.font = "9px monospace";
        ctx.textAlign = "left";
        
        // Static Noise Filter Effect
        for (let i = 0; i < 200; i++) {
            const rx = Math.random() * canvas.width;
            const ry = Math.random() * canvas.height;
            ctx.fillStyle = "rgba(255, 255, 255, 0.035)";
            ctx.fillRect(rx, ry, 1, 1);
        }
    }

    // --- ANALYTICS VIEWS & CHARTS ---
    function initAnalyticsCharts() {
        const ctxLive = document.getElementById('liveEnergyChart');
        if (ctxLive && !liveEnergyChart) {
            liveEnergyChart = new Chart(ctxLive.getContext('2d'), {
                type: 'line',
                data: {
                    labels: ['', '', '', '', '', '', '', '', '', '', '', ''],
                    datasets: [{
                        label: 'Current Demand (Watts)',
                        data: state.powerHistory,
                        borderColor: '#06b6d4',
                        backgroundColor: 'rgba(6, 182, 212, 0.08)',
                        fill: true,
                        tension: 0.4,
                        borderWidth: 2,
                        pointRadius: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { grid: { display: false } },
                        y: { 
                            grid: { color: 'rgba(255, 255, 255, 0.04)' },
                            ticks: { color: '#9ca3af', font: { family: 'Plus Jakarta Sans' } } 
                        }
                    }
                }
            });
        }

        // Rooms Power Chart
        const ctxRooms = document.getElementById('roomsEnergyChart');
        if (ctxRooms && !roomsEnergyChart) {
            roomsEnergyChart = new Chart(ctxRooms.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: ['Living Room', 'Kitchen', 'Bedroom', 'Bathroom', 'Backyard'],
                    datasets: [{
                        data: [0, 0, 0, 0, 0],
                        backgroundColor: [
                            'rgba(6, 182, 212, 0.65)',
                            'rgba(139, 92, 246, 0.65)',
                            'rgba(245, 158, 11, 0.65)',
                            'rgba(16, 185, 129, 0.65)',
                            'rgba(239, 68, 68, 0.65)'
                        ],
                        borderColor: ['#06b6d4', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444'],
                        borderWidth: 1,
                        borderRadius: 6
                    }]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { 
                            grid: { color: 'rgba(255, 255, 255, 0.04)' },
                            ticks: { color: '#9ca3af' } 
                        },
                        y: { 
                            grid: { display: false },
                            ticks: { color: '#f3f4f6', font: { family: 'Plus Jakarta Sans', weight: '600' } } 
                        }
                    }
                }
            });
        }

        // Category Power Chart
        const ctxCat = document.getElementById('categoryEnergyChart');
        if (ctxCat && !categoryEnergyChart) {
            categoryEnergyChart = new Chart(ctxCat.getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: ['Lighting', 'HVAC Climate', 'Appliances', 'Security'],
                    datasets: [{
                        data: [0, 0, 0, 0],
                        backgroundColor: [
                            'rgba(6, 182, 212, 0.6)',
                            'rgba(245, 158, 11, 0.6)',
                            'rgba(139, 92, 246, 0.6)',
                            'rgba(16, 185, 129, 0.6)'
                        ],
                        borderColor: ['#06b6d4', '#f59e0b', '#8b5cf6', '#10b981'],
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { 
                            position: 'bottom',
                            labels: { color: '#f3f4f6', font: { family: 'Plus Jakarta Sans', size: 11 } }
                        }
                    },
                    cutout: '65%'
                }
            });
        }

        updateAnalyticsCharts();
    }

    function updateAnalyticsCharts() {
        if (state.currentTab !== 'analytics' && state.currentTab !== 'dashboard') return;

        // Compile aggregated statistics
        let roomPower = { 'living-room': 0, 'kitchen': 0, 'bedroom': 0, 'bathroom': 0, 'outdoor': 0 };
        let typePower = { 'lighting': 0, 'climate': 0, 'appliance': 0, 'security': 0 };

        state.devices.forEach(device => {
            if (device.status) {
                let load = device.power;
                if (device.type === 'lighting') load = Math.round(device.power * (device.value / 100));
                
                roomPower[device.room] += load;
                typePower[device.type] += load;
            }
        });

        // Update Rooms chart
        if (roomsEnergyChart) {
            roomsEnergyChart.data.datasets[0].data = [
                roomPower['living-room'],
                roomPower['kitchen'],
                roomPower['bedroom'],
                roomPower['bathroom'],
                roomPower['outdoor']
            ];
            roomsEnergyChart.update();
        }

        // Update Category chart
        if (categoryEnergyChart) {
            categoryEnergyChart.data.datasets[0].data = [
                typePower['lighting'],
                typePower['climate'],
                typePower['appliance'],
                typePower['security']
            ];
            categoryEnergyChart.update();
        }

        // Update projection metric Card
        const curDemand = calculatePowerDemand();
        const dailyKwh = ((curDemand * 24) / 1000).toFixed(1);
        const projectionCard = document.getElementById('metric-daily-est');
        if (projectionCard) projectionCard.textContent = `${dailyKwh} kWh`;
    }

    // --- SETTINGS MODAL INTERACTIONS ---
    if (triggerSettings) {
        triggerSettings.addEventListener('click', () => {
            // Fill inputs with current state settings
            inputUserName.value = state.settings.userName;
            selectTempUnit.value = state.settings.tempUnit;
            checkAlertNotifs.checked = state.settings.notifications;
            checkSimDrift.checked = state.settings.simDrift;

            modalSettings.classList.add('open');
            addLog("Opened Settings Dashboard.", "info");
        });
    }

    if (closeSettings) {
        closeSettings.addEventListener('click', () => {
            modalSettings.classList.remove('open');
        });
    }

    // Close when clicking backdrop
    modalSettings.addEventListener('click', (e) => {
        if (e.target === modalSettings) {
            modalSettings.classList.remove('open');
        }
    });

    if (saveSettings) {
        saveSettings.addEventListener('click', () => {
            const oldName = state.settings.userName;
            const oldUnit = state.settings.tempUnit;

            state.settings.userName = inputUserName.value;
            state.settings.tempUnit = selectTempUnit.value;
            state.settings.notifications = checkAlertNotifs.checked;
            state.settings.simDrift = checkSimDrift.checked;

            // Apply name changes to UI
            if (welcomeHeader) welcomeHeader.textContent = `Good morning, ${state.settings.userName}`;
            document.querySelector('.profile-name').textContent = state.settings.userName;

            // Handle temperature unit conversion in state devices
            if (oldUnit !== state.settings.tempUnit) {
                state.devices.forEach(d => {
                    if (d.type === 'climate') {
                        if (state.settings.tempUnit === 'C') {
                            // F to C
                            d.value = Math.round((d.value - 32) * 5 / 9);
                        } else {
                            // C to F
                            d.value = Math.round((d.value * 9 / 5) + 32);
                        }
                    }
                });
            }

            modalSettings.classList.remove('open');
            addLog("Settings updated successfully.", "success");
            
            // Refresh
            refreshDashboardStats();
            if (state.currentTab === 'rooms') renderDevicesGrid();
            saveToStorage();
        });
    }

    if (resetSettings) {
        resetSettings.addEventListener('click', () => {
            if (confirm("Are you sure you want to reset all configurations to factory defaults?")) {
                localStorage.removeItem('home_automation_state');
                location.reload();
            }
        });
    }

    // --- SYSTEM RUN & TIMER STARTS ---
    updateTime();
    setInterval(updateTime, 1000);

    // Initial calculations
    refreshDashboardStats();
    renderLogs();
    renderSchedulesList();
    
    // Animate camera streams in background if user switches to security
    // But initialize drawing loop here
    initCameraCams();
    
    // Telemetry Update Interval
    setInterval(() => {
        runTelemetryDrift();
        refreshDashboardStats();
    }, 1500);

    // Welcome message updates based on name
    if (welcomeHeader) welcomeHeader.textContent = `Good morning, ${state.settings.userName}`;
    document.querySelector('.profile-name').textContent = state.settings.userName;
    
    // Initialize icons
    lucide.createIcons();
});
