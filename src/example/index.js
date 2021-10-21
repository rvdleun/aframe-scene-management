import './components/test.component';

AFRAME.registerSceneController("/", {
    src: "/scenes/intro.html"    
});

AFRAME.registerSceneController("/environment/:preset", {
    src: "/scenes/environment.html",

    onEnter: (event) => {
        const { el, parameters } = event;
        const { preset } = parameters; 

        el.querySelector('.environment').setAttribute('environment', { preset });
     },
});

AFRAME.registerSceneController("/test", {
    selector: '#scene-test'
});

setTimeout(() => {
    AFRAME.initialiseSceneManager({
        defaultRoute: "/environment/default",
        renderStrategy: "visible",
        scenesElement: "#scenes"
    });
});
