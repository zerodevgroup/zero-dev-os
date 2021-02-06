const fs = require("fs")
const _ = require("lodash")
const os = require("os")
const shell = require("shelljs")

const utils = require("../utils/zero-dev-utils.js")

class ZeroDevInstall {
  constructor(options) {
    this.options = options
    this.command = "install"

    this.operations = [
      "bashrc",
      "core",
      "disableSudoPassword",
      "desktop",
      "development",
      "flatpak",
      "graphics",
      "limitSwap",
      "lxd",
      "postgres",
      "postgresClient",
      "swift",
      "vimrc",
    ]

    this.validate()
  }

  exec() {
    let promise = new Promise((resolve, reject) => {
      this.operations.forEach((operation) => {
        if(this.options[operation]) {
          this[operation]()
        }
      })

      resolve()

    })
    .catch((error) => {
      utils.error(error)
      process.exit(-1)
    })

    return(promise)
  }

  bashrc() {
    utils.title("installing zero-dev-os bashrc")

    let bashrcContent = `\
# Set up vi options
set -o vi
export EDITOR=vi
export VISUAL=vi

export ZERO_DEV_OS="${this.options.zeroDevOSDir}"
export PATH="$PATH:/snap/bin:$ZERO_DEV_OS:$ZERO_DEV_OS/tools"

export IP_ADDRESS=$($ZERO_DEV_OS/tools/ip-address.sh)

export HOSTNAME=$(hostname)

# Set prompt
export PS1='
\\e[35m$USER\\e[0m@$HOSTNAME->$IP_ADDRESS [\\D{%H:%M:%S}] $PWD
$> '

function title {
echo -ne "\\033]0;"$*"\\007"
}

export LC_ALL=en_US.utf-8 
export LANG="$LC_ALL"

alias root='sudo su -'
`

    fs.writeFileSync("/tmp/bashrc", bashrcContent)
    utils.shell(`sudo --user=${this.options.user} cp /tmp/bashrc ${this.options.home}/.bashrc`)
  }

  core() {
    utils.title("installing zero-dev-os core")

    // Upgrade OS
    utils.shell("apt update")
    utils.shell("apt --yes upgrade")

    // Install zip, git, sudo
    utils.shell("apt install --yes zip")
    utils.shell("apt install --yes git")
    utils.shell("apt install --yes sudo")

    // Add github to known_hosts
    utils.shell(`sudo --user=${this.options.user} bash -c 'ssh-keyscan github.com >> ${this.options.home}/.ssh/known_hosts'`)

    // configure keyboard
    utils.shell("apt install --yes apt-utils")
    utils.shell("apt install --yes debconf-utils")
    utils.shell(`bash -c 'debconf-set-selections < ${this.options.zeroDevOSDir}/configurations/keyboard-configuration.conf'`)
    utils.shell("apt install --yes keyboard-configuration")
    utils.shell("dpkg-reconfigure keyboard-configuration -f noninteractive")

    utils.shell("apt install --yes wget")
    utils.shell("apt install --yes curl")
    utils.shell("apt install --yes locales")

    utils.shell("apt install --yes net-tools")
    utils.shell("apt install --yes inotify-tools")
    utils.shell("apt install --yes ntpdate")
    utils.shell("apt install --yes htop")
    utils.shell("apt install --yes build-essential")
    utils.shell("apt install --yes ntp")
    utils.shell("apt install --yes unzip")
    utils.shell("timedatectl set-timezone US/Eastern")

    utils.shell(`sudo --user=${this.options.user} git config --global push.default simple`)
    utils.shell(`sudo --user=${this.options.user} git config --global pull.rebase false`)

    utils.shell("apt install --yes gnupg gnupg2 gnupg1")

    utils.shell("apt install --yes cmake")
    utils.shell("apt install --yes libssl-dev")
    utils.shell("apt install --yes libcurl4")
    utils.shell("apt install --yes libcurl4-openssl-dev")

    utils.shell("apt install --yes vim")
    utils.shell("apt install --yes vim-gtk")

    utils.shell("apt install --yes openssh-server")
    utils.shell("apt install --yes libpcre3 libpcre3-dev")
    utils.shell("apt install --yes zlib1g zlib1g-dev")
    utils.shell("apt install --yes uuid-dev")

    utils.shell(`echo "en_US.UTF-8 UTF-8" >> /etc/locale.gen`)
    utils.shell("/usr/sbin/locale-gen")

    utils.shell("apt install --yes software-properties-common")
    utils.shell("npm install -g pm2")
    utils.shell("npm install -g apidoc")
    utils.shell("npm install -g npm-check-updates")

    utils.shell("apt install --yes python3-pip")

    utils.shell("apt install --yes nginx")
  }

  desktop() {
    utils.title("installing zero-dev-os desktop")

    utils.shell("echo ttf-mscorefonts-installer msttcorefonts/accepted-mscorefonts-eula select true | debconf-set-selections")
    utils.shell("apt install --yes ttf-mscorefonts-installer")
    utils.shell("apt install --yes terminator")
    utils.shell("apt install --yes gnome-tweak-tool")
    utils.shell("apt install --yes ubuntu-restricted-extras")
    utils.shell("apt install --yes ffmpeg")
    utils.shell("apt install --yes chromium-browser")
  }

