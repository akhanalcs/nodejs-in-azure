# nodejs
Learning NodeJS from the official page.

https://nodejs.org/en/learn/getting-started/introduction-to-nodejs

## Community provided info
### Basics
Understand modern JS (must read):  
https://medium.com/the-node-js-collection/modern-javascript-explained-for-dinosaurs-f695e9747b70

Understand event loop:  
https://www.lydiahallie.com/blog/event-loop (excellent)

https://youtu.be/eiC58R16hb8?si=94cBiHOutInfFmU5

REST APIs best practices reference:  
https://petstore.swagger.io

### Structuring Node apps and best practices
https://alexkondov.com/tao-of-node/ - Looks great

https://github.com/goldbergyoni/nodebestpractices

https://github.com/goldbergyoni/nodejs-testing-best-practices

### ORM
Kysely as query builder, and Prisma for studio/schemas/migrations.  
Either use this 👆or MikroORM or Drizzle ([community thinks it'll become like EF someday](https://github.com/drizzle-team/drizzle-orm/discussions/1339#discussioncomment-12694078)).

Check out sample apps in the Prisma repo. It has Express app.

What I also saw:
- MikroORM (popular). [Reference](https://www.reddit.com/r/node/comments/198uugu/comment/kieokf1/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button)
- Drizzle (new kid in the block).
- TypeORM (someone said it's a dead project).
- Prisma (being criticized as not implementing true unit-of-work pattern that should be in ORMs and is just a query builder; I need to verify this. Someone experienced also said that it's better than TypeORM and Sequelize).

I'd probably just use `ms/sql` package.

### Sample apps
- If you want a monorepo with frontend, check tRPC, and it has example apps.
- If you like C#/Java there is Nest.js with examples.
- In case you're going to use Prisma there are example repos for it.
- Or check out: https://maxrozen.com/examples-of-large-production-grade-open-source-react-apps

### Node Issues and Solutions (TODO: Need to be cleaned up)
#### Issue by c-digs (the guys who created excellent .NET modular monolith example)
https://www.reddit.com/r/webdev/comments/1kph8b2/comment/msxs3og/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button

#### Solution from c-digs
[Nestia + Typia + Kysely](https://docs.google.com/presentation/d/1fToIKvR7dyvQS1AAtp4YuSwN6qi2kj_GBoIEJioWyTM/edit?usp=sharing)

https://www.reddit.com/r/webdev/comments/1kph8b2/comment/msztgty/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button

#### Solution from 30thnight
This is a great response.

For addressing some of the warts listed:

node supports typescript type stripping now - which can be used to reduce your tooling requirements (or just use bun/deno)

modern validation libraries adhere to the standard spec and can be used interchangeably. This is useful because modern api servers like hono.js support automatic openapi codegen from your validation schemas like this (Arktype and Zod v4 are great options)

in cases where performance is your primary concern, consider your validation library to Typia (the fastest feature complete system I know that doesn’t require writing validation schemas and supports its own openapi spec generation - benchmark

use a monorepo structure with NX to share types across domains / packages.

for small apis that only have a single JS based consumer, consider using tools like orpc or trpc.

for sql orms, very little can compete with EF core but for what we’re talking about - I highly recommend using Drizzle.

for package security, many companies I’ve been at used snky.io for dependency checks. Others would mirror packages in our internal setup (GitHub packages or Artifactory). In 2025, I’d advise people to avoid packages that don’t publish provenance data and use checks like this: https://github.com/actions/dependency-review-action

asp.net, golang, and elixir are my choices for most usecases but I personally would choose typescript before ruby or python for general crud work.

## Install NodeJS using nvm
https://nodejs.org/en/download

or use this guide:  
https://heynode.com/tutorial/install-nodejs-locally-nvm/

or check out their GitHub page:  
https://github.com/nvm-sh/nvm

Your shell profile should have the following lines:
```
# Define "NVM_DIR" environment variable with "export" to define where nvm is installed
# -s likely means size, so second line below checks if nvm.sh file exists and is not empty. 
# If yes, the "."(source) command loads it to initialize nvm functionality in the current shell session.
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
```

After installation, tell `nvm` to use the latest version of Node.js to use when you start a new shell session 
so that you don't have to manually set it every time you restart your computer.
```bash
# Got below info by running `nvm` on terminal
# Always default to the latest available node version on a shell
nvm alias default node

# OR use latest LTS (Long Term Support) version - recommended for stability
nvm alias default lts/*
```

If you don't do above, you will have to run `nvm use node` or `nvm use lts/*` every time you start a new shell session.
```bash
$ nvm current
none
$ nvm use node
Now using node v23.10.0 (npm v10.9.2)
$ node -v
v23.10.0
```

## Intro
A Node.js app runs in a single process, without creating a new thread for every request.
Node.js provides a set of asynchronous I/O primitives in its standard library that prevent JavaScript code from blocking and generally,
libraries in Node.js are written using non-blocking paradigms, making blocking behavior the exception rather than the norm.

"Asynchronous I/O primitives" refers to the basic building blocks in Node.js that allow input/output operations
(like reading files, making network requests) to be performed without blocking the main execution thread.

Instead of waiting for an operation to complete before continuing (blocking), these primitives allow Node.js to:
1. Start an I/O operation
2. Continue executing other code while the operation is in progress
3. Handle the result when it's ready via callbacks, promises, or async/await

Examples of these primitives include:
- File system operations (`fs` module)
- Network requests (HTTP/HTTPS modules)
- Timers (setTimeout, setInterval)
- Event emitters

This asynchronous approach is what enables Node.js to efficiently handle many concurrent operations with a single thread.

## V8 and Event Loop
- V8 is JS engine. It has stack and heap. It executes JS code.
- NodeJS Event loop is inside Libuv not inside V8. Take a quick look: https://docs.libuv.org/en/v1.x/design.html
- libuv uses a thread pool to make asynchronous file I/O operations possible, but network I/O is always performed in a single thread, each loop’s thread.
- All (network) I/O is performed on non-blocking sockets which are polled using the best mechanism available on the given platform: epoll on Linux, kqueue on OSX and IOCP on Windows.

AI generated diagram:
```mermaid
graph TD
  A[JavaScript Code] --> B(V8 Engine)
  B -->|"Calls APIs<br>(fs/net/timers)"| C[Libuv]
  C -->|"Event Loop<br>(uv_run())"| D["OS-level Async I/O<br>(epoll/kqueue/IOCP)"]
  C -->|"Thread Pool<br>(Default: 4 threads)"| E["Blocking Operations<br>(File I/O, DNS Ops.)"]
```

## Threads in Node - AI generated with my edits
1. The **main event loop thread** (running your JS code) - Executes JavaScript and runs Libuv's event loop.
   - Single thread alternating between:
     - V8 JavaScript execution (call stack, heap).
     - Libuv event loop (`uv_run()`) for I/O scheduling. Libuv manages the event loop on the main thread.
     - More info: https://docs.libuv.org/en/v1.x/design.html
2. The **Inspector communication thread** (handling messages to/from the debugger client) - When running Node with `--inspect`, communication with debugger clients happens on a dedicated thread to avoid blocking the main thread.
   - Dedicated thread created by Node.js (not Libuv/V8).
   - Not a `worker_thread`; internal to Node.js.
   - V8 provides the [Inspector Protocol (debugging API)](https://v8.dev/docs/inspector), but Node.js manages the actual communication thread (WebSocket server for debugger clients).
3. Threads in the **Libuv thread pool** (handling async I/O)
   - Tasks: File I/O, DNS, crypto.
   - Shared across all threads (main + workers).
   - Does not handle network I/O (uses OS non-blocking sockets).
4. **V8 helper threads** (for V8 engine operations like GC, JIT, etc.).
5. **Worker threads** (parallel JavaScript execution via `worker_threads` module)
   - These are separate threads that can run JavaScript code in parallel to the main thread. They are useful for CPU-intensive tasks.
   - Each worker thread has its own V8 instance and a libuv event loop.
   - All libuv instances (from the main thread and all worker threads) share the same libuv thread pool (which handles file I/O, DNS lookups, and some cryptographic operations).
     ```js
     const { Worker } = require('worker_threads');
     ```
   - More info: https://nodejs.org/api/worker_threads.html

Async example:
```js
fetch('some-url') // This code gets executed off the main thread by libuv on OS level async I/O and when it completes it goes back to main thread 👇 
.then(doSomethingLater) // and executes a callback: doSomethingLater on the main thread
```

https://blog.logrocket.com/complete-guide-threads-node-js/

## CJS vs ESM - AI generated
1. **CommonJS (CJS)**:
    - The original Node.js module format
    - Uses `require()` and `module.exports`
    - Files typically use `.js` or `.cjs` extension
    - Example:
      ```javascript
      // const { createServer } uses destructuring assignment to extract only the createServer function from the module
      const { createServer } = require('node:http');
      ```

2. **ES Modules (ESM)**:
    - Modern JavaScript module system (ECMAScript standard). "M" stands for "Module". "JS" stands for JavaScript.
    - Uses `import` and `export` syntax
    - Files use `.mjs` extension, or `.js` with `"type": "module"` in `package.json`. In TypeScript projects, set `"module": "NodeNext"` in `tsconfig.json` and still use either `.mjs` extension or `"type": "module"` in package.json.
    - Example:
      ```javascript
      import { createServer } from 'node:http';
      ```

The `.mjs` file extension was introduced as a clear way to identify files using ES Module syntax, as opposed to traditional CommonJS (`.js` or `.cjs`).

This distinction was necessary because Node.js originally only supported CommonJS, and when ES Modules support was added,
there needed to be a way to tell them apart without breaking existing code. The extension provides an explicit signal to
Node.js about which module system to use when interpreting the file.

You can also use `.js` files for ES Modules by setting `"type": "module"` in your package.json file.
Node.js treats all `.js` files as CommonJS by default when there's no `"type": "module"` in package.json.

### Which is better (ESM vs CJS)? - AI generated
**ES Modules (ESM) advantages:**
- Modern JavaScript standard
- Static analysis (better tree-shaking)
- Top-level await
- Better compatibility with browser JavaScript
- The future direction of JavaScript

**CommonJS (CJS) advantages:**
- Better established in Node.js ecosystem
- Wider compatibility with older packages
- Dynamic importing
- Simpler circular dependency handling
- No need for file extensions in imports

The industry is gradually moving toward ESM, but CJS remains very common in the Node.js ecosystem, especially for existing projects.

More info: https://javascript.info/modules-intro

## First example
Create `server.mjs` with code from the docs intro page and run it: `node server.mjs`.

```bash
#List open files/processes that are using internet port 3000
$ lsof -i:3000
COMMAND  PID         USER   FD   TYPE             DEVICE SIZE/OFF NODE NAME
node    4447 ashishkhanal   15u  IPv4 0x3bcad1c175f1e33a      0t0  TCP localhost:hbci (LISTEN)
```

## V8 JavaScript Engine
V8 is the name of the JavaScript engine that powers Google Chrome. It's the thing that takes our JavaScript and executes it while browsing with Chrome.

V8 is the JavaScript engine i.e. it parses and executes JavaScript code.
The DOM, and the other Web Platform APIs (they all makeup runtime environment) are provided by the browser.

The cool thing is that the JavaScript engine (V8) is independent of the browser in which V8 is hosted.

V8 is just the JavaScript execution engine (similar to the JIT compiler part of CLR), while a complete
runtime environment (like Node.js or a browser) includes V8 plus additional APIs and capabilities.

<p>
  <img alt="image" src="screenshots/js-big-picture.png" width="450">
&nbsp;
  <img alt="image" src="screenshots/js-runtime.png" width="550">
</p>

### Check v8 version that came with your NodeJS version
```bash
# -p means print/ evaluate and print. For eg: node -p 2+2 will show 4
# This is similar to: console.log(process.versions.v8)
# process is a global object
$ node -p process.versions.v8
12.9.202.28-node.13
```

Try the same thing in REPL (Read Evaluate Print Loop) mode:
```bash
Ashishs-MacBook-Pro:nodejs ashishkhanal$ node
Welcome to Node.js v23.10.0.
Type ".help" for more information.
> console.log(process.versions.v8)
12.9.202.28-node.13
undefined
```

### Other versions
```bash
$ node -p process.versions
{
  node: '20.18.0',
  acorn: '8.12.1',
  ada: '2.9.0',
  ares: '1.33.1',
  base64: '0.5.2',
  brotli: '1.1.0',
  cjs_module_lexer: '1.4.1',
  cldr: '45.0',
  icu: '75.1',
  llhttp: '8.1.2',
  modules: '115',
  napi: '9',
  nghttp2: '1.61.0',
  nghttp3: '0.7.0',
  ngtcp2: '1.1.0',
  openssl: '3.0.13+quic',
  simdutf: '5.5.0',
  tz: '2024a',
  undici: '6.19.8',
  unicode: '15.1',
  uv: '1.46.0',
  uvwasi: '0.0.21',
  v8: '11.3.244.8-node.23',
  zlib: '1.3.0.1-motley-71660e1'
}
```

## npm package manager
npm is the standard package manager for Node.js. It installs, updates and manages dependencies of our project.
Dependencies are pre-built pieces of code, such as libraries and packages, that our Node.js application needs to work.

Your project needs to have a `package.json` file.

```bash
# This will install **all** the packages to the node_modules folder
npm install
# This will install a single package. This adds <package-name> to the package.json file dependencies. Before v5, you needed to add the flag --save.
npm install <package-name>

# npm will check all packages for a newer version that satisfies your versioning constraints.
npm update
npm update <package-name>
```

Flags:
1. -S: `--save`
2. -D: `--save-dev`
3. -O: `--save-optional`

The difference between devDependencies and dependencies is that the former contains development tools, like a testing library,
while the latter is bundled with the app in production.

### Versioning
npm follows the semantic versioning (semver) standard.
```bash
npm install <package-name>@<version>
```

### Running Tasks
The `package.json` file supports a format for specifying command line tasks that can be run by using
```bash
npm run <task-name>
```

```json
// package.json
{
   "scripts": {
      "watch": "webpack --watch --progress --colors --config webpack.conf.js",
      "dev": "webpack --progress --colors --config webpack.conf.js",
      "prod": "NODE_ENV=production webpack -p --config webpack.conf.js"
   }
}
```
So instead of typing those long commands, which are easy to forget or mistype, you can run
```bash
$ npm run watch
$ npm run dev
$ npm run prod
```

## Difference between development and production
There is no difference between development and production in Node.js, i.e., there are no specific settings you need to apply to make Node.js
work in a production configuration.
However, a few libraries in the npm registry recognize using the `NODE_ENV` variable and default it to a `development` setting.

Always run your Node.js with the `NODE_ENV=production` set.

Setting `NODE_ENV` to anything but `production` is considered an antipattern.

## Debugging Nodejs (using inspector API)
When started with the `--inspect` switch, a Node.js process listens for a debugging client.

Inspector clients must know and specify host address, port, and UUID to connect. A full URL will look something like `ws://127.0.0.1:9229/0f2c936f-b1cd-4ac9-aab3-f63b0f33d55e`.
`ws` means WebSockets.

The port 9229 is only used for the debugging protocol connection, not for serving web content.
It requires a debugging client that understands the Inspector Protocol.

### Debugging using CLI
https://nodejs.org/api/debugger.html

https://www.youtube.com/watch?v=FMsNsSHhRC8&list=PL2uN9BViQt2yzYm8gUzXhOef8YHfPwLC_&index=7&t=3s (good video)

Follow along this video: https://youtu.be/si9pVRaGz30?si=-NLQIuOwg1Y3hy8y (Node Doesn't Suck Anymore)

https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Server-side/Express_Nodejs/deployment

https://hromium.com/javascript-visualized-event-loop

### Debugging using Chrome Devtools
https://medium.com/@paul_irish/debugging-node-js-nightlies-with-chrome-devtools-7c4a1b95ae27

For eg:
```bash
Ashishs-MacBook-Pro:nodejs ashishkhanal$ node inspect server.js
< Debugger listening on ws://127.0.0.1:9229/db17522c-ec72-464f-babe-f28c684e1bbd
< For help, see: https://nodejs.org/en/docs/inspector
< 
< Debugger attached.
< 
 ok
< Waiting for the debugger to disconnect...
< 
debug> 
```