var threeSixty = {
    currentModel: '',
    currentFrames: [30, 8],
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
        }
        
        // Only trigger if data actually exists
        if (this.currentModel) {
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
        this.currentFrames = frames || [30, 8];
        this.currentInvert = invert || [false, false];

        // ==========================================
        // THE NATIVE AUTO-DETECTOR
        // ==========================================
        var formatsToTest = ['.webp', '.jpg', '.png'];
        var formatIndex = 0;

        function testFormat() {
            if (formatIndex >= formatsToTest.length) {
                // Failsafe: Default to .jpg so it doesn't hang forever
                self.startEngine('.jpg');
                return;
            }

            var testExt = formatsToTest[formatIndex];
            var img = new Image();

            img.onload = function() {
                // Format found! Boot the engine.
                self.startEngine(testExt);
            };

            img.onerror = function() {
                // Failed, try the next format
                formatIndex++;
                testFormat();
            };

            // Ping Frame 1 (Solidworks defaults to starting at 000001)
            img.src = modelFolder + '/Frame000001' + testExt;
        }

        // Kick off the ping test
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
        if (this._vr && typeof recycleObjectValueForKey !== 'undefined') {
            recycleObjectValueForKey(this, "_vr");
        } else {
            this._vr = null;
        }
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
