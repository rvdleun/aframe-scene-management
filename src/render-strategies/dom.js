export const RenderStrategyDom = {
    activeEl: null,
    scenesEl: null,

    init: function() {
        const scenesEl = document.createElement('a-entity');
        scenesEl.setAttribute('class', 'aframe-scene-manager');
        document.querySelector('a-scene').appendChild(scenesEl);

        this.scenesEl = scenesEl;
    },

    onElAvailable: function(el) {
        const scene = document.querySelector('a-scene');
        if (scene.contains(el)) {
            el.parentElement.removeChild(el);
        }
    },

    onEnter: function(el) {
        const entity = document.createElement('a-entity');
        entity.innerHTML = el.innerHTML;
        this.scenesEl.appendChild(entity);

        this.activeEl = entity;
        return entity;
    },

    onExit: function(el) {
        if (this.activeEl) {
            this.scenesEl.removeChild(this.activeEl);
        }

        this.activeEl = null;
    }
};