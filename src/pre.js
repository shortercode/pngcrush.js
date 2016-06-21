'use strict';

var Module = {
	'noInitialRun': true,
	'noFSInit': true,
	'preInit': function ()
	{
		FS.init(
			function ()
			{
				return null;
			},
			function ()
			{
				return null;
			}
		);
	},
	'onRuntimeInitialized': function ()
	{
		self['postMessage']({
			type: 'ready'
		});
	}
};

function getFile (name)
{
	
}

self['onmessage'] = function(e)
{
	var message = e.data;
	switch (message.type)
	{
		case "file":
			FS.createDataFile('/', 'input.png', message.data, true, false);
			Module.callMain(['-reduce', '-rem', 'alla', '-rem', 'text', 'input.png', 'output.png']);
			
			if (FS.root.contents['output.png'])
			{
				var data = FS.root.contents['output.png'];
				var buffer = new Uint8Array(data).buffer;
				postMessage({
					type: 'output',
					data: new Blob([buffer], {type: 'image/png'})
				});
				FS.unlink('input.png');
				FS.unlink('output.png');
			}
			break;
	}
};