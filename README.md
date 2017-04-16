# About

Display a slideshow of various stuff from a folder in a minimalistic webpage.

It was created as part of a project to make an animated gif picture frame with a raspberry pi and an adafruit touchscreen.

# Supported files types

* GIF, PNG, JPG
* node.js files (script output is displayed in browser)

You can also add css files to customize the display by having an additional file as such:

```
some-file.js // i will be run
some-file.js.css // i will be used as the css for some-file.js
```

# Installation

```
git clone https://github.com/mattvears/node-kiosk.git
cd ./node-kiosk
npm install .
```

# Usage

```
node server.js /path/to/dir [port]
```

port is optional, default is 1337

# Customization

the contents in the *public* directory are served statically. 

* container.js is used to provide browser data to the server
* image.css is the default css for displaying images
* output.css is the default css for displaying command output