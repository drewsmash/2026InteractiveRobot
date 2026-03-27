
threeSixty = {
    currentModel: 'images',
    currentFrames: [30, 8],
    currentInvert: [false, false],
    init: function () {
        // Automatically use the first button as the default starting model
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
        
        this.loadModel(this.currentModel, this.currentFrames, this.currentInvert);
    },
    loadModel: function (modelFolder, frames, invert) {
        if (this._vr) {
            this.willHide();
            var viewerEl = document.getElementById('viewer');
            if (viewerEl) {
                // Clear previous VR elements and show a loading text while downloading
                viewerEl.innerHTML = '<div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); color:#888; font-family:sans-serif; font-size:18px; font-weight:bold; z-index: -1;">Loading Model...</div>';
            }
        }
        this.currentModel = modelFolder;
        this.currentFrames = frames || [30, 8];
        this.currentInvert = invert || [false, false];
        this._vr = new AC.VR('viewer', modelFolder + '/Frame######.jpg', this.currentFrames, {
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
}
if (!window.isLoaded) {
    window.addEventListener("load", function() {
        threeSixty.init();
    }, false);
}
