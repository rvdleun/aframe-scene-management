import 'aframe';
import 'aframe-environment-component';
import '../src/index';

import './components/test.component';

AFRAME.registerSceneController("/", {
    src: "/scenes/intro.html"    
});

AFRAME.registerSceneController("/aframe-example", {
    selector: '#scene-aframe-example',

    onEntering: function() {
        Array.from(document.querySelectorAll('.menu-text')).forEach(el => {
            el.setAttribute('color', 'black');
        })
    },

    onExit: function() {
        Array.from(document.querySelectorAll('.menu-text')).forEach(el => {
            el.setAttribute('color', 'white');
        })
    }
});

AFRAME.registerSceneController("/primitive/:primitive", {
    src: "/scenes/primitive.html",

    onEntering: (event) => {
        const { el, parameters } = event;
        const { primitive } = parameters; 

        el
            .querySelector('.geometry')
            .setAttribute('geometry', { primitive });
     },
});

AFRAME.registerSceneController("/sky/:color", {
    src: "/scenes/sky.html",

    onEntering: (event) => {
        // Taken from https://stackoverflow.com/questions/48484767/javascript-check-if-string-is-valid-css-color
        function isColor(strColor) {
            const s = new Option().style;
            s.color = strColor;
            return s.color !== '';
        }

        const { el, parameters } = event;
        const { color } = parameters; 

        const sky = el.querySelector('a-sky')
        sky.setAttribute('visible', true);

        if (!isColor(color)) {
            sky.setAttribute('color', 'black');
            el.querySelector(`#invalid-color`).setAttribute('visible');
            return;
        }

        sky.setAttribute('color', color);

        const textId = color === "darkgreen" ? "change-color" : "color-changed";
        el.querySelector(`#${textId}`).setAttribute('visible',)
     },
});

AFRAME.initialiseSceneManager({
    onTransitionEnd: function() {
        return new Promise(resolve => {
            document.querySelector('a-scene').setAttribute('style', 'opacity: 1');

            setTimeout(resolve, 500);
        });
    },
    onTransitionStart: function() {
        return new Promise(resolve => {
            document.querySelector('a-scene').setAttribute('style', 'opacity: 0;  pointer-events: none');

            setTimeout(resolve, 500);
        });
    },
    renderStrategy: "dom",
    scenesElement: "#scenes"
});
