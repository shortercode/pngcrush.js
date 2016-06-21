cd pngcrush-1.8.1
make clean
make
mv ./pngcrush.js ../distribution/worker.js
mv ./pngcrush.js.mem ../distribution/pngcrush.js.mem
cp ./main.js ../distribution/pngcrush.js