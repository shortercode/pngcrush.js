(function ()
{
	'use strict';
	var WORKER_URL = "worker.js";
	var isWorking = false;
	var queue = [];
	
	var CreateWorker = function CreateWorker()
	{
		var worker;
		return function ()
		{
			if (worker)
				return Promise.resolve(worker);
			
			return new Promise(function (res)
			{
				var W = new Worker(WORKER_URL);
				W.onmessage = function (e)
				{
					var message = e.data;
					if (message.type === "ready")
					{
						worker = {
							send (file) {
								W.postMessage({
									type: "file",
									data: file
								});
							},
							oncomplete: null
						};
						W.onmessage = function (e)
						{
							var message = e.data;
							if (message.type === "output")
							{
								if (typeof worker.oncomplete !== 'function')
									throw new Error("No completion handler present");
								worker.oncomplete(message.data);
							}
							if (message.type === "stdout" && typeof worker.onstdout === 'function')
							{
								worker.onstdout(message.data);
							}
						};
						res(worker);
					}
				}
			});
		}
	}();
	
	function ProcessNext () {
		if (isWorking)
			return;
		let next = queue.pop();
		if (next) {
			ProcessImage(next.blob, next.res, next.stdout);
		}
	}
	
	function ProcessImage (blob, res) {
		if (!(blob instanceof Blob))
			throw new TypeError(`${blob} is not instance of Blob`);
		if (typeof res !== 'function')
			throw new TypeError(`${res} is not instance of function`);
		if (isWorking)
			throw new Error("Already working!");
		isWorking = true;
		var fileReader = new FileReader();
		fileReader.onload = function (e)
		{
			var result = e.target.result;
			var data = new Uint8Array(result);
			CreateWorker()
			.then(function (worker) {
				worker.oncomplete = function (blob) {
					isWorking = false;
					ProcessNext();
					res(blob);
				};
				worker.send(data);
			});
		}
		fileReader.readAsArrayBuffer(blob);
	}
	
	window.PNGCrush = function SubmitImage(blob)
	{
		if (!(blob instanceof Blob))
			throw new TypeError(`${blob} is not instance of Blob`);
		if (typeof stdout !== 'function' && typeof stdout !== 'undefined')
			throw new TypeError(`${stdout} is not instance of function`);
		if (blob.type !== "image/png")
			throw new TypeError(`Expected PNG not ${blob.type}`);
		return new Promise(function(res) {
			queue.push({
				blob: blob,
				res: res
			});
			ProcessNext();
		});
	}
})();