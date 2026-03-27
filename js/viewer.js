document.addEventListener('DOMContentLoaded', () => {

    // =========================================
    // 1. THE MULTI-YEAR DATABASE
    // =========================================
    const robotDatabase = {
        "2026_rico": {
            logo: "Rico_logoSingleColorTrans.png",
            subsystems: [
                { id: "Robot", label: "Main Assembly", path: "Robot/images", frames: 30, useLogo: true },
                { id: "Shooter", label: "Shooter", path: "Shooter/images", frames: 30, useLogo: false },
                { id: "Tunnel", label: "Tunnel", path: "Tunnel/images", frames: 30, useLogo: false },
                { id: "Intake", label: "Intake", path: "Intake/images", frames: 30, useLogo: false },
                { id: "Indexer", label: "Indexer", path: "Indexer/images", frames: 30, useLogo: false },
                { id: "Wheel", label: "Swerve Wheel", path: "Wheel/images", frames: 30, useLogo: false }
            ],
            specs: {
                "Robot": {
                    title: "RICO - Main Assembly",
                    leftContent: "<p>Rico's 21.5\" x 33\" chassis is rectangular when stowed, forming a perfect square when the intake is deployed to maximize storage capacity.</p><p>The battery is positioned opposite the turret to maintain a balanced center of gravity, utilizing vertical 1x1 tubes for unobstructed camera placement.</p>",
                    rightContent: "<ul><li><b>Chassis:</b> 1/8\" thick tubes & belly pan</li><li><b>Steering:</b> WCP X2S Swerve Modules</li><li><b>Deflectors:</b> 1/16\" polycarb plates</li><li><b>Cameras:</b> 4x ArduCam OV9281</li></ul>"
                },
                "Shooter": {
                    title: "Shooter & Turret",
                    leftContent: "<p>A flywheel mechanism capable of firing approximately 6 balls per second. A rotating turret provides independent horizontal aiming.</p><p>Adjustable hood and flywheel speeds control the launch angle and distance, improving accuracy from anywhere on the field without repositioning the drivetrain.</p>",
                    rightContent: "<ul><li><b>Turret Motor:</b> 1x Kraken X44 (52:1 Ratio)</li><li><b>Rotation:</b> 720° continuous via cable sleeve</li><li><b>Flywheel Motors:</b> 2x Kraken X60 (3:1 Ratio)</li><li><b>Flywheel:</b> 6\" aluminum with O-rings</li><li><b>Hood Range:</b> 41° (270:1 reduction)</li></ul>"
                },
                "Tunnel": {
                    title: "Tunnel & Tower",
                    leftContent: "<p>The tunnel collects fuel from the lower indexer section and organizes it into a single horizontal row to prevent jamming.</p><p>The tower then shifts the fuel from horizontal to vertical motion, launching it smoothly into the shooter assembly.</p>",
                    rightContent: "<ul><li><b>Tunnel Motor:</b> 1x Kraken X60</li><li><b>Tunnel System:</b> 3 belts moving at 20 ft/s</li><li><b>Tower Wheels:</b> 2x4\" and 4x2\" Stealth Wheels</li><li><b>Surface Speed:</b> Maintained at 20 ft/s throughout</li></ul>"
                },
                "Intake": {
                    title: "Intake Assembly",
                    leftContent: "<p>A single pivot mechanism designed to gather fuel from the floor immediately after contact to reduce chasing time.</p><p>The gear rack driven pivot allows for controlled deployment, agitation, and stowing within a 92° range of motion.</p>",
                    rightContent: "<ul><li><b>Pivot Motor:</b> 1x Kraken X44 (67:1 Ratio)</li><li><b>Roller Motors:</b> 2x Kraken X44</li><li><b>Rollers:</b> 2\" HDPE with CatTongue tape</li><li><b>Surface Speed:</b> 12.5 ft/s</li></ul>"
                },
                "Indexer": {
                    title: "Indexer Mechanism",
                    leftContent: "<p>The indexer transitions fuel from the intake to the tower using a series of downward-inclined, lightweight carbon fiber rods.</p><p>The roller bed pivots for maintenance access, while mecanum wheels act as agitators to guarantee streamlined fuel flow.</p>",
                    rightContent: "<ul><li><b>Roller Motors:</b> Shared with intake (2x Kraken X44)</li><li><b>Roller Speed:</b> 6.5 ft/s</li><li><b>Structure:</b> PET-CF brace blocks</li><li><b>Agitators:</b> Mecanum wheels</li></ul>"
                },
                "Wheel": {
                    title: "Swerve Drivetrain",
                    leftContent: "<p>Features WCP's X2S swerve modules for increased maneuverability and instantaneous directional changes to navigate around fuel easily.</p><p>The X1 Ratio set improves torque to reduce power consumption, paired with custom 3D printed treads to improve grip over the bump.</p>",
                    rightContent: "<ul><li><b>Module:</b> WCP X2S (Lightest in catalog)</li><li><b>Drive Motor:</b> 1x Kraken X60 per module</li><li><b>Steer Motor:</b> 1x Kraken X44 per module</li><li><b>Treads:</b> Custom 3D Printed</li></ul>"
                }
            }
        },
        "2025_offseason": {
            logo: "Ramtech_logo.png", 
            subsystems: [
                { id: "Robot", label: "Main Assembly", path: "2025/Robot/images", frames: 30, useLogo: false }
            ],
            specs: {
                "Robot": {
                    title: "2025 Offseason Assembly",
                    leftContent: "<p>Placeholder text for the 2025 offseason robot.</p>",
                    rightContent: "<ul><li><b>Chassis:</b> TBD</li><li><b>Drive:</b> TBD</li></ul>"
                }
            }
        }
    };


    // =========================================
    // 2. THE CUSTOM 360 ENGINE
    // =========================================
    const viewerImg = document.getElementById('viewer-image');
    const viewerContainer = document.getElementById('viewer');
    const loadingScreen = document.getElementById('loading-screen');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    const spinBtns = document.querySelectorAll('.btn-spin');

    let imageCache = [];
    let currentFrame = 1;
    let totalFrames = 30;
    
    // Drag Physics State
    let isDragging = false;
    let startX = 0;
    const pixelsPerFrame = 15; // How far mouse must move to trigger next frame
    
    // Auto-Spin State
    let autoSpinMode = false; 
    let spinLoop = null;
    let idleTimer = null;
    const spinSpeedMs = 85; 
    const idleDelayMs = 4000; 

    // Formatting string: Folder/Frame000001.png
    function getFramePath(folder, index) {
        let paddedIndex = index.toString().padStart(6, '0');
        return `${folder}/Frame${paddedIndex}.png`; // Change to .jpg here if needed!
    }

    function updateImageDisplay() {
        if (imageCache[currentFrame - 1]) {
            viewerImg.src = imageCache[currentFrame - 1].src;
        }
    }

    // The Bulletproof Preloader
    function loadModelImages(folderPath, frameCount) {
        stopSpinning();
        clearTimeout(idleTimer);
        viewerImg.style.opacity = '0'; 
        
        loadingScreen.style.display = 'flex';
        loadingScreen.offsetHeight; 
        loadingScreen.style.opacity = '1';
        progressFill.style.width = '0%';
        progressText.innerText = 'DOWNLOADING HD ASSETS... 0%';

        totalFrames = frameCount;
        imageCache = [];
        let loadedCount = 0;

        for (let i = 1; i <= totalFrames; i++) {
            let img = new Image();
            img.onload = () => {
                loadedCount++;
                let percent = Math.round((loadedCount / totalFrames) * 100);
                progressFill.style.width = percent + '%';
                progressText.innerText = 'DOWNLOADING HD ASSETS... ' + percent + '%';

                if (loadedCount === totalFrames) {
                    currentFrame = 1;
                    updateImageDisplay();
                    viewerImg.style.opacity = '1';
                    
                    setTimeout(() => {
                        loadingScreen.style.opacity = '0';
                        setTimeout(() => { loadingScreen.style.display = 'none'; }, 400);
                    }, 300);

                    if (autoSpinMode) resetIdleTimer();
                }
            };
            img.onerror = () => {
                console.error("Failed to load: " + img.src);
                loadedCount++; 
            };
            img.src = getFramePath(folderPath, i);
            imageCache.push(img);
        }
    }

    // --- Interaction Physics ---
    function startDrag(e) {
        isDragging = true;
        startX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
        stopSpinning();
        clearTimeout(idleTimer);
    }

    function drag(e) {
        if (!isDragging) return;
        e.preventDefault(); 

        let currentX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
        let deltaX = currentX - startX;
        
        if (Math.abs(deltaX) > pixelsPerFrame) {
            if (deltaX > 0) {
                currentFrame--; // Drag right, spin left
            } else {
                currentFrame++; // Drag left, spin right
            }

            // Loop logic
            if (currentFrame > totalFrames) currentFrame = 1;
            if (currentFrame < 1) currentFrame = totalFrames;

            updateImageDisplay();
            startX = currentX; 
        }
    }

    function endDrag() {
        if (!isDragging) return;
        isDragging = false;
        if (autoSpinMode) resetIdleTimer();
    }

    viewerContainer.addEventListener('mousedown', startDrag);
    window.addEventListener('mousemove', drag);
    window.addEventListener('mouseup', endDrag);
    viewerContainer.addEventListener('touchstart', startDrag, {passive: false});
    window.addEventListener('touchmove', drag, {passive: false});
    window.addEventListener('touchend', endDrag);

    // --- Auto-Spin Logic ---
    function startSpinning() {
        if (autoSpinMode && !spinLoop && !isDragging) {
            spinLoop = setInterval(() => {
                currentFrame++;
                if (currentFrame > totalFrames) currentFrame = 1;
                updateImageDisplay();
            }, spinSpeedMs);
        }
    }

    function stopSpinning() {
        clearInterval(spinLoop);
        spinLoop = null;
    }

    function resetIdleTimer() {
        stopSpinning();
        clearTimeout(idleTimer);
        if (autoSpinMode) {
            idleTimer = setTimeout(startSpinning, idleDelayMs);
        }
    }

    function toggleAutoSpinMode() {
        autoSpinMode = !autoSpinMode;
        spinBtns.forEach(btn => {
            if (autoSpinMode) {
                btn.classList.add('active-mode');
                btn.textContent = 'Auto-Spin: ON';
            } else {
                btn.classList.remove('active-mode');
                btn.textContent = 'Auto-Spin: OFF';
            }
        });

        if (autoSpinMode) {
            resetIdleTimer();
        } else {
            stopSpinning();
            clearTimeout(idleTimer);
        }
    }

    spinBtns.forEach(btn => btn.addEventListener('click', toggleAutoSpinMode));
    
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
            e.preventDefault(); 
            toggleAutoSpinMode();
        }
    });


    // =========================================
    // 3. UI GENERATOR & CONTROLLER
    // =========================================
    const robotSelector = document.getElementById('robot-selector');
    const navContainer = document.getElementById('dynamic-nav-container');
    const headerLogo = document.getElementById('header-logo');

    function loadRobotProfile(robotKey) {
        const data = robotDatabase[robotKey];
        if (!data) return;

        if (data.logo) headerLogo.src = data.logo;
        navContainer.innerHTML = '';

        data.subsystems.forEach((sub) => {
            const item = document.createElement('div');
            item.className = 'nav-item';

            const span = document.createElement('span');
            span.className = 'nav-label';
            span.textContent = sub.label;

            const btn = document.createElement('button');
            btn.className = 'nav-btn';
            
            if (sub.useLogo && data.logo) {
                btn.innerHTML = `<img src="${data.logo}" class="nav-logo">`;
            } else {
                btn.textContent = sub.label;
            }

            btn.addEventListener('click', () => {
                navContainer.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const specs = data.specs[sub.id] || { title: sub.label, leftContent: "Data coming soon.", rightContent: "" };
                document.getElementById('panel-title').innerHTML = specs.title;
                document.getElementById('panel-left-content').innerHTML = specs.leftContent;
                document.getElementById('panel-right-content').innerHTML = specs.rightContent;

                loadModelImages(sub.path, sub.frames);
            });

            item.appendChild(span);
            item.appendChild(btn);
            navContainer.appendChild(item);
        });

        // Trigger load for the first subsystem
        const firstBtn = navContainer.querySelector('.nav-btn');
        if (firstBtn) firstBtn.click();
    }

    robotSelector.addEventListener('change', (e) => {
        loadRobotProfile(e.target.value);
    });

    // Start App
    loadRobotProfile(robotSelector.value);


    // =========================================
    // 4. MOBILE DRAWER TOGGLE
    // =========================================
    const toggleMobileBtn = document.getElementById('mobile-info-btn');
    const overlay = document.getElementById('info-overlay');

    if(toggleMobileBtn) {
        toggleMobileBtn.addEventListener('click', () => {
            overlay.classList.toggle('open');
            toggleMobileBtn.textContent = overlay.classList.contains('open') ? 'Close Specs' : 'View Specs';
            
            if(overlay.classList.contains('open')) {
                toggleMobileBtn.style.background = '#FFD700';
                toggleMobileBtn.style.color = '#11151C';
            } else {
                toggleMobileBtn.style.background = '#0078d7';
                toggleMobileBtn.style.color = 'white';
            }
        });
    }
});
