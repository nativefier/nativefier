#!/bin/bash

#Download Curl
sudo apt-get install -y curl \

cd ~ \

#Needed to install the newest, most stable, version of nodejs.
curl -sL https://deb.nodesource.com/setup_10.x -o nodesource_setup.sh \

sudo bash nodesource_setup.sh \

sudo rm -r nodesource_setup.sh \

sudo apt-get update &&

#Node need to install npm because this package of nodejs has it included.
sudo apt-get install -y node.js 


#Installing some essential npm packages.

sudo apt install build-essential \

#git clone https://github.com/jiahaog/nativefier.git \

cd ~/nativefier \

sudo npm run dev-up 

sudo npm build \

sudo npm link \

#Testing if Nativefier is correctly installed

nativefier --help &&

echo "The installation of Nativefier was successfully completed!"



