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
        
        if (this.currentModel) {
            this.loadModel(this.currentModel, this.currentFrames, this.currentInvert);
        }
    },

    // Safely takes the ext parameter from viewer.js
    loadModel: function (modelFolder, frames, invert, ext) {
        if (this._vr) {
            this.willHide();
            var viewerEl = document.getElementById('viewer');
            if (viewerEl) viewerEl.innerHTML = ''; 
        }

        this.currentModel = modelFolder;
        this.currentFrames = frames || [30, 8];
        this.currentInvert = invert || [false, false];
        
        // Use the requested format, or fallback to .jpg
        var format = ext || '.jpg'; 

        this._vr = new AC.VR('viewer', modelFolder + '/Frame######' + format, this.currentFrames, {
            invert: this.currentInvert
        });
    },

    didShow: function() {
        this.init();
    },
    
    willHide: function() {
        if (typeof recycleObjectValueForKey !== 'undefined') {
            recycleObjectValueForKey(this, "_vr");
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
