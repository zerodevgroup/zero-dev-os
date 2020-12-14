const fs = require("fs")
const _ = require("lodash")
const shell = require("shelljs")
const ComponentBase = require("../base/component-base.js")

class ZeroDevInstall extends ComponentBase {
  constructor(options) {
    super(options);
    this.command = "install"

    console.log()
    this.utils.message("Options:")
    console.log(this.options);

    this.operations = [
      "core",
      "desktop",
      "essential",
      "all",
      "bashrc",
      "vimrc",
      "mongo",
      "graphics",
    ]

    this.validate()
  }

  exec() {
    let promise = new Promise((resolve, reject) => {
      this.operations.forEach((operation) => {
        let shouldInstall = false

        if(this.options.all || this.options[operation]) {
          shouldInstall = true
          console.log(operation)
        }
        else if(this.options.essential && (operation.test(/^(core|bashrc|vimrc)$/))) {
          shouldInstall = true
        }

        if(shouldInstall) {
          this[operation]()
        }
      })

      resolve()

    })
    .catch((error) => {
      this.utils.error(error)
      process.exit(-1)
    })

    return(promise)
  }

  bashrc() {
    this.utils.title("Installing Zero Dev OS Bashrc")

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

alias zero-dev-os='zero-dev-os.sh'
`

    fs.writeFileSync("/tmp/bashrc", bashrcContent)
    this.utils.shell(`cp /tmp/bashrc ${this.options.home}/.bashrc`)
  }

  core() {
    this.utils.title("Installing Zero Dev OS Core")

    // Upgrade OS
    this.utils.shell("apt update")
    this.utils.shell("apt --yes upgrade")

    // Install zip, git
    this.utils.shell("apt install --yes zip")
    this.utils.shell("apt install --yes git")

    // Add github to known_hosts
    this.utils.shell("bash -c 'ssh-keyscan github.com >> ~/.ssh/known_hosts'")

    // configure keyboard
    this.utils.shell("apt install --yes apt-utils")
    this.utils.shell("apt install --yes debconf-utils")
    this.utils.shell(`bash -c 'debconf-set-selections < ${this.options.zeroDevOSDir}/configurations/keyboard-configuration.conf'`)
    this.utils.shell("apt install --yes keyboard-configuration")
    this.utils.shell("dpkg-reconfigure keyboard-configuration -f noninteractive")

    this.utils.shell("apt install --yes wget")
    this.utils.shell("apt install --yes curl")
    this.utils.shell("apt install --yes locales")

    this.utils.shell("apt install --yes net-tools")
    this.utils.shell("apt install --yes inotify-tools")
    this.utils.shell("apt install --yes ntpdate")
    this.utils.shell("apt install --yes htop")
    this.utils.shell("apt install --yes build-essential")
    this.utils.shell("apt install --yes ntp")
    this.utils.shell("apt install --yes unzip")
    this.utils.shell("timedatectl set-timezone US/Eastern")
    this.utils.shell("git config --global push.default simple")
    this.utils.shell("git config --global pull.rebase false")

    this.utils.shell("apt install --yes sudo")
    this.utils.shell("apt install --yes gnupg gnupg2 gnupg1")

    this.utils.shell("apt install --yes cmake")
    this.utils.shell("apt install --yes libssl-dev")
    this.utils.shell("apt install --yes libcurl4")
    this.utils.shell("apt install --yes libcurl4-openssl-dev")

    this.utils.shell("apt install --yes vim")
    this.utils.shell("apt install --yes vim-gtk")

    this.utils.shell("apt install --yes openssh-server")
    this.utils.shell("apt install --yes libpcre3 libpcre3-dev")
    this.utils.shell("apt install --yes zlib1g zlib1g-dev")
    this.utils.shell("apt install --yes uuid-dev")

    this.utils.shell(`echo "en_US.UTF-8 UTF-8" >> /etc/locale.gen`)
    this.utils.shell("/usr/sbin/locale-gen")

    this.utils.shell("apt install --yes software-properties-common")
    this.utils.shell("bash -c 'curl -sL https://deb.nodesource.com/setup_14.x | sudo bash -'")
    this.utils.shell("apt install --yes nodejs")
    this.utils.shell("npm install -g pm2")
    this.utils.shell("npm install -g apidoc")
    this.utils.shell("npm install -g typescript")
    this.utils.shell("npm install -g @angular/cli > /dev/null")
    this.utils.shell("apt install --yes nginx")
    this.utils.shell("apt install --yes python3-pip")
    this.utils.shell("pip3 install weasyprint")
  }

  desktop() {
    this.utils.title("Installing Zero Dev OS Desktop")

    this.utils.shell("echo ttf-mscorefonts-installer msttcorefonts/accepted-mscorefonts-eula select true | sudo debconf-set-selections")
    this.utils.shell("apt install --yes ttf-mscorefonts-installer")
    this.utils.shell("apt install --yes chromium-browser")
    this.utils.shell("apt install --yes terminator")
    this.utils.shell("apt install --yes gnome-tweak-tool")
    this.utils.shell("apt install --yes ubuntu-restricted-extras")
  }

  developer() {
    this.utils.shell("wget -O /tmp/vs-code-install.sh https://code.headmelted.com/installers/apt.sh")
  }

  graphics() {
    this.utils.title("Installing Zero Dev OS Graphics")

    this.utils.shell("apt install --yes gimp")

    // TODO: Install Imagemagick
  }

  mongo() {
    this.utils.title("Installing Zero Dev OS MongoDB")

    this.utils.shell("wget -qO - https://www.mongodb.org/static/pgp/server-4.4.asc | sudo apt-key add -")
    this.utils.shell("echo 'deb http://repo.mongodb.org/apt/debian buster/mongodb-org/4.4 main' | sudo tee /etc/apt/sources.list.d/mongodb-org-4.4.list")
    this.utils.shell("apt update")
    this.utils.shell("apt install --yes mongodb-org")
    this.utils.shell("systemctl enable mongod")
    this.utils.shell("systemctl start mongod")
  }

  vimrc() {
    this.utils.title("Installing Zero Dev OS Vimrc")

    this.utils.shell(`git clone https://github.com/VundleVim/Vundle.vim.git ${this.options.home}/.vim/bundle/Vundle.vim`)

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
    this.utils.shell(`cp /tmp/vimrc ${this.options.home}/.vimrc`)

    this.utils.shell(`vi -c "PluginInstall" ~/.vimrc -c "qa"`)
  }

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
      this.utils.warn("No operations were specified.")

      console.log()
      shell.exec(`${this.options.zeroDevOSDir}/zero-dev-os.sh ${this.command} --help`)

      process.exit(-1)
    }
  }
} 

module.exports = ZeroDevInstall
