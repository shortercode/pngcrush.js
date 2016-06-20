importScripts('pngcrush.js');

Module.preRun = () => {
	const stdout = [];
	FS.init(() => null, data => {
		stdout.push(String.fromCharCode(data))
		if (data == 10) {
			postMessage({
				type: 'stdout',
				data: stdout.join('')
			});
			stdout.length = 0;
		}
	});
	delete Module.preRun;
};

function getFile (name) {
	const data = FS.root.contents[name].contents;
	const buffer = new Uint8Array(data).buffer;
	return new Blob([buffer], {type: 'image/png'});
}

onmessage = ({data: message}) => {
	switch (message.type)
	{
		case "file":
			FS.createDataFile('/', 'input.png', message.data, true, false);
			Module.run(['-reduce', '-rem', 'alla', '-rem', 'text', 'input.png', 'output.png']);
			postMessage({
				type: 'output',
				data: getFile('output.png')
			});
			FS.deleteFile('input.png');
			FS.deleteFile('output.png');
			break;
	}
};

postMessage({
	type: 'ready'
});