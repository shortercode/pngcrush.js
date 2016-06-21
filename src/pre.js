'use strict';

const INPUT_FILE_NAME = 'input.png';
const OUTPUT_FILE_NAME = 'output.png';
const EXECUTION_ARGUMENTS = [
	'-reduce',
	'-rem', 'alla',
	'-rem', 'text',
	INPUT_FILE_NAME,
	OUTPUT_FILE_NAME
];

// precreate emscripten module with setup arguments

let Module = {
	'noInitialRun': true, // prevent main from running before we call it
	'noFSInit': true, // use manual file system init
	'preInit': () => FS.init(str => null, str => null), // before module initialisation init the stderr and stdout channels
	'onRuntimeInitialized': () => self['postMessage']({ type: 'ready' }) // once completely loaded tell scheduler module is ready
};

// post errors back to scheduler, but also throw to halt execution

function PostError (str)
{
	self['postMessage']({
		type: 'error',
		message: str
	})
	throw new Error(str);
}

// type safety functions

function RequireBlob (blob)
{
	if (!(blob instanceof Blob))
		PostError(`${blob} is not instance of Blob`);
}

function RequireBlobType (blob, type)
{
	RequireBlob(blob);
	if (blob.type !== type)
		PostError(`${blob} is not type ${type}`);
}

// message listener

self['onmessage'] = e =>
{
	let message = e.data;
	switch (message.type)
	{
		case "file": // when recieving a file
			
			RequireBlobType(message.data, 'image/png');
			
			// create virtual file system object for input file
			FS.createDataFile('/', 'input.png', message.data, true, false);
			
			// call module with virtual file system reference as input
			Module.callMain(EXECUTION_ARGUMENTS);
			
			// check that output file was created by module
			if (FS.root.contents[OUTPUT_FILE_NAME])
			{
				// get buffer for file object
				let data = FS.root.contents[OUTPUT_FILE_NAME].contents;
				let buffer = new Uint8Array(data).buffer;
				
				// create blob from buffer and return to scheduler
				postMessage({
					type: 'output',
					data: new Blob([buffer], {type: 'image/png'})
				});
				
				// remove virtual file system references for input and output
				FS.unlink('input.png');
				FS.unlink('output.png');
			}
			break;
	}
};