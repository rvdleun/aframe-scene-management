AFRAME.registerSceneRenderStrategy('dom', {
    activeEl: null,
    scenesEl: null,

    init: function() { },

    onElAvailable: function(el, scene) {
        if (el.parentElement) {
            el.parentElement.removeChild(el);
        }
    },

    onEnter: function(el, scene) {
        const entity = document.createElement('a-entity');
        entity.innerHTML = el.innerHTML;
        scene.appendChild(entity);

        this.activeEl = entity;

        return new Promise(resolve => {
            setTimeout(() => resolve(entity))
        });
    },

    onExit: async function(el, scene) {
        if (this.activeEl) {
            scene.removeChild(this.activeEl);
        }

        this.activeEl = null;
        return true;
    }
});