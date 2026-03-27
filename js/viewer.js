document.addEventListener('DOMContentLoaded', () => {

    // =========================================
    // 1. ENGINE OVERRIDE & LOADING INTERCEPTOR
    // =========================================
    window.imagesLoaded = 0;
    window.totalImagesToLoad = 240; 

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

        // THE FIX: We must intercept Apple's "onLoad" function, not "imageDidLoad"!
        if (AC.VR.Loader) {
            const originalOnLoad = AC.VR.Loader.prototype.onLoad;
            
            AC.VR.Loader.prototype.onLoad = function(event) {
                // 1. Run Apple's original code so the image actually gets added to the 3D engine
                if (originalOnLoad) originalOnLoad.apply(this, arguments);
                
                // 2. Run our Custom Loading Bar logic
                if (window.totalImagesToLoad > 0) {
                    window.imagesLoaded++;
                    
                    const progressBar = document.getElementById('progress-fill');
                    const progressText = document.getElementById('progress-text');
                    const loadingScreen = document.getElementById('loading-screen');
                    
                    if (progressBar && loadingScreen && loadingScreen.style.display !== 'none') {
                        let percent = Math.min(100, Math.round((window.imagesLoaded / window.totalImagesToLoad) * 100));
                        progressBar.style.width = percent + '%';
                        progressText.innerText = 'DOWNLOADING HD ASSETS... ' + percent + '%';
                        
                        // When fully loaded, hide the black screen to reveal the images!
                        if (window.imagesLoaded >= window.totalImagesToLoad) {
                            setTimeout(() => {
                                loadingScreen.style.opacity = '0';
                                setTimeout(() => { loadingScreen.style.display = 'none'; }, 400);
                            }, 200);
                        }
                    }
                }
            };
        }
    }


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
                { id: "Robot", label: "Main Assembly", path: "2025Off/Robot/images", frames: [30, 8], useLogo: false }
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
    // 3. DYNAMIC UI GENERATOR
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

                window.imagesLoaded = 0;
                window.totalImagesToLoad = sub.frames[0] * sub.frames[1];
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
            if (threeSixty._vr.grabbing) {
                resetIdleTimer();
            } else {
                threeSixty._vr.play(); 
            }
        }
    }

    function stopSpinning() {
        if (typeof threeSixty !== 'undefined' && threeSixty._vr) {
            threeSixty._vr.pause(); 
            if (threeSixty._vr.onGrabStart) {
                threeSixty._vr.onGrabStart.playing = false; 
            }
        }
    }

    function resetIdleTimer() {
        stopSpinning();
        clearTimeout(idleTimer);
        if (autoSpinMode) {
            idleTimer = setTimeout(startSpinning, idleDelay);
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

    let initCheck = setInterval(() => {
        if (typeof threeSixty !== 'undefined' && threeSixty._vr) {
            clearInterval(initCheck);
            loadRobotProfile(robotSelector.value);
        }
    }, 250);

    ['mousedown', 'touchstart', 'wheel'].forEach(evt => {
        viewerContainer.addEventListener(evt, (e) => {
            if (e.isTrusted && autoSpinMode) {
                resetIdleTimer();
            }
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