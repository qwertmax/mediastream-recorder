#!/bash

docker run --rm -it -p 0.0.0.0:8080:8080 -v $(pwd):/usr/local/app -w /usr/local/app  node:14 bash
