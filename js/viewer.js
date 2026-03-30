document.addEventListener('DOMContentLoaded', () => {

    // =========================================
    // 1. ENGINE OVERRIDE & FLICKER FIX
    // =========================================
    if (typeof AC !== 'undefined' && AC.VR) {
        AC.VR.options.introDuration = 2.5; 
        
        AC.VR.prototype.gotoNextFrame = function() {
            this.gotoPos([ this.currentPos[0] + 1, this.currentPos[1] ]);
        };
        
        AC.VR.prototype.play = function(){
            if (this.playing) return;
            this.playing = true;
            this.playInterval = setInterval(this.gotoNextFrame.bind(this), 85); 
        };

        // DOM Thrashing Fix (Smooth Rotation)
        AC.VR.prototype.gotoPos = function(pos, force) {
            pos = this.validatePos(pos);
            if (!force && this.atPosition(pos)) return;
            this.currentPos = pos;

            this.frame = this.frames[pos[0]][pos[1]];
            if (typeof this.frame !== 'undefined' && this.frame.nodeType) {
                if (!this.masterImage) {
                    this.masterImage = document.createElement('img');
                    this.masterImage.style.width = '100%';
                    this.masterImage.style.height = '100%';
                    this.masterImage.style.objectFit = 'contain';
                    this.masterImage.draggable = false;
                    
                    this.vr.innerHTML = ''; 
                    this.vr.appendChild(this.masterImage);
                    this.currentFrame = this.masterImage; 
                }

                if (this.masterImage.src !== this.frame.src) {
                    this.masterImage.src = this.frame.src;
                }
            } else {
                this.loader.loadNow(pos);
            }
        };
    }

    // =========================================
    // NEW: BULLETPROOF MEMORY MONITOR (LOADING BAR)
    // =========================================
    setInterval(() => {
        const loadingScreen = document.getElementById('loading-screen');
        const progressBar = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');

        // Only run the math if the loading screen is currently visible
        if (loadingScreen && loadingScreen.style.display !== 'none' && typeof threeSixty !== 'undefined' && threeSixty._vr && threeSixty._vr.frames) {
            
            let loadedImages = 0;
            let totalImages = threeSixty._vr.totalFrames[0] * (threeSixty._vr.totalFrames[1] || 1);

            // Count how many images actually exist inside the 3D Engine's memory array
            for (let x = 0; x < threeSixty._vr.totalFrames[0]; x++) {
                if (threeSixty._vr.frames[x]) {
                    for (let y = 0; y < (threeSixty._vr.totalFrames[1] || 1); y++) {
                        // .nodeType ensures it's a real HTML image, not just a blank placeholder
                        if (threeSixty._vr.frames[x][y] && threeSixty._vr.frames[x][y].nodeType) {
                            loadedImages++;
                        }
                    }
                }
            }

            // Update the UI
            let percent = Math.min(100, Math.round((loadedImages / totalImages) * 100));
            if (progressBar) progressBar.style.width = percent + '%';
            if (progressText) progressText.innerText = 'DOWNLOADING HD ASSETS... ' + percent + '%';

            // If we hit 100%, hide the loading screen!
            if (loadedImages >= totalImages && totalImages > 0) {
                setTimeout(() => {
                    loadingScreen.style.opacity = '0';
                    setTimeout(() => { loadingScreen.style.display = 'none'; }, 400);
                }, 200);
            }
        }
    }, 50); // Checks the memory 20 times a second


    // =========================================
    // 2. THE MULTI-YEAR DATABASE
    // =========================================
    const robotDatabase = {
        "2026_rico": {
            logo: "Rico_logoSingleColorTrans.png",
            subsystems: [
                { id: "Robot", label: "Main Assembly", path: "2026/Robot/images", frames: [30, 8], useLogo: true },
                { id: "Shooter", label: "Shooter", path: "2026/Shooter/images", frames: [30, 8], useLogo: false },
                { id: "Tunnel", label: "Tunnel", path: "2026/Tunnel/images", frames: [30, 8], useLogo: false },
                { id: "Intake", label: "Intake", path: "2026/Intake/images", frames: [30, 8], useLogo: false },
                { id: "Indexer", label: "Indexer", path: "2026/Indexer/images", frames: [30, 8], useLogo: false },
                { id: "Wheel", label: "Swerve Wheel", path: "2026/Wheel/images", frames: [30, 8], useLogo: false }
            ],
            specs: {
                "Robot": { title: "RICO - Main Assembly", leftContent: "<p>Rico's 21.5\" x 33\" chassis.</p>", rightContent: "<ul><li><b>Chassis:</b> 1/8\" thick tubes</li></ul>" }
            }
        },
        "2025_offseason": {
            logo: "Ramtech_logo.png", 
            subsystems: [
                { id: "Robot", label: "Main Assembly", path: "2025/Robot/images", frames: [30, 8], useLogo: false }
            ],
            specs: {
                "Robot": { title: "2025 Offseason Assembly", leftContent: "<p>Placeholder text.</p>", rightContent: "<ul><li><b>Chassis:</b> TBD</li></ul>" }
            }
        },
        "2023_robot": {
            logo: "Ramtech_logo.png", 
            subsystems: [
                { id: "Robot", label: "Main Assembly", path: "2023/Robot/images", frames: [36, 8], useLogo: false }
            ],
            specs: {
                "Robot": { title: "2023 Robot", leftContent: "<p>2023 Season Robot Details.</p>", rightContent: "<ul><li><b>Drive:</b> Swerve</li></ul>" }
            }
        }
    };


    // =========================================
    // 3. DYNAMIC UI GENERATOR
    // =========================================
    const robotSelector = document.getElementById('robot-selector');
    const navContainer = document.getElementById('dynamic-nav-container');
    const headerLogo = document.getElementById('header-logo');

    if (!robotSelector.querySelector('option[value="2023_robot"]')) {
        const opt = document.createElement('option');
        opt.value = "2023_robot";
        opt.textContent = "2023 Robot";
        robotSelector.appendChild(opt);
    }

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

                // Reset and Show Loading Screen
                const loadingScreen = document.getElementById('loading-screen');
                const progressFill = document.getElementById('progress-fill');
                const progressText = document.getElementById('progress-text');
                
                if (loadingScreen && progressFill && progressText) {
                    progressFill.style.width = '0%';
                    progressText.innerText = 'DOWNLOADING HD ASSETS... 0%';
                    loadingScreen.style.display = 'flex';
                    loadingScreen.offsetHeight; 
                    loadingScreen.style.opacity = '1';
                }

                if (typeof threeSixty !== 'undefined' && threeSixty.loadModel) {
                    setTimeout(() => {
                        threeSixty.loadModel(sub.path, sub.frames, [false, false]);
                    }, 50);
                }

                if (autoSpinMode) resetIdleTimer();
            });

            item.appendChild(span);
            item.appendChild(btn);
            navContainer.appendChild(item);
        });

        const firstBtn = navContainer.querySelector('.nav-btn');
        if (firstBtn) firstBtn.click();
    }

    robotSelector.addEventListener('change', (e) => {
        loadRobotProfile(e.target.value);
    });


    // =========================================
    // 4. SAFE EXTERNAL AUTO-SPIN 
    // =========================================
    const spinBtns = document.querySelectorAll('.btn-spin');
    const viewerContainer = document.getElementById('viewer');
    
    let autoSpinMode = false; 
    let idleTimer = null;
    const idleDelay = 8000; 

    function startSpinning() {
        if (autoSpinMode && typeof threeSixty !== 'undefined' && threeSixty._vr) {
            if (threeSixty._vr.grabbing) resetIdleTimer();
            else threeSixty._vr.play(); 
        }
    }

    function stopSpinning() {
        if (typeof threeSixty !== 'undefined' && threeSixty._vr) {
            threeSixty._vr.pause(); 
            if (threeSixty._vr.onGrabStart) threeSixty._vr.onGrabStart.playing = false; 
        }
    }

    function resetIdleTimer() {
        stopSpinning();
        clearTimeout(idleTimer);
        if (autoSpinMode) idleTimer = setTimeout(startSpinning, idleDelay);
    }

    function toggleAutoSpinMode() {
        autoSpinMode = !autoSpinMode;
        spinBtns.forEach(btn => {
            if (autoSpinMode) { btn.classList.add('active-mode'); btn.textContent = 'Auto-Spin: ON'; } 
            else { btn.classList.remove('active-mode'); btn.textContent = 'Auto-Spin: OFF'; }
        });
        if (autoSpinMode) resetIdleTimer();
        else { stopSpinning(); clearTimeout(idleTimer); }
    }

    let initCheck = setInterval(() => {
        if (typeof threeSixty !== 'undefined' && threeSixty._vr) {
            clearInterval(initCheck);
            loadRobotProfile(robotSelector.value);
        }
    }, 250);

    ['mousedown', 'touchstart', 'wheel'].forEach(evt => {
        viewerContainer.addEventListener(evt, (e) => {
            if (e.isTrusted && autoSpinMode) resetIdleTimer();
        }, { passive: true, capture: true });
    });

    spinBtns.forEach(btn => btn.addEventListener('click', toggleAutoSpinMode));

    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault(); 
            toggleAutoSpinMode();
        }
    });

    // =========================================
    // 5. MOBILE DRAWER TOGGLE
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
