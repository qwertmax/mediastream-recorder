#!/bin/bash

docker run --rm -it -p 0.0.0.0:80:80 -v $(pwd):/usr/local/app -w /usr/local/app  node:14 bash
