all:
	npm install
	./node_modules/.bin/babel js --out-dir build
	./node_modules/.bin/browserify testMap.js -o testMap.bundle.js -t browserify-css -g browserify-css

clean:
	rm -r node_modules
	rm testMap.bundle.js
