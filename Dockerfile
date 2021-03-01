FROM node:12-alpine
LABEL description="Alpine image to build Nativefier apps"


# Install dependencies
RUN apk update \
    && apk add bash wine imagemagick dos2unix \
    && rm -rf /var/cache/apk/*

WORKDIR /nativefier

# Add sources
COPY . .

# Fix line endings that may have gotten mangled in Windows
RUN find ./icon-scripts ./src ./app -type f -print0 | xargs -0 dos2unix

# Build nativefier and link globally
WORKDIR /nativefier/app
RUN npm install
WORKDIR /nativefier

# Install (which will also install in ./app, and build, thanks to our `prepare` npm hook)
# Also, running tests, to ensure we don't Docker build & publish broken stuff
RUN npm install && npm test && npm link

# Cleanup test artifacts
RUN rm -rf /tmp/nativefier*

# Use 1000 as default user not root
USER 1000

# Run a {lin,mac,win} build
# 1. to check installation was sucessful
# 2. to cache electron distributables and avoid downloads at runtime
RUN nativefier https://github.com/nativefier/nativefier /tmp/nativefier \
    && nativefier -p osx https://github.com/nativefier/nativefier /tmp/nativefier \
    && nativefier -p windows https://github.com/nativefier/nativefier /tmp/nativefier


RUN echo Generated total cache size: $(du -sh ~/.cache/electron) \
    && echo Generated total app size: $(du -sh /tmp/nativefier) \
    && rm -rf /tmp/nativefier \
    && echo Final image size: $(du -sh / 2>/dev/null)

ENTRYPOINT ["nativefier"]
CMD ["--help"]
