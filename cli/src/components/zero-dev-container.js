const fs = require("fs")
const _ = require("lodash")
const ComponentBase = require("../base/component-base.js")

class ZeroDevContainer extends ComponentBase {
  constructor(options) {
    super(options);
    this.command = "container"

    // Set the default base image to debian/buster unless otherwise specified
    if(!this.options.baseImage) {
      this.options.baseImage = "debian/buster";
    }

    // Set the default image to zero-dev-os unless otherwise specified
    if(!this.options.imageName) {
      this.options.imageName = "zero-dev-os";
    }

    // Set containerName for code readability
    this.options.containerName = this.options.imageName

    console.log()
    this.utils.message("Options:")
    console.log(this.options);
  }

  exec() {
    let promise = new Promise((resolve, reject) => {
      resolve()

      /*
      // Delete any existing image/container
      this.utils.message("Clean up any existing images/containers")
      this.utils.shell(`/snap/bin/lxc image delete ${this.options.imageName}`)
      this.utils.shell(`/snap/bin/lxc stop ${this.options.containerName} --force`)
      this.utils.shell(`/snap/bin/lxc delete ${this.options.containerName} --force`)

      // Create container
      this.utils.message("Create container")
      this.utils.execSync(`/snap/bin/lxc launch images:${this.options.baseImage} ${this.options.containerName}`)

      // Copy ssh keys
      this.utils.shell(`/snap/bin/lxc exec ${this.options.containerName} -- mkdir ~/.ssh`)
      this.utils.shell(`/snap/bin/lxc file push ~/.ssh/id_rsa ${this.options.containerName}/root/.ssh/id_rsa`)
      this.utils.shell(`/snap/bin/lxc file push ~/.ssh/id_rsa.pub ${this.options.containerName}/root/.ssh/id_rsa.pub`)
      this.utils.shell(`/snap/bin/lxc file push ~/.ssh/id_rsa.pub ${this.options.containerName}/root/.ssh/authorized_keys`)

      // Wait for full boot of LXC container
      this.utils.message("Waiting for LXC container to boot...")
      setTimeout(() => {

        // Upgrade OS
        this.utils.shell(`/snap/bin/lxc exec ${this.options.containerName} -- apt update`)
        this.utils.shell(`/snap/bin/lxc exec ${this.options.containerName} -- apt --yes upgrade`)

        // Install zip, git
        this.utils.shell(`/snap/bin/lxc exec ${this.options.containerName} -- apt install --yes zip`)
        this.utils.shell(`/snap/bin/lxc exec ${this.options.containerName} -- apt install --yes git`)

        // Add github to known_hosts
        this.utils.shell(`/snap/bin/lxc exec ${this.options.containerName} -- bash -c 'ssh-keyscan github.com >> ~/.ssh/known_hosts'`)

        // copy zero-dev-os
        this.utils.shell(`/snap/bin/lxc file push --quiet -r ${this.options.zeroDevOSDir} ${this.options.containerName}/root`)

        // configure keyboard
        this.utils.shell(`/snap/bin/lxc exec ${this.options.containerName} -- apt install --yes apt-utils`)
        this.utils.shell(`/snap/bin/lxc exec ${this.options.containerName} -- apt install --yes debconf-utils`)
        this.utils.shell(`/snap/bin/lxc exec ${this.options.containerName} -- bash -c 'debconf-set-selections < ~/zero-dev-os/configurations/keyboard-configuration.conf'`)
        this.utils.shell(`/snap/bin/lxc exec ${this.options.containerName} -- apt install --yes keyboard-configuration`)
        this.utils.shell(`/snap/bin/lxc exec ${this.options.containerName} -- dpkg-reconfigure keyboard-configuration -f noninteractive`)

        this.utils.shell(`/snap/bin/lxc exec ${this.options.containerName} -- apt install --yes wget`)
        this.utils.shell(`/snap/bin/lxc exec ${this.options.containerName} -- apt install --yes curl`)
        this.utils.shell(`/snap/bin/lxc exec ${this.options.containerName} -- apt install --yes locales`)

        this.utils.shell(`/snap/bin/lxc exec ${this.options.containerName} -- apt install --yes net-tools`)
        this.utils.shell(`/snap/bin/lxc exec ${this.options.containerName} -- apt install --yes inotify-tools`)
        this.utils.shell(`/snap/bin/lxc exec ${this.options.containerName} -- apt install --yes ntpdate`)
        this.utils.shell(`/snap/bin/lxc exec ${this.options.containerName} -- apt install --yes htop`)
        this.utils.shell(`/snap/bin/lxc exec ${this.options.containerName} -- apt install --yes build-essential`)
        this.utils.shell(`/snap/bin/lxc exec ${this.options.containerName} -- apt install --yes ntp`)
        this.utils.shell(`/snap/bin/lxc exec ${this.options.containerName} -- apt install --yes unzip`)
        this.utils.shell(`/snap/bin/lxc exec ${this.options.containerName} -- timedatectl set-timezone US/Eastern`)

        this.utils.shell(`/snap/bin/lxc exec ${this.options.containerName} -- git config --global push.default simple`)
        this.utils.shell(`/snap/bin/lxc exec ${this.options.containerName} -- git clone https://github.com/VundleVim/Vundle.vim.git ${this.options.home}/.vim/bundle/Vundle.vim`)

        this.utils.shell(`/snap/bin/lxc exec ${this.options.containerName} -- apt install --yes vim`)
        this.utils.shell(`/snap/bin/lxc exec ${this.options.containerName} -- apt install --yes vim-gtk`)
        this.utils.shell(`/snap/bin/lxc exec ${this.options.containerName} -- apt install --yes sudo`)
        this.utils.shell(`/snap/bin/lxc exec ${this.options.containerName} -- apt install --yes gnupg gnupg2 gnupg1`)

        this.utils.shell(`/snap/bin/lxc exec ${this.options.containerName} -- apt install --yes cmake`)
        this.utils.shell(`/snap/bin/lxc exec ${this.options.containerName} -- apt install --yes libssl-dev`)
        this.utils.shell(`/snap/bin/lxc exec ${this.options.containerName} -- apt install --yes libcurl4`)
        this.utils.shell(`/snap/bin/lxc exec ${this.options.containerName} -- apt install --yes libcurl4-openssl-dev`)

        this.utils.shell(`/snap/bin/lxc exec ${this.options.containerName} -- apt install --yes openssh-server`)
        this.utils.shell(`/snap/bin/lxc exec ${this.options.containerName} -- apt install --yes libpcre3 libpcre3-dev`)
        this.utils.shell(`/snap/bin/lxc exec ${this.options.containerName} -- apt install --yes zlib1g zlib1g-dev`)
        this.utils.shell(`/snap/bin/lxc exec ${this.options.containerName} -- apt install --yes uuid-dev`)

        this.utils.shell(`/snap/bin/lxc exec ${this.options.containerName} -- apt install --yes xorg`)

        this.utils.shell(`/snap/bin/lxc exec ${this.options.containerName} -- echo "en_US.UTF-8 UTF-8" >> /etc/locale.gen`)
        this.utils.shell(`/snap/bin/lxc exec ${this.options.containerName} -- /usr/sbin/locale-gen`)

        this.utils.shell(`/snap/bin/lxc exec ${this.options.containerName} -- apt install --yes curl software-properties-common`)
        this.utils.shell(`/snap/bin/lxc exec ${this.options.containerName} -- bash -c 'curl -sL https://deb.nodesource.com/setup_12.x | sudo bash -'`)
        this.utils.shell(`/snap/bin/lxc exec ${this.options.containerName} -- apt install --yes nodejs`)
        this.utils.shell(`/snap/bin/lxc exec ${this.options.containerName} -- npm install -g pm2`)
        this.utils.shell(`/snap/bin/lxc exec ${this.options.containerName} -- npm install -g apidoc`)
        this.utils.shell(`/snap/bin/lxc exec ${this.options.containerName} -- apt install --yes nginx`)

        let vimrcContent = `
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
        this.utils.shell(`/snap/bin/lxc file push /tmp/vimrc ${this.options.containerName}/root/.vimrc`)

        this.utils.shell(`/snap/bin/lxc exec ${this.options.containerName} -- vi -c "PluginInstall" ~/.vimrc -c "qa"`)

        let bashrcContent = `
# Set up vi options
set -o vi
export EDITOR=vi
export VISUAL=vi

# Set prompt
export PS1='
\\e[35m$USER\\e[0m@$HOSTNAME [\\D{%H:%M:%S}] $PWD
$> '

export PATH="$PATH:/snap/bin:$HOME/zero-dev-os:$HOME/zero-dev-os/tools"

function title {
  echo -ne "\\033]0;"$*"\\007"
}

export LC_ALL=en_US.utf-8 
export LANG="$LC_ALL"

alias la='zero-dev-os.sh'
`

        fs.writeFileSync("/tmp/bashrc", bashrcContent)
        this.utils.shell(`/snap/bin/lxc file push /tmp/bashrc ${this.options.containerName}/root/.bashrc`)

        // stop container
        this.utils.shell(`/snap/bin/lxc stop ${this.options.containerName} --force`)

        // publish image
        this.utils.shell(`/snap/bin/lxc publish --alias ${this.options.containerName} ${this.options.containerName} description="An image of ${this.options.containerName}"`)

        resolve()

      }, 10000)
      */
    })
    .catch((error) => {
      this.utils.error(error)
      process.exit(-1)
    })

    return(promise)
  }
} 

module.exports = ZeroDevContainer
