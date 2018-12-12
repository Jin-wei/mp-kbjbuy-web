#!/bin/bash
#This script is used to complete the process of build staging
sudo npm install
cp conf_dev.json conf.json
grunt
