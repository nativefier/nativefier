FROM node:12-alpine
LABEL description="Alpine image to build nativefier apps"


# Install dependencies
RUN apk update \
    && apk add bash wine imagemagick dos2unix \
    && rm -rf /var/lib/apk/lists/*

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

# Use 1000 as default user not root
USER 1000

# Run a build of all platforms and archs:
# 1. to check installation was sucessful
# 2. to cache electron distributables and avoid downloads at runtime
RUN nativefier -p all -a all https://github.com/nativefier/nativefier /tmp/nativefier

ENTRYPOINT ["nativefier"]
CMD ["--help"]
