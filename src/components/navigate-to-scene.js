AFRAME.registerComponent('navigate-to-scene', {
    schema: { type: "string" },

    events: {
        click: function() {
            AFRAME.navigateToScene(this.data);
        }
    }
})