import './components/test.component';

AFRAME.registerSceneController("url:/scenes/intro.html", {
    route: "/",
});

AFRAME.registerSceneController("url:/scenes/environment.html", {
    onEnter: (event) => {
        const { el, parameters } = event;
        const { preset } = parameters; 

        console.log(event);
        setTimeout(() => {
            el.querySelector('.environment').setAttribute('environment', { preset });
        });
     },
    route: "/environment/:preset",
});

setTimeout(() => {
    AFRAME.initialiseSceneManager({
        defaultRoute: "/environment/default",
        renderStrategy: "dom"
    });
});
