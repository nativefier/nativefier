FROM node:7-alpine
LABEL description="Alpine image to build nativfier apps"

### Install wine depedency
RUN apk add --no-cache \
    wine \
    freetype \
    imagemagick \
    ### make symbolic link to use `wine`
    && ln -s /usr/bin/wine64 /usr/bin/wine
    
# Add sources
COPY . /nativefier

### Build app package for nativefier installation
RUN cd /nativefier/app && npm install \
    # Build and install nativefier binary
    && cd /nativefier && npm install && npm run build && npm install -g \
    ## Remove no longer needed sources
    && rm -rf /nativefier


### Use 1000 as default user not root
USER 1000

### Check that installation was sucessfull and chache all electron installation.
### Ensures that no addtional download will needed at runtime exectuion `docker run`.
RUN nativefier https://github.com/jiahaog/nativefier /tmp/nativefier \
    && nativefier -p osx https://github.com/jiahaog/nativefier /tmp/nativefier \
# TODO: windows are currently not possible, because of non 64-bit `node-rcedit`, see https://github.com/electron/node-rcedit/issues/22.
#    && nativefier -p windows https://github.com/jiahaog/nativefier /tmp/nativefier \
    #remove not need test aplication
    && rm -rf /tmp/nativefier

ENTRYPOINT ["nativefier"]
CMD ["--help"]
