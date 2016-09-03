all:
	npm install
	./node_modules/.bin/browserify testMap.js -o testMap.bundle.js

clean:
	rm -r node_modules
	rm testMap.bundle.js
