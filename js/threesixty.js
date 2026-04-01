var threeSixty = {
    currentModel: '',
    currentFrames: [], // <-- Removed hardcoded [30, 8]
    currentInvert: [false, false],
    _vr: null,

    init: function () {
        var firstButton = document.querySelector('.nav-btn');
        if (firstButton && !this._vr) {
            var defaultModel = firstButton.getAttribute('data-model');
            var defaultFrames = firstButton.getAttribute('data-frames');
            var defaultInvert = firstButton.getAttribute('data-invert');
            
            if (defaultModel) this.currentModel = defaultModel;
            if (defaultFrames) this.currentFrames = JSON.parse(defaultFrames);
            if (defaultInvert) this.currentInvert = JSON.parse(defaultInvert);
            
            firstButton.classList.add('active');
            var title = document.querySelector('.project-name');
            if (title) title.textContent = "Viewing " + firstButton.textContent;
        }
        
        // Only load if we actually have data
        if (this.currentModel && this.currentFrames.length > 0) {
            this.loadModel(this.currentModel, this.currentFrames, this.currentInvert);
        }
    },

    loadModel: function (modelFolder, frames, invert) {
        var self = this; 
        
        if (this._vr) {
            this.willHide();
            var viewerEl = document.getElementById('viewer');
            if (viewerEl) viewerEl.innerHTML = ''; 
        }

        this.currentModel = modelFolder;
        this.currentFrames = frames; // <-- Strictly uses the database array now!
        this.currentInvert = invert || [false, false];

        // ==========================================
        // THE NATIVE AUTO-DETECTOR
        // ==========================================
        const formatsToTest = ['.webp', '.jpg', '.png'];
        let formatIndex = 0;

        function testFormat() {
            if (formatIndex >= formatsToTest.length) {
                self.startEngine('.jpg');
                return;
            }

            const testExt = formatsToTest[formatIndex];
            const img = new Image();

            img.onload = () => {
                self.startEngine(testExt);
            };

            img.onerror = () => {
                formatIndex++;
                testFormat();
            };

            img.src = modelFolder + '/Frame000000' + testExt;
        }

        testFormat();
    },

    startEngine: function(detectedExtension) {
        this._vr = new AC.VR('viewer', this.currentModel + '/Frame######' + detectedExtension, this.currentFrames, {
            invert: this.currentInvert
        });
    },

    didShow: function() {
        this.init();
    },
    
    willHide: function() {
        recycleObjectValueForKey(this, "_vr");
    },
    
    shouldCache: function() {
        return false;
    }
};

if (!window.isLoaded) {
    window.addEventListener("load", function() {
        threeSixty.init();
    }, false);
}
