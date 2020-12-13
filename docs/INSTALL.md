# Install zero-dev-os
Zero Dev OS

## Download Ubuntu Desktop

Download Ubuntu Desktop 20.10 64-bit for Raspberry Pi 4

https://ubuntu.com/download/raspberry-pi



## Create Bootable SD Card

### Chromebook

Use Recovery utility to create bootable SD Card

* Uncompress Image
  * `unxz ubuntu-20.10-preinstalled-desktop-arm64+raspi.img.xz`
* Zip Image
  * `zip -r ubuntu-20.10-preinstalled-desktop-arm64+raspi.zip ubuntu-20.10-preinstalled-desktop-arm64+raspi.img`
* Insert an SD Card
* Open the "Recovery" utility
* Select "Use local image" from the gear icon
* Choose the zip file from the previous step
* Select SD Card

## Initialize Raspberry Pi

### Boot and GUI Setup

* Boot the Raspberry Pi 4 using the SD Card
* Select Language, Keyboard, WiFi, Time Zone
* Enter user name and password
  * username: `developer`
  * computer: `pi`
  * password: <generated>
* Continue with System Configuration
* Restart
* Login
* Online Accounts: Click Skip
* Help Improve Ubuntu: Select "No, don't send system info", click Next
* Privacy: Leave "Location Services" off, click Next
* Click Done

## Install Zero Dev OS

Open Terminal

### Install Git

```
sudo apt install --yes git
```

### Clone Zero Dev OS

```
sudo apt install --yes git
```

