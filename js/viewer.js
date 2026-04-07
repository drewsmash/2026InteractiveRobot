document.addEventListener('DOMContentLoaded', () => {
    const canCreateWebGLContext = (() => {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        } catch (error) { return false; }
    })();

    window.forceHideLoadingScreen = function() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen && loadingScreen.style.display !== 'none') {
            loadingScreen.style.opacity = '0';
            setTimeout(() => { loadingScreen.style.display = 'none'; }, 400);
        }
    };
    
    // =========================================
    // 1. ENGINE OVERRIDE & APPLE MATH KILLER
    // =========================================
    window.imagesLoaded = 0;
    window.totalImagesToLoad = 0; 

    if (typeof AC !== 'undefined' && AC.VR) {
        AC.VR.prototype.updateSizes = function() {};
        AC.VR.prototype.resize = function() {};

        AC.VR.options.introDuration = 2.5; 
        AC.VR.prototype.gotoNextFrame = function() { this.gotoPos([ this.currentPos[0] + 1, this.currentPos[1] ]); };
        AC.VR.prototype.play = function(){
            if (this.playing) return;
            this.playing = true;
            this.playInterval = setInterval(this.gotoNextFrame.bind(this), 85); 
        };

        if (AC.VR.Loader) {
            const originalOnLoad = AC.VR.Loader.prototype.onLoad;
            AC.VR.Loader.prototype.onLoad = function(event) {
                if (originalOnLoad) originalOnLoad.apply(this, arguments);
                if (window.totalImagesToLoad > 0) {
                    window.imagesLoaded++;
                    const progressBar = document.getElementById('progress-fill');
                    const progressText = document.getElementById('progress-text');
                    
                    if (progressBar) {
                        let percent = Math.min(100, Math.round((window.imagesLoaded / window.totalImagesToLoad) * 100));
                        progressBar.style.width = percent + '%';
                        if (progressText) {
                            progressText.innerText = isHDModeEnabled ? 'DOWNLOADING HD ASSETS... ' + percent + '%' : 'DOWNLOADING ASSETS... ' + percent + '%';
                        }
                        if (window.imagesLoaded >= window.totalImagesToLoad) {
                            setTimeout(window.forceHideLoadingScreen, 200);
                        }
                    }
                }
            };
        }
    }

    // =========================================
    // 2. THE FULL ROBOT DATABASE
    // =========================================
    const robotDatabase = {
        "2026_rico": {
            logo: "Rico_logoSingleColorTrans.png",
            subsystems: [
                { 
                    id: "Robot", label: "Main Assembly",useLogo: true,
                    is3D: true,
                    src: "https://raw.githubusercontent.com/drewsmash/2026InteractiveRobot/refs/heads/main/2026ricoV59.glb",
                    //poster: "2026/Robot/images/Frame000014.jpg"
                },
                { 
                    id: "Shooter", label: "Shooter",useLogo: false,
                    is3D: true,
                    src: "https://raw.githubusercontent.com/drewsmash/2026InteractiveRobot/refs/heads/main/2026RicoShooter.glb",
                    //poster: "2026/Shooter/images/Frame000014.jpg"
                },
                { 
                    id: "Tunnel", label: "Tunnel", useLogo: false,
                    is3D: true,
                    src: "https://raw.githubusercontent.com/drewsmash/2026InteractiveRobot/refs/heads/main/2026ricoV5tunnel.glb",
                    //poster: "2026/Tunnel/images/Frame000014.jpg"
                },
                { 
                    id: "Intake", label: "Intake", useLogo: false,
                    is3D: true,
                    src: "https://raw.githubusercontent.com/drewsmash/2026InteractiveRobot/refs/heads/main/2026ricoV5intake.glb",
                    //poster: "2026/Intake/images/Frame000014.jpg"
                },
                { 
                    id: "Indexer", label: "Indexer", useLogo: false,
                    is3D: true,
                    src: "https://raw.githubusercontent.com/drewsmash/2026InteractiveRobot/refs/heads/main/2026ricoV5idexer.glb",
                    //poster: "2026/Indexer/images/Frame000014.jpg"
                },
                { 
                    id: "Chassis", label: "Chassis", useLogo: false,
                    is3D: true,
                    src: "https://raw.githubusercontent.com/drewsmash/2026InteractiveRobot/refs/heads/main/2026ricoV5chassis2.glb",
                    //poster: "2026/Wheel/images/Frame000014.jpg"
                },
                { 
                    id: "Wheel", label: "Swerve Wheel", useLogo: false,
                    is3D: true,
                    src: "https://raw.githubusercontent.com/drewsmash/2026InteractiveRobot/refs/heads/main/2026ricoWheel.glb",
                    //poster: "2026/Wheel/images/Frame000014.jpg"
                }
            ],
            specs: {
                "Robot": {
                    title: "RICO - Main Assembly",
                    leftContent: "<p>Rico's 21.5\" x 33\" chassis is rectangular when stowed, forming a perfect square when the intake is deployed to maximize storage capacity.</p><p>The battery is positioned opposite the turret to maintain a balanced center of gravity.</p>",
                    rightContent: "<ul><li><b>Chassis:</b> 1/8\" thick tubes & belly pan</li><li><b>Steering:</b> WCP X2S Swerve Modules</li><li><b>Cameras:</b> 4x Thrifty Cams</li></ul>"
                },
                "Shooter": {
                    title: "Shooter & Turret",
                    leftContent: "<p>A flywheel mechanism capable of firing approximately 6 balls per second. A rotating turret provides independent horizontal aiming.</p>",
                    rightContent: "<ul><li><b>Turret Motor:</b> 1x Kraken X44</li><li><b>Flywheel Motors:</b> 2x Kraken X60</li></ul>"
                },
                "Tunnel": {
                    title: "Tunnel & Tower",
                    leftContent: "<p>The tunnel collects fuel from the lower indexer section and organizes it into a single horizontal row to prevent jamming.</p>",
                    rightContent: "<ul><li><b>Tunnel Motor:</b> 1x Kraken X60</li><li><b>Surface Speed:</b> 20 ft/s</li></ul>"
                },
                "Intake": {
                    title: "Intake Assembly",
                    leftContent: "<p>A single pivot mechanism designed to gather fuel from the floor immediately after contact to reduce chasing time.</p>",
                    rightContent: "<ul><li><b>Pivot Motor:</b> 1x Kraken X44</li><li><b>Rollers:</b> 2\" HDPE with CatTongue tape</li></ul>"
                },
                "Indexer": {
                    title: "Indexer Mechanism",
                    leftContent: "<p>The indexer transitions fuel from the intake to the tower using a series of downward-inclined, lightweight carbon fiber rods.</p>",
                    rightContent: "<ul><li><b>Roller Motors:</b> Shared with intake</li><li><b>Agitators:</b> Mecanum wheels</li></ul>"
                },
                "Wheel": {
                    title: "Swerve Drivetrain",
                    leftContent: "<p>Features WCP's X2S swerve modules for increased maneuverability and instantaneous directional changes.</p>",
                    rightContent: "<ul><li><b>Module:</b> WCP X2S</li><li><b>Treads:</b> Custom 3D Printed</li></ul>"
                },
                "Chassis": {
                    title: "Chassis",
                    leftContent: "<p>Features WCP's X2S swerve modules for increased maneuverability and instantaneous directional changes.</p>",
                    rightContent: "<ul><li><b>Module:</b> WCP X2S</li><li><b>Treads:</b> Custom 3D Printed</li></ul>"
                }
            }
        },
        "2025_Robot": {
            logo: "Ramtech_logo.png", 
            subsystems: [
                { 
                    id: "Robot", label: "Main Assembly", useLogo: true,
                    is3D: true,
                    src: "https://raw.githubusercontent.com/drewsmash/2026InteractiveRobot/refs/heads/main/fixed2025robot.glb"
                }
            ],
            specs: { "Robot": { title: "2025 Assembly", leftContent: "<p>Placeholder text.</p>", rightContent: "" } }
        },
        "2025OS_Robot": {
            logo: "Ramtech_logo.png", 
            subsystems: [
                {
                    id: "Robot", label: "Main Assembly", useLogo: true,
                    is3D: true,
                    src: "https://raw.githubusercontent.com/drewsmash/2026InteractiveRobot/refs/heads/main/2025OSrobot.glb"
                }
            ],
            specs: { "Robot": { title: "2025 Offseason Assembly", leftContent: "<p>Placeholder text.</p>", rightContent: "" } }
        },
        "2023_Robot": {
            logo: "Ramtech_logo.png", 
            subsystems: [
                {
                    id: "Robot", label: "Main Assembly", useLogo: true,
                    is3D: true,
                    src: "https://raw.githubusercontent.com/drewsmash/2026InteractiveRobot/refs/heads/main/2023robot.glb"
                }
            ],
            specs: { "Robot": { title: "2023 Season Assembly", leftContent: "<p>Placeholder text.</p>", rightContent: "" } }
        },
        "3D_LIVE": {
            logo: "Rico_logoSingleColorTrans.png",
            subsystems: [
                {
                    id: "FullRobot", label: "Full Assembly",
                    is3D: true,
                    src: "https://raw.githubusercontent.com/drewsmash/2026InteractiveRobot/refs/heads/main/rico.glb",
                    poster: "2026/Robot/images/Frame000001.jpg"
                }
            ],
            specs: {
                "FullRobot": {
                    title: "3D Interactive Model",
                    leftContent: "<p>Explore the fully interactive 3D model of our robot.</p><p>Use your mouse or touch to rotate, zoom, and pan around the assembly.</p>",
                    rightContent: "<ul><li><b>Rotate:</b> Left Click + Drag</li><li><b>Zoom:</b> Mouse Wheel</li><li><b>Pan:</b> Right Click + Drag</li></ul>"
                }
            }
        }
      }; 

    // =========================================
    // 3. NATIVE 3D PROGRESS BAR EVENT LISTENER
    // =========================================
    const onProgress = (event) => {
        const progressBar = event.target.querySelector('.progress-bar');
        const updatingBar = event.target.querySelector('.update-bar');
        if (updatingBar) updatingBar.style.width = `${event.detail.totalProgress * 100}%`;
        
        // CRITICAL FIX: Wait until progress reaches 100% to hide the geometric spinner!
        if (event.detail.totalProgress === 1) {
            if (progressBar) progressBar.classList.add('hide');
            
            const spinner3d = document.getElementById('spinner-3d');
            if (spinner3d) spinner3d.style.display = 'none';
            
            event.target.removeEventListener('progress', onProgress);
        } else {
            if (progressBar) progressBar.classList.remove('hide');
        }
    };

    // =========================================
    // 4. STATE TRACKING & DYNAMIC LOADER
    // =========================================
    let currentActiveSubsystem = null;
    let isHDModeEnabled = false;

    const robotSelector = document.getElementById('robot-selector');
    const navContainer = document.getElementById('dynamic-nav-container');
    const headerLogo = document.getElementById('header-logo');
    const hdBtns = [document.getElementById('btn-hd-desktop'), document.getElementById('btn-hd-mobile')];
    const spinBtns = [document.getElementById('btn-spin-desktop'), document.getElementById('btn-spin-mobile')];
    const arMobileBtn = document.getElementById('btn-ar-mobile');

    function executeModelLoad(sub) {
        currentActiveSubsystem = sub;
        const isMobile = window.innerWidth <= 768;
        
        const v2d = document.getElementById('viewer');
        const v3d = document.getElementById('viewer-3d');
        const spinner3d = document.getElementById('spinner-3d');
        const modelElement = document.getElementById('model-element');

        if (sub.is3D) {
            // HIDE 2D, SHOW 3D
            if (v2d) v2d.style.display = 'none';
            if (v3d) v3d.style.display = 'flex'; 
                
            hdBtns.forEach(btn => { if(btn) btn.style.display = 'none'; });
            
            // Show AR Button ONLY on Mobile
            if (arMobileBtn) arMobileBtn.style.display = '';
                
            if (modelElement) {
                if (!canCreateWebGLContext) {
                    if (spinner3d) {
                        spinner3d.style.display = 'flex';
                        spinner3d.innerHTML = `<div class="loader-text" style="color: #ffaa00;">WEBGL UNAVAILABLE</div>`;
                    }
                    return;
                }

                if (autoSpinMode) modelElement.setAttribute('auto-rotate', '');
                else modelElement.removeAttribute('auto-rotate');
                
                // Avoid reloading if it's already the active model
                if (modelElement.src !== sub.src) {
                    // Turn the geometric spinner ON before the new model loads
                    if (spinner3d) spinner3d.style.display = 'flex';

                    const progressBar = modelElement.querySelector('.progress-bar');
                    const updatingBar = modelElement.querySelector('.update-bar');
                    if (progressBar) progressBar.classList.remove('hide');
                    if (updatingBar) updatingBar.style.width = '0%';

                    modelElement.addEventListener('progress', onProgress);
                    modelElement.poster = sub.poster || "";
                    modelElement.src = sub.src;
                }
            }
        } else {
            // HIDE 3D, SHOW 2D
            if (v3d) v3d.style.display = 'none';
            if (v2d) v2d.style.display = 'flex';
            
            hdBtns.forEach(btn => { if(btn) btn.style.display = ''; });
            spinBtns.forEach(btn => { if(btn) btn.style.display = ''; });
            
            // Hide AR button when on 2D view
            if (arMobileBtn) arMobileBtn.style.display = 'none';

            let targetPath = (isMobile && sub.mobilePath) ? sub.mobilePath : sub.path;
            let targetFrames = (isMobile && sub.mobileFrames) ? sub.mobileFrames : sub.frames;
            let targetExt = (isMobile && sub.mobileExt) ? sub.mobileExt : (sub.ext || ".jpg");

            if (isHDModeEnabled && sub.hdPath) {
                targetPath = sub.hdPath;
                targetFrames = sub.hdFrames;
                targetExt = sub.hdExt || targetExt;
            }

            window.imagesLoaded = 0;
            window.totalImagesToLoad = targetFrames[0] * targetFrames[1]; 
            
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) {
                loadingScreen.style.display = 'flex';
                loadingScreen.style.opacity = '1';
            }

            if (typeof threeSixty !== 'undefined' && threeSixty.loadModel) {
                threeSixty.loadModel(targetPath, targetFrames, [false, false], targetExt);
            }
        }
    }

    function loadRobotProfile(robotKey) {
        const data = robotDatabase[robotKey];
        if (!data) return;

        if (data.logo) headerLogo.src = data.logo;
        navContainer.innerHTML = '';

        // Center Align if only 1 Subsystem is present
        if (data.subsystems.length === 1) {
            navContainer.classList.add('single-item');
        } else {
            navContainer.classList.remove('single-item');
        }

        data.subsystems.forEach((sub) => {
            const btn = document.createElement('button');
            btn.className = 'nav-btn';
            btn.textContent = sub.label;

            btn.addEventListener('click', () => {
                document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const specs = data.specs[sub.id] || { title: sub.label, leftContent: "Data coming soon.", rightContent: "" };
                document.getElementById('panel-title').innerHTML = specs.title;
                document.getElementById('panel-left-content').innerHTML = specs.leftContent;
                document.getElementById('panel-right-content').innerHTML = specs.rightContent;

                executeModelLoad(sub);
            });
            navContainer.appendChild(btn);
        });

        if (navContainer.querySelector('.nav-btn')) navContainer.querySelector('.nav-btn').click();
    }

    robotSelector.addEventListener('change', (e) => {
        loadRobotProfile(e.target.value);
    });

    // HD Toggle logic
    hdBtns.forEach(btn => {
        if(btn) btn.addEventListener('click', () => {
            isHDModeEnabled = !isHDModeEnabled;
            hdBtns.forEach(b => {
                if(isHDModeEnabled) b.classList.add('active-mode'); else b.classList.remove('active-mode');
                b.textContent = b.id.includes('desktop') ? (isHDModeEnabled ? 'HD: ON' : 'HD: OFF') : 'HD';
            });
            if (currentActiveSubsystem) executeModelLoad(currentActiveSubsystem);
        });
    });

    // Auto-Spin logic
    let autoSpinMode = false;
    spinBtns.forEach(btn => btn.addEventListener('click', () => {
        autoSpinMode = !autoSpinMode;
        spinBtns.forEach(b => {
            b.textContent = autoSpinMode ? 'Auto-Spin: ON' : 'Auto-Spin: OFF';
            if(autoSpinMode) b.classList.add('active-mode'); else b.classList.remove('active-mode');
        });
        
        if (autoSpinMode && typeof threeSixty !== 'undefined' && threeSixty._vr) threeSixty._vr.play();
        else if (typeof threeSixty !== 'undefined' && threeSixty._vr) threeSixty._vr.pause();
        
        const modelElement = document.getElementById('model-element');
        if (modelElement) {
            if (autoSpinMode) modelElement.setAttribute('auto-rotate', '');
            else modelElement.removeAttribute('auto-rotate');
        }
    }));

    // Safe AR Button Handoff
    if (arMobileBtn) {
        arMobileBtn.addEventListener('click', () => {
            const realArBtn = document.getElementById('real-ar-btn');
            if (realArBtn) {
                realArBtn.click();
            }
        });
    }

    // Start-up sequence
    window.addEventListener('load', () => {
        if (typeof threeSixty !== 'undefined') {
            threeSixty.init = function() {}; 
            loadRobotProfile(robotSelector.value);
        }
    });

    // Mobile drawer
    const toggleMobileBtn = document.getElementById('mobile-info-btn');
    const overlay = document.getElementById('info-overlay');
    if(toggleMobileBtn) {
        toggleMobileBtn.addEventListener('click', () => {
            overlay.classList.toggle('open');
            toggleMobileBtn.textContent = overlay.classList.contains('open') ? 'Close Specs' : 'View Specs';
        });
    }
});
