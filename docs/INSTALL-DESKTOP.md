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
  * password: &lt;generated&gt;
* Continue with System Configuration
* Restart
* Login
* Online Accounts: Click Skip
* Help Improve Ubuntu: Select "No, don't send system info", click Next
* Privacy: Leave "Location Services" off, click Next
* Click Done


## Install Zero Dev OS

* Open Terminal

### Install git, curl

```
sudo apt update
sudo apt install --yes git
sudo apt install --yes curl
```

### Clone Zero Dev OS

```
sudo mkdir -p /opt
cd /opt
sudo git clone https://github.com/zerodevgroup/zero-dev-os.git
```

### Install node

```
cd /opt/zero-dev-os/tools
sudo ./node-js-install.sh
```

### Install zero-dev-os

```
cd /opt/zero-dev-os
sudo ./zed install --core
sudo ./zed install --limit-swap
sudo ./zed install --desktop
# Optional: sudo ./zed install --disable-sudo-password
sudo ./zed install --graphics
sudo ./zed install --lxd
sudo ./zed install --bashrc
sudo ./zed install --vimrc
```

### Configure lxd (50GB for block device based on 120GB SD Card)

```
$> lxd init
Would you like to use LXD clustering? (yes/no) [default=no]: 
Do you want to configure a new storage pool? (yes/no) [default=yes]: 
Name of the new storage pool [default=default]: 
Name of the storage backend to use (btrfs, dir, lvm, zfs, ceph) [default=zfs]: 
Create a new ZFS pool? (yes/no) [default=yes]: 
Would you like to use an existing empty block device (e.g. a disk or partition)? (yes/no) [default=no]: 
Size in GB of the new loop device (1GB minimum) [default=23GB]: 50GB
Would you like to connect to a MAAS server? (yes/no) [default=no]: 
Would you like to create a new local network bridge? (yes/no) [default=yes]: 
What should the new bridge be called? [default=lxdbr0]: 
What IPv4 address should be used? (CIDR subnet notation, “auto” or “none”) [default=auto]: 
What IPv6 address should be used? (CIDR subnet notation, “auto” or “none”) [default=auto]: 
Would you like LXD to be available over the network? (yes/no) [default=no]: 
Would you like stale cached images to be updated automatically? (yes/no) [default=yes] 
Would you like a YAML "lxd init" preseed to be printed? (yes/no) [default=no]: 

```

### Configure "root" account

```
sudo su -
cd /opt/zero-dev-os
./zed install --bashrc
./zed install --vimrc
```

### Reboot

```
sudo reboot
```

## Post Install Tweaks

### Fix menu favorites

Remove default favorites from the left menu and add the following:

* Terminator
* Firefox
* Files
* Gimp
* Settings
* Tweaks

### Change Terminator defaults

Launch "Terminator"

In the Terminator window, right click and select "Preferences"

In the Global tab:
  * Under "Appearance" change the "Unfocused terminal font brightnes" to 100% (the blinking cursor will be your indication of the focused terminal)
  * Under "Terminal Titlebar" change the "Background" color from red to Custom "1C1C1C"

In the Profiles tab (default profile):
  * Select the "General" tab and change "Font" to the font of your choice, like "Monospace Regular 12"
  * Select the "Colors" tab and change "Foreground and Background" to "White on Black"
  * Select the "Scrolling" tab and select "Infinite Scrollback"

In the Keybindings tab:
  * Change the keybinding "next_tab" to "Shift+Ctrl+Right"
  * Change the keybinding "prev_tab" to "Shift+Ctrl+Left"

### Apply Tweaks

Open the "Tweaks" tool

In the "Appearance" tab:
  * Change "Applications" to "Adwaita-dark"
  * Change "Background -> Image" to "Gorilla_Wallpaper_Grey_4096x2304.png"

In the "Extensions" tab:
  * Click the gear next to Desktop Icons and change "Show ..." to "Off" for all

In the "Top Bar" tab:
  * Change "Clock Seconds" to "On"

In the "Workspaces" tab:
  * Change to "Static Workspaces" and leave the "Number of Workspaces" set to "4"

### Change Settings

Open the "Settings" tool

In the "Power" tab:
  * Change "Power Saving - Blank Screen" to "Never"

## Create zero-dev-os LXC image

```
zed container --create-os-image
```
