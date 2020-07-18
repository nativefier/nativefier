# This Dockerfile is designed to be used like the "normal" app.
# By default, the command `nativefier --help` will be executed.
# Before you can use the image, you have to build it:
# 
#     docker build -t local/nativefier .
#  
# After that, you can build your first nativefier app to the local `$TARGET-PATH`.
# Ensure you have write access to the `$TARGET-PATH`:
# 
#     docker run -v $TARGET-PATH:/target local/nativefier https://my-web-app.com/ /target/
# 
# You can also pass nativefier flags, and mount additional volumes to provide
# local files. For example, to use a icon:
# 
#     docker run -v $PATH_TO_ICON/:/src -v $TARGET-PATH:/target local/nativefier --icon /src/icon.png --name whatsApp -p linux -a x64 https://my-web-app.com/ /target/

FROM node:12-stretch
LABEL description="Debian image to build nativefier apps"

# Get wine32, not 64, to work around binary incompatibility with rcedit.
# https://github.com/jiahaog/nativefier/issues/375#issuecomment-304247033
# Forced us to use Debian rather than Alpine, which doesn't do multiarch.
RUN dpkg --add-architecture i386

# Install dependencies
RUN apt-get update \
    && apt-get --yes install wine32 imagemagick \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Add sources
COPY . /nativefier

# Build nativefier and link globally
WORKDIR /nativefier/app
RUN npm install
WORKDIR /nativefier
RUN npm install && npm run build && npm link

# Use 1000 as default user not root
USER 1000

# Run a {lin,mac,win} build: 1. to check installation was sucessful,
# 2. to cache electron distributables and avoid downloads at runtime.
RUN nativefier https://github.com/jiahaog/nativefier /tmp/nativefier \
    && nativefier -p osx https://github.com/jiahaog/nativefier /tmp/nativefier \
    && nativefier -p windows https://github.com/jiahaog/nativefier /tmp/nativefier \
    && rm -rf /tmp/nativefier

ENTRYPOINT ["nativefier"]
CMD ["--help"]
