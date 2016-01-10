upload:
	echo "/* Yamamoto-san https://github.com/app2641/yamamoto/ */" > main.gs
	echo "/* (c) app2641 2016- License: MIT */" >> main.gs
	echo "/* ------------------- */" >> main.gs
	cat scripts/*.js | sed -e "s/::VERSION::/`head VERSION`/g" >> main.gs
	./node_modules/gas-manager/bin/gas upload

test:
	node testrunner.js
