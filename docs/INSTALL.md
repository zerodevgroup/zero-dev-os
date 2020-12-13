# Install zero-dev-os
Zero Dev OS


## Download Ubuntu Desktop

Download Ubuntu Desktop 20.10 64-bit for Raspberry Pi 4

https://ubuntu.com/download/raspberry-pi


## Create Bootable SD Card (Chromebook)

### Uncompress Image
```
unxz ubuntu-20.10-preinstalled-desktop-arm64+raspi.img.xz
```

### Zip Image
```
zip -r ubuntu-20.10-preinstalled-desktop-arm64+raspi.zip ubuntu-20.10-preinstalled-desktop-arm64+raspi.img
```

### Use Recovery utility to create bootable SD Card
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

* Open Terminal

### Clone Zero Dev OS

```
cd ~
git clone https://github.com/zerodevgroup/zero-dev-os.git
```

### Install git, curl

```
sudo apt update
sudo apt install --yes git
sudo apt install --yes curl
```

### Install node

```
cd ~/zero-dev-os/tools
sudo ./node-js-install.sh
```

### Install zero-dev-os

```
cd ~/zero-dev-os
sudo ./zero-dev-os.sh install --all
```

### Reboot

```
sudo reboot
```

## Post Install Tweaks

### Fix menu favorites

Remove default favorites from the left menu and add the following:

* Terminator
* Chromium
* Files
* Settings
* Tweaks

### Change Terminator defaults

Launch "Terminator"

In the Terminator window, right click and select "Preferences"

In the Global tab:
  * Under "Appearance" change the "Unfocused terminal font brightnes" to 100% (the blinking cursor will be your indication of the focused terminal)
  * Under "Terminal Titlebar" change the "Background" color from red to something a little less intense, say blue

In the Profiles tab (default profile):
  * Select the "Global" tab and change "Font" to the font of your choice, like "Monospace Regular 13"
  * Select the "Colors" tab and change "Foreground and Background" to the scheme of your choice, like "White on Black" or "Green on Black"
  * Select the "Scrolling" tab and select "Infinite Scrollback"

In the Keybindings tab:
  * Change the keybinding "next_tab" to "Shift+Ctrl+Right"
  * Change the keybinding "prev_tab" to "Shift+Ctrl+Left"
  * Change the keybinding "resize_right" to "Ctrl+Super+Right"
  * Change the keybinding "resize_left" to "Ctrl+Super+Left"

### Apply Tweaks

Open the "Tweaks" tool

In the "Appearance" tab:
  * Change "Applications" to "Adwaita-dark"

In the "Extensions" tab:
  * Click the gear next to Desktop Icons and change "Show ..." to "Off" for all

In the "Top Bar" tab:
  * Change "Clock Seconds" to "On"
  * Change "Date" to "On"

In the "Workspaces" tab:
  * Change to "Static Workspaces" and leave the "Number of Workspaces" set to "4"

### Change Settings

Open the "Settings" tool

In the "Power" tab:
  * Change "Power Saving - Blank Screen" to "Never"
  * Change "Power Saving - Wi-Fi can be turned off..." to "Never"
  * Change "Suspend & Power Button - Automatic Suspend" to "Off" (if present)

In the "Background" tab:
  * Change "Background" to the background of your choice
