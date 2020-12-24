const fs = require("fs")
const _ = require("lodash")
const os = require("os")
const shell = require("shelljs")

const utils = require("../utils/zero-dev-utils.js")

class ZeroDevInstall {
  constructor(options) {
    this.options = options
    this.command = "install"

    console.log()
    utils.message("Options:")
    console.log(this.options);

    this.operations = [
      "core",
      "limitSwap",
      "disableSudoPassword",
      "bashrc",
      "vimrc",
      "desktop",
      "development",
      "graphics",
      "lxd",
      "mongo",
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
    utils.title("Installing Zero Dev OS Bashrc")

    let bashrcContent = `\
# Set up vi options
set -o vi
export EDITOR=vi
export VISUAL=vi

export ZERO_DEV_OS="${this.options.zeroDevOSDir}"
export PATH="$PATH:/snap/bin:$ZERO_DEV_OS:$ZERO_DEV_OS/tools"

export IP_ADDRESS=$($ZERO_DEV_OS/tools/ip-address.sh)

# Set prompt
export PS1='
\\e[35m$USER\\e[0m@pi->$IP_ADDRESS [\\D{%H:%M:%S}] $PWD
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
    utils.title("Installing Zero Dev OS Core")

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
    utils.title("Installing Zero Dev OS Desktop")

    utils.shell("echo ttf-mscorefonts-installer msttcorefonts/accepted-mscorefonts-eula select true | debconf-set-selections")
    utils.shell("apt install --yes ttf-mscorefonts-installer")
    utils.shell("apt install --yes terminator")
    utils.shell("apt install --yes gnome-tweak-tool")
    utils.shell("apt install --yes ubuntu-restricted-extras")
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
    utils.shell("wget -O /tmp/vs-code-install.sh https://code.headmelted.com/installers/apt.sh")
    utils.shell("chmod +x /tmp/vs-code-install.sh")
    utils.shell("/tmp/vs-code-install.sh")
  }

  graphics() {
    utils.title("Installing Zero Dev OS Graphics")

    utils.shell("apt install --yes gimp")

    // TODO: Install Imagemagick
  }

  mongo() {
    utils.title("Installing Zero Dev OS MongoDB")

    utils.shell("wget -qO - https://www.mongodb.org/static/pgp/server-4.4.asc | apt-key add -")
    utils.shell("echo \"deb [ arch=arm64 ] https://repo.mongodb.org/apt/debian buster/mongodb-org/4.4 main\" | tee /etc/apt/sources.list.d/mongodb-org-4.4.list")
    utils.shell("apt update")
    utils.shell("apt install --yes mongodb-org")
    utils.shell("systemctl enable mongod")
    utils.shell("systemctl start mongod")
  }

  limitSwap() {
    // TODO: Read in /etc/sysctl.conf and only modify the "vm.swapiness" value
    utils.shell("echo 'vm.swappiness = 0' > /etc/sysctl.conf")
  }

  lxd() {
    utils.shell("snap install lxd")
  }

  vimrc() {
    utils.title("Installing Zero Dev OS Vimrc")

    utils.shell(`sudo --user=${this.options.user} git clone https://github.com/VundleVim/Vundle.vim.git ${this.options.home}/.vim/bundle/Vundle.vim`)

    let vimrcContent = `\
set nocompatible              " be iMproved, required
filetype off                  " required
" set the runtime path to include Vundle and initialize
set rtp+=~/.vim/bundle/Vundle.vim
call vundle#begin()
" alternatively, pass a path where Vundle should install plugins
"call vundle#begin('~/some/path/here')
" let Vundle manage Vundle, required
Plugin 'VundleVim/Vundle.vim'
Plugin 'scrooloose/nerdtree'
Plugin 'jistr/vim-nerdtree-tabs'
" All of your Plugins must be added before the following line
call vundle#end()            " required
filetype plugin indent on    " required
"
:set expandtab
:set shiftwidth=2
:set softtabstop=2
:set tabstop=2
:set directory=/tmp
:set nobackup
:set nowb
:set noswapfile
:noh
:syntax on
:set wildmode=list:longest
:set hidden
:set wildmenu
:set showcmd
:set smartcase
:set backspace=indent,eol,start
:set autoindent
:set ruler
:set laststatus=2
:set mouse=a
:set number
let mapleader = "-"
:map Y y$
let NERDTreeShowHidden=1
:map <Leader>p :set mouse=<CR><bar>:set paste<CR><bar>:set nonumber<CR><bar><plug>NERDTreeTabsClose<CR>
:map <Leader>np :set mouse=a<CR><bar>:set nopaste<CR><bar>:set number<CR><bar><plug>NERDTreeTabsOpen<CR><C-w><C-w>
:map <Leader>n <plug>NERDTreeTabsToggle<CR>
:map <Leader>no  <plug>NERDTreeTabsOpen
:map <Leader>nc  <plug>NERDTreeTabsClose
:map <Leader>ntoggle  <plug>NERDTreeTabsToggle
:map <Leader>nf  <plug>NERDTreeTabsFind
:map <Leader>mir  <plug>NERDTreeMirrorOpen
:map <Leader>mirt  <plug>NERDTreeMirrorToggle
:map <Leader>ntopen  <plug>NERDTreeSteppedOpen
:map <Leader>ntclose  <plug>NERDTreeSteppedClose
:set clipboard^=unnamed
nnoremap <C-J> <C-W><C-J>
nnoremap <C-K> <C-W><C-K>
nnoremap <C-L> <C-W><C-L>
nnoremap <C-H> <C-W><C-H>
filetype plugin indent on
autocmd StdinReadPre * let s:std_in=1
autocmd VimEnter * if argc() == 0 && !exists("s:std_in") | NERDTree | endif
autocmd bufenter * if (winnr("$") == 1 && exists("b:NERDTree") && b:NERDTree.isTabTree()) | q | endif
`

    fs.writeFileSync("/tmp/vimrc", vimrcContent)
    utils.shell(`cp /tmp/vimrc ${this.options.home}/.vimrc`)

    utils.shell(`sudo --user=${this.options.user} vi -c "PluginInstall" ${this.options.home}/.vimrc -c "qa"`)
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
      utils.warn("No operations were specified.")

      console.log()
      shell.exec(`${this.options.zeroDevOSDir}/zero-dev-os ${this.command} --help`)

      process.exit(-1)
    }
  }
} 

module.exports = ZeroDevInstall
