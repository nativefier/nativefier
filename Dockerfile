FROM ubuntu:xenial
MAINTAINER Tobias Schneck (tobias@consol.de)

# /root/ as default folder

# Install build env
RUN apt-get update \
    && apt-get install -y software-properties-common \
    && dpkg --add-architecture i386 \
    && add-apt-repository -y ppa:wine/wine-builds \
    && apt-get update
RUN apt-get install -y --install-recommends winehq-devel \
    && apt-get clean

RUN apt-get update \
        && apt-get install -y wget \
        && apt-get clean
RUN mkdir -p /root/node && wget -qO- https://nodejs.org/dist/latest-v5.x/node-v5.12.0-linux-x86.tar.gz | tar xvz -C /root/node
ENV PATH="$PATH:/root/node/node-v5.12.0-linux-x86/bin"

# build sources
ADD . /nativefier
WORKDIR /nativefier/
RUN npm install && (cd /nativefier/app && npm install) && npm run build
RUN npm install -g
RUN ln -s /root/node/node-v5.12.0-linux-x86/bin/nativefier /usr/bin/nativefier
ENTRYPOINT ["nativefier"]
CMD ["--help"]
