# pngcrush.js - library edition V1.0.0

pngcrush.js is an optimizer for PNG (Portable Network Graphics) files, ported to JavaScript with [Emscripten](http://emscripten.org/) for use in the browser. Originally this project was created by [richardassar](http://github.com/richardassar) but it has been given a fairly large overhaul to make it more suitable for use in web applications.

## Improvements

- Upgraded to pngcrush 1.8.1 (latest)
- Build Improvements
	- Increase from `-O1` to `-O3` optimisations in compilation
	- Enabled closure compiler minification
	- Removed intermediate bitcode build stage
- Migrated all usage code into library itself (was originally tightly coupled to the test page)
- Fixed main function to clear down correctly after use, so can be used more than once
- Single function usage PNGCrush(blob) => Promise => blob
- Added scheduler and queue so can be used with large batches of images
- Updated test page to use the new library format and accept stacks of files
- Added strict type checking to various functions for safety
- Worker lazy loads when a png is submitted (good thing as the library is still pretty large)

## Requirements

- `Blob`
- `Worker`
- `Promise`
- `FileReader`

To improve general portability and compatibility with the closure compiler support with the exception of Promises the project uses exclusively es5 standards. It has not received extensive testing on anything other than chrome stable, if you find an issue please report it on github with the usual information( minimum replication, browser version, etc ).

I will likely create a pure ES6 style fork in the future, if your interested create/star an issue to encourage me to get to round to it faster.

## Usage
##### Include the library in your page
```
<script src="pngcrush.js"></script>
```
`worker.js` and `pngcrush.js.mem` must also be hosted with `pngcrush.js`, and they will be automatically loaded when required (async).

`worker.js` is quite large, but compresses VERY well so it is advisable to use gzip to serve it.

I'm unsure about how emscripten chooses the relative path for `pngcrush.js.mem`, it may have to be hosted in the same directory as the webpage or `worker.js`.
##### Get the file blob via your method of choice...

##### *...from a canvas*
```
let blob = canvas.toBlob();
```
##### *...from a server via fetch (bleeding edge)*
```
fetch('image.png')
.then(res => res.blob())
.then(blob => {
  // do stuff
});
```
##### *...from a server via XMLHttpRequest*
```
let request = new XMLHttpRequest();
request.open("GET", 'image.png', true);
request.responseType = 'blob';
request.onload = req => {
  let blob = req.response;
  // do stuff
};
request.send();
```
##### *...from a drag and drop*
```
document.body.addEventListener('drop', e => {
  e.preventDefault();
  let files = e.dataTransfer.files;
  for (let blob of files) {
    // do stuff
  }
}, false);
```
##### ...then crush it!
```
PNGCrush(blob)
.then(compressedBlob => {
	// Ta da!
});
```
If your not familiar with arrow functions then the above
`compressedBlob => {}` is equivalent to `function (compressedBlob) {}`.
	
Similarly `res => res.toBlob()` is equivalent to `function (res) { return res.toBlob(); }`.

## Testing

A fairly comprehensive test page is included ( `test.html` ) which is used during development, it could also be used as a good usage example.
 
## Building

*Currently the project is setup to build on a mac*

As an emscripten project there are quite a few requirements, if your already set up for emscripten then you are likely fine if not heres what you'll need. **These are the requirements of emscripten not the project itself.**

- Node.js
- Python 2 (OSX includes Python3, but you will have to install Python 2 as well)
- JDK
- XCode command line tools (does not require Xcode)
- git (should be included in xcode tools)
- make (should be included in xcode tools)
- Emscripten

There is a fairly complete if slightly confusing guide to setting up emscripten [here](http://kripken.github.io/emscripten-site/docs/getting_started/downloads.html).

**For a simple build**
```
sh build.sh
```
This will perform a clean build of pngcrush.js from the c source code in pngcrush-1.8.1 using make. Then package the output to the `~/distribution/` folder. The makefile is configured specifically for doing the emscripten build, and **does not** need to be called with emmake.

- Build options are specified in the LDFLAGS variable of the `~/pngcrush-1.8.1/Makefile`.
- Control logic for the emscripten module is found in `~/pre.js`.
- Scheduler and public API logic is found within `~/main.js`.
- Files will output to `~/distribution/`.
- The arguments that are passed to pngcrush when its run can be found in `~/pre.js`.

## License - LGPLv2

*Licensing is preserved from pngcrush*