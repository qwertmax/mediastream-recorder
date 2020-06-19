#!/bin/bash

docker run --rm -it -p 0.0.0.0:443:443 -v $(pwd):/usr/local/app -w /usr/local/app  node:14 bash
