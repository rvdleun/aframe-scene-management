# aframe-scene-management
This is an attempt at setting up a robust scene management system in AFrame. It will allow the developer to split up his AFrame project into multiple scenes.

The setup itself is fairly easy...
* Each scene will essentially be an entity that need to be registered when starting the project.
* The HTML of a scene can either be defined by using a selector to pick the entity in the current class, or linking to an external HTML file.
* A scene will have a controller that can respond to the following events...
  * onEntering: Before the start transition is played
  * onEnter: After the start transition is finished
  * onExiting: Before the exit transition is played
  * onExit: When the exit transition is finished
* There are two 'render strategies' that you can use...
  * DOM
    * All scenes are stored in the memory.
    * When a scene changes, the current one is removed from the DOM and replaced with a new copy from the new scene.
    * Likely not the most efficient way of doing it, but can avoid a lot 
  * Visible
    * All scenes will have the `visible` attribute set to `false.
    * Only the active scene's visibility will be set to `true`.
    * This, unfortunately, also means that all entities of inactive scenes will still be running. It will be up to the developer to disable these.
    * Likewise, this can cause some big issues with raycasting.
* The active scene will also be stored in the document's hash.
* A general manual transition can be setup when switching scenes.

This project is still very much under construction. I recently implemented an early version of this for a client, but now want to attempt to rebuild it from scratch to have something that can easily be inserted into any AFrame project.

## Directory structure

### Public
Contains all public assets, like index.html and media files.

### src
Contains all javascript scripts

## Development
* Run `npm run dev`
* Open a web browser
* Go to localhost:8000
* Develop away! The browser will automatically refresh whenever a change is made.
    
## Build
* Run `npm run build`
* A ready-to-deploy project will be available in the dist directory.
