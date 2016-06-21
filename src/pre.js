var Module = {
	'noInitialRun': true,
	'noFSInit': true,
	'preInit': function () {
		var stdout = [];
		FS.init(function () { return null; }, function (data) {
			stdout.push(String.fromCharCode(data));
			if (data == 10) {
				postMessage({
					type: 'stdout',
					data: stdout.join('')
				});
				stdout.length = 0;
			}
		});
		
	},
	'onRuntimeInitialized': function () {
		self['postMessage']({
			type: 'ready'
		});
	}
};

function getFile (name) {
	var file = FS.root.contents[name];
	if (file) {
		var data = FS.root.contents[name].contents;
		var buffer = new Uint8Array(data).buffer;
		return new Blob([buffer], {type: 'image/png'});
	}
}

self['onmessage'] = function(e) {
	var message = e.data;
	switch (message.type)
	{
		case "file":
			FS.createDataFile('/', 'input.png', message.data, true, false);
			Module.callMain(['-reduce', '-rem', 'alla', '-rem', 'text', 'input.png', 'output.png']);
			var output = getFile('output.png');
			if (output) {
				postMessage({
					type: 'output',
					data: output
				});
				FS.unlink('input.png');
				FS.unlink('output.png');
			}
			break;
	}
};