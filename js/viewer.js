document.addEventListener('DOMContentLoaded', () => {

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
        // PERMANENT FIX: This stops Apple from injecting janky pixel offsets
        AC.VR.prototype.updateSizes = function() {};
        AC.VR.prototype.resize = function() {};
        
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
                    const loadingScreen = document.getElementById('loading-screen');
                    
                    if (progressBar && loadingScreen && loadingScreen.style.display !== 'none') {
                        let percent = Math.min(100, Math.round((window.imagesLoaded / window.totalImagesToLoad) * 100));
                        progressBar.style.width = percent + '%';
                        if (progressText) progressText.innerText = 'DOWNLOADING ASSETS... ' + percent + '%';
                        if (window.imagesLoaded >= window.totalImagesToLoad) {
                            setTimeout(window.forceHideLoadingScreen, 200);
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
                { id: "Robot", label: "Main Assembly", path: "2026/Robot/images", frames: [30, 8], ext: ".jpg", hdPath: "2026/Robot/HD/images", hdFrames: [90, 8], hdExt: ".webp", useLogo: true }
            ],
            specs: { "Robot": { title: "RICO - Main Assembly", leftContent: "<p>Standard robot specs.</p>", rightContent: "<ul><li>1/8 inch tubes</li></ul>" } }
        }
    };

    let currentActiveSubsystem = null;
    let isHDModeEnabled = false;

    const robotSelector = document.getElementById('robot-selector');
    const navContainer = document.getElementById('dynamic-nav-container');

    function executeModelLoad(sub) {
        currentActiveSubsystem = sub;
        const isMobile = window.innerWidth <= 768;
        let targetPath = (isMobile && sub.mobilePath) ? sub.mobilePath : sub.path;
        let targetFrames = (isMobile && sub.mobileFrames) ? sub.mobileFrames : sub.frames;
        let targetExt = (isMobile && sub.mobileExt) ? sub.mobileExt : sub.ext;

        if (isHDModeEnabled && sub.hdPath) {
            targetPath = sub.hdPath;
            targetFrames = sub.hdFrames;
            targetExt = sub.hdExt || targetExt;
        }

        window.imagesLoaded = 0;
        window.totalImagesToLoad = targetFrames[0] * targetFrames[1]; 
        
        document.getElementById('loading-screen').style.display = 'flex';
        document.getElementById('loading-screen').style.opacity = '1';

        if (typeof threeSixty !== 'undefined' && threeSixty.loadModel) {
            threeSixty.loadModel(targetPath, targetFrames, [false, false], targetExt);
        }
    }

    function loadRobotProfile(robotKey) {
        const data = robotDatabase[robotKey];
        if (!data) return;
        navContainer.innerHTML = '';
        data.subsystems.forEach((sub) => {
            const btn = document.createElement('button');
            btn.className = 'nav-btn';
            btn.textContent = sub.label;
            btn.addEventListener('click', () => {
                document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                executeModelLoad(sub);
            });
            navContainer.appendChild(btn);
        });
        navContainer.querySelector('.nav-btn').click();
    }

    robotSelector.addEventListener('change', (e) => loadRobotProfile(e.target.value));

    // HD Toggle logic
    const hdBtns = [document.getElementById('btn-hd-desktop'), document.getElementById('btn-hd-mobile')];
    hdBtns.forEach(btn => {
        if(btn) btn.addEventListener('click', () => {
            isHDModeEnabled = !isHDModeEnabled;
            btn.classList.toggle('active-mode');
            if (currentActiveSubsystem) executeModelLoad(currentActiveSubsystem);
        });
    });

    let initCheck = setInterval(() => {
        if (typeof threeSixty !== 'undefined' && threeSixty._vr) {
            clearInterval(initCheck);
            loadRobotProfile(robotSelector.value);
        }
    }, 250);
});
