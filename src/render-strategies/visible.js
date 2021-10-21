AFRAME.registerSceneRenderStrategy('visible', {
    init: function() { },

    onElAvailable: function(el, scene) {
        if (!scene.contains(el)) {
            scene.appendChild(el);
        }

        el.setAttribute('visible', false);
    },

    onEnter: function(el) {
        el.setAttribute('visible', true);
        return el;
    },

    onExit: function(el) {
        el.setAttribute('visible', false);
    }
});