const emptyFunction = () => {};
const emptyResolveFunction = () => Promise.resolve();
const registeredSceneControllers = [];
const scenes = [];

let currentScene = null;
let currentRenderStrategy;
let parameters = {};
let scenesEl;
let transitionEnd;
let transitionStart;
let transitioning = false;
let updateHash;

const RenderStrategies = {};

function getRouteCommands(route) {
    if (!route) {
        return [];
    }

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

    transitioning = true;
    const playTransitionEnd = !!currentScene;

    if (currentScene) {
        currentScene.onExiting(currentScene);
        await transitionStart();
        currentScene.onExit(currentScene);
        currentRenderStrategy.onExit(currentScene.el, scenesEl);
    }

    if (updateHash) {
        window.location.hash = route;
    }

    currentScene = newScene;
    const el = await currentRenderStrategy.onEnter(currentScene.el, scenesEl);
    currentScene.onEntering({ el, parameters });

    if (playTransitionEnd) {
        await transitionEnd();
    }
    currentScene.onEnter({ el, parameters });

    transitioning = false;

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
        defaultRoute: '/',
        listenForHashChange: true,
        renderStrategy: 'visible',
        scenesElement: 'a-scene',
        useHash: true,
        ...options
    };

    const {
        defaultRoute,
        listenForHashChange,
        onTransitionEnd,
        onTransitionStart,
        renderStrategy,
        scenesElement,
        useHash
    } = options;

    transitionEnd = onTransitionEnd || emptyResolveFunction;
    transitionStart = onTransitionStart || emptyResolveFunction;
    updateHash = useHash;

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
                onEntering,
                onExit,
                onExiting,
            } = options;
        
            scenes.push({
                ...options,
                el,
                route,
                onEnter: onEnter || emptyFunction,
                onEntering: onEntering || emptyFunction,
                onExit: onExit || emptyFunction,
                onExiting: onExiting || emptyFunction
            });
            return true;
        }))
        .then(() => {
            if (useHash) {
                function navigateToHash() {
                    const route = window.location.hash ? window.location.hash.substring(1) : defaultRoute;
                    
                    AFRAME.navigateToScene(route) || AFRAME.navigateToScene(defaultRoute);
                }
            
                if (listenForHashChange) {
                    window.addEventListener('hashchange', () => {
                        if (transitioning) {
                            return;
                        }

                        navigateToHash();
                    });
                }
            
                navigateToHash();
            } else {
                AFRAME.navigateToScene(defaultRoute);
            }
        });
}

require('./components/navigate-to-scene');
require('./render-strategies/dom');
require('./render-strategies/visible');