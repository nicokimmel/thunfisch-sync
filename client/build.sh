#!/bin/bash
npm run build && \
cp "./build/index.html" "./build/index.ejs" && \
sed -i 's/ROOMID/<%= roomId %>/g' "./build/index.ejs"