  disableSudoPassword() {

    let sudoersContent = `\
#
# This file MUST be edited with the 'visudo' command as root.
#
# Please consider adding local content in /etc/sudoers.d/ instead of
# directly modifying this file.
#
# See the man page for details on how to write a sudoers file.
#
Defaults	env_reset
Defaults	mail_badpass
Defaults	secure_path="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/snap/bin"

# Host alias specification

# User alias specification

# Cmnd alias specification

# User privilege specification
root	ALL=(ALL:ALL) ALL

# Members of the admin group may gain root privileges
%admin ALL=(ALL) ALL

# Allow members of group sudo to execute any command
%sudo	ALL=(ALL:ALL) ALL

# See sudoers(5) for more information on "#include" directives:

#includedir /etc/sudoers.d

developer ALL=(ALL:ALL) NOPASSWD: ALL
`
    fs.writeFileSync("/tmp/sudoers", sudoersContent)
    utils.shell(`cp /tmp/sudoers /etc/sudoers`)
  }

  development() {
    utils.shell("npm install -g typescript")
    utils.shell("npm install -g @angular/cli > /dev/null")

    // VS Code
    utils.shell("wget -O /tmp/vs-code.deb 'https://code.visualstudio.com/sha/download?build=stable&os=linux-deb-arm64'")
    utils.shell("apt install /tmp/vs-code.deb")
  }

  flatpak() {
    utils.title("installing zero-dev-os flatpak")
    utils.shell("apt install --yes flatpak")
    utils.shell("apt install --yes gnome-software-plugin-flatpak")
    utils.shell("flatpak remote-add --if-not-exists flathub https://flathub.org/repo/flathub.flatpakrepo")
  }
  graphics() {
    utils.title("installing zero-dev-os graphics")

    utils.shell("apt install --yes gimp")
    utils.shell("apt install --yes ffmpeg")

    // TODO: Install Imagemagick
  }

  limitSwap() {
    // TODO: Read in /etc/sysctl.conf and only modify the "vm.swapiness" value
    utils.shell("echo 'vm.swappiness = 0' > /etc/sysctl.conf")
  }

  lxd() {
    utils.shell("snap install lxd")
  }

  postgres() {
    utils.title("installing postgres")
    utils.shell("apt install --yes postgresql postgresql-contrib postgresql-client")
  }

  postgresClient() {
    utils.title("installing postgres client")
    utils.shell("apt install --yes postgresql-client")
  }

  swift() {
    utils.title("installing swift")
    utils.shell("cd /tmp")
    utils.shell("wget https://packagecloud.io/install/repositories/swift-arm/release/script.deb.sh")
    utils.shell("chmod +x script.deb.sh")
    utils.shell("os=ubuntu dist=focal ./script.deb.sh")
    utils.shwll("sudo apt-get install swiftlang")
  }

  vimrc() {
    utils.title("Installing Zero Dev OS Vimrc")

    let vimrcContent = `\
" You want Vim, not vi. When Vim finds a vimrc, 'nocompatible' is set anyway.
" We set it explicitely to make our position clear!
set nocompatible

filetype plugin indent on  " Load plugins according to detected filetype.
syntax on                  " Enable syntax highlighting.

set autoindent             " Indent according to previous line.
set expandtab              " Use spaces instead of tabs.
set softtabstop=2          " Tab key indents by 2 spaces.
set shiftwidth=2           " >> indents by 2 spaces.
set shiftround             " >> indents to next multiple of 'shiftwidth'.

set backspace=indent,eol,start  " Make backspace work as you would expect.
set hidden                 " Switch between buffers without having to save first.
set laststatus=2           " Always show statusline.
set display=lastline       " Show as much as possible of the last line.

set showmode               " Show current mode in command-line.
set showcmd                " Show already typed keys when more are expected.

set ttyfast                " Faster redrawing.
set lazyredraw             " Only redraw when necessary.

set splitbelow             " Open new windows below the current window.
set splitright             " Open new windows right of the current window.

set wrapscan               " Searches wrap around end-of-file.
set report=0               " Always report changed lines.
set synmaxcol=200          " Only highlight the first 200 columns.

set list                   " Show non-printable characters.
if has('multi_byte') && &encoding ==# 'utf-8'
  let &listchars = 'tab:▸ ,extends:❯,precedes:❮,nbsp:±'
else
  let &listchars = 'tab:> ,extends:>,precedes:<,nbsp:.'
endif

set nobackup
set noswapfile
set directory=/tmp
set viminfo='100,n$HOME/.vim/files/info/viminfo

" Use new regular expression engine
set re=0
set number

let mapleader = "-"
map <Leader>e :Explore<Enter>

autocmd StdinReadPre * let s:std_in=1
autocmd VimEnter * if argc() == 0 && !exists("s:std_in") | Explore | endif
`

    fs.writeFileSync("/tmp/vimrc", vimrcContent)
    utils.shell(`cp /tmp/vimrc ${this.options.home}/.vimrc`)
  }

  //
  // Utility methods
  //

  validate() {
    let validOptions = false
    let messages = []

    this.operations.forEach((operation) => {
      if(this.options[operation]) {
        validOptions = true
      }
    })

    if(!validOptions) {
      console.log()
      utils.warn("no operations were specified")

      console.log()
      shell.exec(`${this.options.zeroDevOSDir}/zed ${this.command} --help`)

      process.exit(-1)
    }
  }
} 

module.exports = ZeroDevInstall
