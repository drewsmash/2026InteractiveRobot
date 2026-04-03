document.addEventListener('DOMContentLoaded', () => {
    const canCreateWebGLContext = (() => {
        try {
            const canvas = document.createElement('canvas');
            return !!(
                window.WebGLRenderingContext &&
                (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
            );
        } catch (error) {
            return false;
        }
    })();

    window.forceHideLoadingScreen = function() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen && loadingScreen.style.display !== 'none') {
            loadingScreen.style.opacity = '0';
            setTimeout(() => { loadingScreen.style.display = 'none'; }, 400);
        }
    };
    
    // =========================================
    // 1. ENGINE OVERRIDE (SAFE VERSION)
    // =========================================
    window.imagesLoaded = 0;
    window.totalImagesToLoad = 0; 
    window.loadingFailsafe = null; 

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
                { id: "Robot", label: "Main Assembly", path: "2026/Robot/images", frames: [30, 8], ext: ".jpg", hdPath: "2026/Robot/HD/images", hdFrames: [90, 8], hdExt: ".webp", useLogo: true },
                { id: "Shooter", label: "Shooter", path: "2026/Shooter/images", frames: [30, 8], ext: ".jpg", useLogo: false },
                { id: "Tunnel", label: "Tunnel", path: "2026/Tunnel/images", frames: [30, 8], ext: ".jpg", useLogo: false },
                { id: "Intake", label: "Intake", path: "2026/Intake/images", frames: [30, 8], ext: ".jpg", useLogo: false },
                { id: "Indexer", label: "Indexer", path: "2026/Indexer/images", frames: [30, 8], ext: ".jpg", useLogo: false },
                { id: "Wheel", label: "Swerve Wheel", path: "2026/Wheel/images", frames: [30, 8], ext: ".jpg", useLogo: false }
            ],
            specs: {
                "Robot": {
                    title: "RICO - Main Assembly",
                    leftContent: "<p>Rico's 21.5\" x 33\" chassis is rectangular when stowed, forming a perfect square when the intake is deployed to maximize storage capacity.</p><p>The battery is positioned opposite the turret to maintain a balanced center of gravity, utilizing vertical 1x1 tubes for unobstructed camera placement.</p>",
                    rightContent: "<ul><li><b>Chassis:</b> 1/8\" thick tubes & belly pan</li><li><b>Steering:</b> WCP X2S Swerve Modules</li><li><b>Deflectors:</b> 1/16\" polycarb plates</li><li><b>Cameras:</b> 4x ArduCam OV9281</li></ul>"
                },
                "Shooter": {
                    title: "Shooter & Turret",
                    leftContent: "<p>A flywheel mechanism capable of firing approximately 6 balls per second. A rotating turret provides independent horizontal aiming.</p><p>Adjustable hood and flywheel speeds control the launch angle and distance, improving accuracy from anywhere on the field.</p>",
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
                { id: "Robot", label: "Main Assembly", path: "2025Off/Robot/images", frames: [38, 8], ext: ".jpg", useLogo: false }
            ],
            specs: {
                "Robot": {
                    title: "2025 Offseason Assembly",
                    leftContent: "<p>Placeholder text for the 2025 offseason robot.</p>",
                    rightContent: "<ul><li><b>Chassis:</b> TBD</li><li><b>Drive:</b> TBD</li></ul>"
                }
            }
        },
        "2023_Robot": {
            logo: "Ramtech_logo.png", 
            subsystems: [
                { 
                    id: "Robot", label: "Main Assembly", path: "2023/Robot/images", frames: [38, 8], ext: ".jpg",
                    mobilePath: "2023/Robot/Mobile/images", mobileFrames: [36, 1], mobileExt: ".jpg", useLogo: false 
                }
            ],
            specs: {
                "Robot": {
                    title: "2023 Season Assembly",
                    leftContent: "<p>Placeholder text for the 2023 robot.</p>",
                    rightContent: "<ul><li><b>Chassis:</b> TBD</li><li><b>Drive:</b> TBD</li></ul>"
                }
            }
        },
        "3D_LIVE": {
            logo: "Rico_logoSingleColorTrans.png",
            subsystems: [
                {
                    id: "FullRobot",
                    label: "Full Assembly",
                    is3D: true,
                    src: "https://github.com/drewsmash/2026InteractiveRobot/raw/refs/heads/main/rico1.glb",
                    srcCandidates: ["rico2.glb", "rico1.glb", "https://github.com/drewsmash/2026InteractiveRobot/raw/refs/heads/main/rico.glb"]
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
    // 3. STATE TRACKING & DYNAMIC LOADER
    // =========================================
    let currentActiveSubsystem = null;
    let isHDModeEnabled = false;

    const robotSelector = document.getElementById('robot-selector');
    const navContainer = document.getElementById('dynamic-nav-container');
    const headerLogo = document.getElementById('header-logo');
    const hdBtns = [document.getElementById('btn-hd-desktop'), document.getElementById('btn-hd-mobile')];
    const spinBtns = [document.getElementById('btn-spin-desktop'), document.getElementById('btn-spin-mobile')];

    async function executeModelLoad(sub) {
        currentActiveSubsystem = sub;
        const isMobile = window.innerWidth <= 768;
        
        const v2d = document.getElementById('viewer');
        const v3d = document.getElementById('viewer-3d');
        const spinner3d = document.getElementById('spinner-3d');
        const modelElement = document.getElementById('model-element');

        if (sub.is3D) {
            if (v2d) v2d.style.display = 'none';
            if (v3d) {
                v3d.style.display = 'flex';
                if (spinner3d) spinner3d.style.display = 'flex';
                
                hdBtns.forEach(btn => { if(btn) btn.style.display = 'none'; });
                
                if (modelElement) {
                    if (spinner3d) spinner3d.innerHTML = '<div class="loader-circle"></div><div class="loader-text">LOADING 3D ENVIRONMENT...</div>';

                    if (window.modelViewerReady) await window.modelViewerReady;
                    if (typeof customElements !== 'undefined') await customElements.whenDefined('model-viewer');

                    if (spinner3d) spinner3d.style.display = 'none';

                    const onModelProgress = (event) => {
                        const progress = event.detail.totalProgress;
                        const updateBar = modelElement.querySelector('.update-bar');
                        if (updateBar) {
                            updateBar.style.width = `${progress * 100}%`;
                        }
                        if (progress >= 1) {
                            // Safety timeout: If progress finishes but the load event gets stuck, force hide
                            setTimeout(() => {
                                const progressBar = modelElement.querySelector('.progress-bar');
                                if (progressBar) progressBar.classList.add('hide');
                            }, 400);
                        }
                    };

                    const onModelLoad = () => {
                        const progressBar = modelElement.querySelector('.progress-bar');
                        if (progressBar) progressBar.classList.add('hide');
                        modelElement.removeEventListener('progress', onModelProgress);
                    };
                    
                    const targetSrc = sub.src;

                    if (autoSpinMode) modelElement.setAttribute('auto-rotate', '');
                    else modelElement.removeAttribute('auto-rotate');
                    
                    // If this exact source is already loading or loaded, don't reset it
                    const currentUrlObj = new URL(modelElement.src || "about:blank", window.location.href);
                    const targetUrlObj = new URL(targetSrc, window.location.href);
                    
                    if (currentUrlObj.href === targetUrlObj.href) {
                        if (modelElement.loaded || modelElement.modelIsVisible) {
                            const updateBar = modelElement.querySelector('.update-bar');
                            if (updateBar) updateBar.style.width = '100%';
                            const progressBar = modelElement.querySelector('.progress-bar');
                            if (progressBar) progressBar.classList.add('hide');

                            onModelLoad();
                        } else {
                            modelElement.addEventListener('progress', onModelProgress);
                            modelElement.addEventListener('load', onModelLoad, { once: true });
                        }
                        return;
                    }

                    const updateBar = modelElement.querySelector('.update-bar');
                    if (updateBar) updateBar.style.width = '0%';
                    
                    const progressBar = modelElement.querySelector('.progress-bar');
                    if (progressBar) progressBar.classList.remove('hide');

                    modelElement.removeAttribute('src');
                    modelElement.addEventListener('progress', onModelProgress);
                    modelElement.addEventListener('load', onModelLoad, { once: true });
                    
                    modelElement.src = targetSrc;
                }
            }
        } else {
            if (v3d) v3d.style.display = 'none';
            if (v2d) v2d.style.display = 'flex';
            
            hdBtns.forEach(btn => { if(btn) btn.style.display = ''; });
            spinBtns.forEach(btn => { if(btn) btn.style.display = ''; });

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

        data.subsystems.forEach((sub) => {
            const btn = document.createElement('button');
            btn.className = 'nav-btn';
            btn.textContent = sub.label;

            btn.addEventListener('click', () => {
                document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Update Spec Panels
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

    // Toggle 2D/3D
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
        
        // Connect Spin to 3D Viewer
        const modelElement = document.getElementById('model-element');
        if (modelElement) {
            if (autoSpinMode) modelElement.setAttribute('auto-rotate', '');
            else modelElement.removeAttribute('auto-rotate');
        }
    }));

    // =========================================
    // 7. START-UP SEQUENCE (RICO FIX)
    // =========================================
    
    // We wait for the entire window to load so we don't trip over Apple's engine
    window.addEventListener('load', () => {
        if (typeof threeSixty !== 'undefined') {
            
            // KILLER: We overwrite threesixty.js's default init function 
            // so it stops randomly blanking out the screen on page load!
            threeSixty.init = function() {}; 
            
            // Now we safely load Rico
            loadRobotProfile(robotSelector.value);
        }
    });

    // Mobile drawer logic remains the same
    const toggleMobileBtn = document.getElementById('mobile-info-btn');
    const overlay = document.getElementById('info-overlay');
    if(toggleMobileBtn) {
        toggleMobileBtn.addEventListener('click', () => {
            overlay.classList.toggle('open');
            toggleMobileBtn.textContent = overlay.classList.contains('open') ? 'Close Specs' : 'View Specs';
        });
    }
});
