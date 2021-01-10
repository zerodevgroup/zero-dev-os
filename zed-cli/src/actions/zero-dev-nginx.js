const fs = require("fs")
const _ = require("lodash")
const shell = require("shelljs")
const { execSync } = require("child_process")

const utils = require("../utils/zero-dev-utils.js")

class ZeroDevNginx {
  constructor(options) {
    this.options = options
    this.command = "nginx"

    this.operations = [
      "container",
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

  container() {
    let port = this.options.port ? this.options.port : 3000

    let code = `\
worker_processes  1;
pid  /run/nginx.pid;
events {
  worker_connections  1024;
}


http {
  include     mime.types;
  default_type  application/octet-stream;

  sendfile    on;
  #tcp_nopush   on;

  #keepalive_timeout  0;
  keepalive_timeout  65;

  server {
    listen     80;
    server_name  localhost;

    #charset koi8-r;

    #access_log  logs/host.access.log  main;
    client_max_body_size 1000m;

    location / {
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header Host $http_host;
      proxy_set_header X-NginX-Proxy true;
      rewrite ^/?(.*) /$1 break;
      proxy_pass http://localhost:${port}/;
      proxy_redirect off;
    }

    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
      root   html;
    }

  }
}\
`
    fs.writeFileSync("/etc/nginx/nginx.conf", code)

    utils.shell("systemctl restart nginx")
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
      utils.warn("no operations were specified...")

      console.log()
      shell.exec(`${this.options.zeroDevOSDir}/zed ${this.command} --help`)

      process.exit(-1)
    }
  }
} 

module.exports = ZeroDevNginx
