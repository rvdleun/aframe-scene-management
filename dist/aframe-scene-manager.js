/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/components/navigate-to-scene.js":
/*!*********************************************!*\
  !*** ./src/components/navigate-to-scene.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

AFRAME.registerComponent('navigate-to-scene', {
    schema: { type: "string" },

    events: {
        click: function() {
            AFRAME.navigateToScene(this.data);
        }
    }
})

/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

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

__webpack_require__(/*! ./components/navigate-to-scene */ "./src/components/navigate-to-scene.js");
__webpack_require__(/*! ./render-strategies/dom */ "./src/render-strategies/dom.js");
__webpack_require__(/*! ./render-strategies/visible */ "./src/render-strategies/visible.js");

/***/ }),

/***/ "./src/render-strategies/dom.js":
/*!**************************************!*\
  !*** ./src/render-strategies/dom.js ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports) {

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

/***/ }),

/***/ "./src/render-strategies/visible.js":
/*!******************************************!*\
  !*** ./src/render-strategies/visible.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

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

/***/ })

/******/ });