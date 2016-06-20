(function ()
{
	const CreateWorker = function CreateWorker()
	{
		let worker;
		return function ()
		{
			if (worker)
				return Promise.resolve(worker);
			
			return new Promise(function (res)
			{
				const W = new Worker("worker.js");
				W.onmessage = function ({data: message})
				{
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
						W.onmessage = function ({data: message})
						{
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
	
	let isWorking = false;
	let queue = [];
	
	function ProcessNext () {
		if (isWorking)
			return;
		let next = queue.pop();
		if (next) {
			ProcessImage(next.blob, next.res, next.stdout);
		}
	}
	
	function ProcessImage (blob, res, stdout) {
		if (!(blob instanceof Blob))
			throw new TypeError(`${blob} is not instance of Blob`);
		if (typeof res !== 'function')
			throw new TypeError(`${res} is not instance of function`);
		if (typeof stdout !== 'function' && typeof stdout !== 'undefined')
			throw new TypeError(`${stdout} is not instance of function`);
		if (isWorking)
			throw new Error("Already working!");
		isWorking = true;
		const fileReader = new FileReader();
		fileReader.onload = function ({target: {result}})
		{
			const data = new Uint8Array(result);
			CreateWorker()
			.then(worker => {
				worker.oncomplete = blob => {
					isWorking = false;
					ProcessNext();
					res(blob);
				};
				worker.onstdout = stdout;
				worker.send(data);
			})
		}
		fileReader.readAsArrayBuffer(blob);
	}
	
	window.PNGCrush = function SubmitImage(blob, stdout)
	{
		if (!(blob instanceof Blob))
			throw new TypeError(`${blob} is not instance of Blob`);
		if (typeof stdout !== 'function' && typeof stdout !== 'undefined')
			throw new TypeError(`${stdout} is not instance of function`);
		if (blob.type !== "image/png")
			throw new TypeError(`Expected PNG not ${blob.type}`);
		return new Promise(function(res) {
			queue.push({
				blob,
				res,
				stdout
			});
			ProcessNext();
		});
	}
})();