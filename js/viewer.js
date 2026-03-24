/*!
 * SOLIDWORKS Visualize (Pre)Viewer - Optimized for Scaling
 */

(function Viewer() {
    const viewer = document.querySelector('#viewer');
    const viewerParent = viewer ? viewer.parentElement : null;

    var btnActual = document.getElementById('btn-actual');
    var btnFit = document.getElementById('btn-fit');

    let shouldFitOnResize = true;
    
    // 1. Handle "Actual Size" Button
    if (btnActual) {
        btnActual.addEventListener('click', function () {
            const imgs = document.querySelectorAll('#viewer img');
            if (imgs.length === 0) return;
            
            // Set to original render resolution
            const actualWidth = imgs[0].naturalWidth;
            const actualHeight = imgs[0].naturalHeight;

            viewer.style.width = `${actualWidth}px`;
            viewer.style.height = `${actualHeight}px`;
            viewer.style.maxWidth = 'none';
            viewer.style.maxHeight = 'none';

            shouldFitOnResize = false;
            viewer.style.resize = "both";
           
            btnActual.classList.add("hidden");
            if (btnFit) btnFit.classList.remove("hidden");
        });
    }
    
    // 2. Handle "Fit to Screen" Button
    if (btnFit) {
        btnFit.addEventListener('click', function () {
            shouldFitOnResize = true;
            FitToScreen();
            viewer.style.resize = "none";
            btnFit.classList.add("hidden");
            if (btnActual) btnActual.classList.remove("hidden");
        });
    }

    // 3. Navigation for different models
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            navButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            const modelTarget = this.getAttribute('data-model');
            const frames = JSON.parse(this.getAttribute('data-frames') || '[30, 8]');
            const invert = JSON.parse(this.getAttribute('data-invert') || '[false, false]');
            
            const headerTitle = document.querySelector('.project-name');
            if (headerTitle) {
                headerTitle.textContent = "Viewing " + this.textContent;
            }
            
            // Reset to fit-to-screen mode when switching models
            shouldFitOnResize = true;
            if (btnFit) btnFit.classList.add("hidden");
            if (btnActual) btnActual.classList.remove("hidden");
            FitToScreen();
            
            if (modelTarget && typeof threeSixty !== 'undefined') {
                threeSixty.loadModel(modelTarget, frames, invert);
            }
        });
    });

    // 4. The "Good Size" Logic
    function FitToScreen() {
        if (!viewer) return;
        
        // Remove fixed pixel widths so CSS 'object-fit' and 'flex-grow' 
        // can make the image fill the available space.
        viewer.style.width = '100%';
        viewer.style.height = '100%';
        viewer.style.maxWidth = '100%';
        viewer.style.maxHeight = '100%';
    }

    // 5. Handle Window Resize
    var viewerResizeObserver = new ResizeObserver(function (entries) {
        if (!shouldFitOnResize) return;
        FitToScreen();
    });

    if (viewerParent) {
        viewerResizeObserver.observe(viewerParent);
    }

})();