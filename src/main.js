{
	const WORKER_URL = "worker.js";

	let isWorking = false,
		queue = [],
		worker = null;

	function RequireBlob (blob)
	{
		if (!(blob instanceof Blob))
			throw new TypeError(`${blob} is not instance of Blob`);
	}

	function RequireBlobType (blob, type)
	{
		RequireBlob(blob);
		if (blob.type !== type)
			throw new TypeError(`${blob} is not type ${type}`);
	}

	function RequireFunction (fn)
	{
		if (typeof fn !== 'function')
			throw new TypeError(`${fn} is not instance of Function`);
	}

	function CreateWorker ()
	{
		if (worker)
			return Promise.resolve(worker);
		
		return new Promise(res =>
		{
			let W = new Worker(WORKER_URL);
			W.onmessage = e =>
			{
				let message = e.data;
				if (message.type === "ready")
				{
					worker = {
						send (file)
						{
							W.postMessage({
								type: "file",
								data: file
							});
						},
						oncomplete: null
					};
					W.onmessage = e =>
					{
						let message = e.data;
						if (message.type === "output")
						{
							RequireFunction(worker.oncomplete);
							worker.oncomplete(message.data);
						}
					};
					res(worker);
				}
			};
		});
	}

	function ProcessNext ()
	{
		if (isWorking)
			return;
		let next = queue.pop();
		if (next)
			ProcessImage(next.blob, next.res);
	}

	function ProcessImage (blob, res)
	{
		RequireBlob(blob);
		RequireFunction(res);
		if (isWorking)
			throw new Error("Already working!");
		isWorking = true;
		let fileReader = new FileReader();
		fileReader.onload = function (e)
		{
			let result = e.target.result;
			let data = new Uint8Array(result);
			CreateWorker()
			.then(worker =>
			{
				worker.oncomplete = blob =>
				{
					isWorking = false;
					ProcessNext();
					res(blob);
				};
				worker.send(data);
			});
		}
		fileReader.readAsArrayBuffer(blob);
	}

	window.PNGCrush = blob =>
	{
		RequireBlobType(blob, "image/png");
		return new Promise((res, rej) =>
		{
			queue.push({
				blob,
				res,
				rej
			});
			ProcessNext();
		});
	};
}