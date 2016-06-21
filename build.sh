cd src/pngcrush-1.8.1
make clean
make
mv ./pngcrush.js ../../worker.js
mv ./pngcrush.js.mem ../../pngcrush.js.mem
cp ../main.js ../../pngcrush.js