const emptyFunction = () => {};
const registeredSceneControllers = [];
const scenes = [];

let currentScene = null;
let currentRenderStrategy;
let parameters = {};
let scenesEl;

const RenderStrategies = {};

function getRouteCommands(route) {
    if (route[0] === "/") {
        route = route.substring(1);
    }

    return route.split("/");
}

function getRouteParameters(route, compareRoute) {
    parameters = {};

    const routeCommands = getRouteCommands(route);
    const compareCommands = getRouteCommands(compareRoute);

    if (routeCommands.length !== compareCommands.length) {
        return false;
    }

    for (let i = 0; i < compareCommands.length; i++) {
        if (compareCommands[i][0] === ':') {
            const id = compareCommands[i].substring(1);
            parameters[id] = routeCommands[i];
        } else if(routeCommands[i] !== compareCommands[i]) {
            console.log('Not the same', routeCommands[i], '!==', compareCommands[i], i);
            return false;
        }
    }

    return true;
}

AFRAME.navigateToScene = async function(route) {
    const newScene = scenes.find(scene => getRouteParameters(route, scene.route));
    
    if (!newScene) {
        console.error('Unknown route for new scene: ', route);
        return false;
    }

    if (currentScene) {
        currentScene.onExit(currentScene);
        currentRenderStrategy.onExit(currentScene.el, scenesEl);
    }

    window.location.hash = route;

    currentScene = newScene;
    const el = await currentRenderStrategy.onEnter(currentScene.el, scenesEl);
    currentScene.onEnter({ el, parameters });

    return true;
};

AFRAME.registerSceneRenderStrategy = function(id, renderStrategy) {
    RenderStrategies[id] = renderStrategy;
}

AFRAME.registerSceneController = function(route, options) {
    registeredSceneControllers.push({ options, route });
}

AFRAME.initialiseSceneManager = function(options) {
    const scene = document.querySelector('a-scene');
    if (!scene) {
        setTimeout(() => AFRAME.initialiseSceneManager(options));
        return;
    }

    options = {
        renderStrategy: 'visible',
        scenesElement: 'a-scene',
        ...options
    };

    const {
        defaultRoute,
        renderStrategy,
        scenesElement
    } = options;

    currentRenderStrategy = RenderStrategies[renderStrategy];
    if (!currentRenderStrategy) {
        console.error('Unknown render strategy: ', renderStrategy);
        return;
    }

    scenesEl = document.querySelector(scenesElement);
    if (!scenesEl) {
        console.error('Could not find scenes element: ', scenesElement);
        return;
    }

    currentRenderStrategy.init();

    return Promise.all(
        registeredSceneControllers.map(async ({ options, route }) => {
            let el; 

            if (options.src) {
                const page = await fetch(options.src);

                if (!page.ok) {
                    console.error(`Tried to register a scene, but had issues while fetching the scene ${selector}`);
                    return false;
                }

                const html = await page.text();
                el = document.createElement('a-entity');
                el.innerHTML = html;
            } else if (options.selector) {
                el = document.querySelector(options.selector);

                if (!el) {
                    console.error(`Tried to register a scene, but could not find ID for ${route}`);
                    return false;
                }
            } else {
                console.error(`Tried to register a scene, but no selector or src provided ${route}`);
            }

            if (!el) {
                console.error('Error while registering a scene. No element available.');
                return false;
            }

            currentRenderStrategy.onElAvailable(el, scenesEl);
        
            const { 
                onEnter,
                onExit,
            } = options;
        
            scenes.push({
                ...options,
                el,
                route,
                onEnter: onEnter || emptyFunction,
                onExit: onExit || emptyFunction
            });
            return true;
        }))
        .then(() => {
            function navigateToHash() {
                const route = window.location.hash ? window.location.hash.substring(1) : defaultRoute;
                
                AFRAME.navigateToScene(route) || AFRAME.navigateToScene(defaultRoute);
            }
        
            window.addEventListener('hashchange', () => {
                navigateToHash();
            });
        
            navigateToHash();
        });
}

require('./render-strategies/dom');
require('./render-strategies/visible');