FROM node:12-alpine
LABEL description="Alpine image to build Nativefier apps"


# Install dependencies and cleanup extraneous files
RUN apk update \
    && apk add bash wine imagemagick dos2unix \
    && rm -rf /var/cache/apk/*

WORKDIR /nativefier

# Add sources
COPY . .

# Give everything to node
RUN chown -R node:node /nativefier \
    && chown -R node:node /tmp

# Use node (1000) as default user not root
USER node

# Fix line endings that may have gotten mangled in Windows
RUN find ./icon-scripts ./src ./app -type f -print0 | xargs -0 dos2unix

# Setup a global packages location for "node" user so we can npm link
RUN mkdir ~/.npm-packages \
    && npm config set prefix ~/.npm-packages

ENV NPM_PACKAGES="/home/node/.npm-packages"
ENV PATH="$PATH:$NPM_PACKAGES/bin"
ENV MANPATH="$MANPATH:$NPM_PACKAGES/share/man"

# Link (which will install and buld), run tests (to ensure we don't Docker build & publish broken stuff), and cleanup files
RUN npm link \
    && npm test \
    && rm -rf /tmp/nativefier* ~/.npm/_cacache ~/.cache/electron \
    && chmod +x $NPM_PACKAGES/bin/nativefier

# Run a {lin,mac,win} build
# 1. to check installation was sucessful
# 2. to cache electron distributables and avoid downloads at runtime
# Also delete generated apps so they don't get added to the Docker layer
RUN nativefier https://github.com/nativefier/nativefier /tmp/nativefier \
    && nativefier -p osx https://github.com/nativefier/nativefier /tmp/nativefier \
    && nativefier -p windows https://github.com/nativefier/nativefier /tmp/nativefier \
    && rm -rf /tmp/nativefier


RUN echo Generated Electron cache size: $(du -sh ~/.cache/electron) \
    && echo Final image size: $(du -sh / 2>/dev/null)

ENTRYPOINT ["nativefier"]
CMD ["--help"]
