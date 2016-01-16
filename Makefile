upload:
	echo "/* KintaiMan https://github.com/app2641/kintaiman */" > main.gs
	echo "/* Version ::VERSION:: */" | sed -e "s/::VERSION::/`head VERSION`/g" >> main.gs
	echo "/* (c) app2641 2016- License: MIT */" >> main.gs
	echo "/* ------------------- */" >> main.gs
	cat scripts/*.js >> main.gs
	./node_modules/gas-manager/bin/gas upload

test:
	node testrunner.js
