const child_process = require('child_process');
const path = require('path');
const chokidar = require('chokidar');

let watcher = null;
let debounceId = 0;

const syncFile = path.resolve(__dirname + '/sync.js');

const sync = () => {
  delete require.cache[syncFile];
  require(syncFile);
}

const offstageVitePlugin = () => {
  if(process.env.NODE_ENV === 'production') { return; }
  watcher = chokidar.watch('src/offstage', {
    ignored: [
      'src/offstage/index.ts',
    ],
  });

  watcher.on('change', _ => {
    clearTimeout(debounceId);
    debounceId = setTimeout(sync, 500);
  });
  sync();
  return {
    name: 'offstage-vite-plugin',
    buildEnd() {
      if(watcher) {
        watcher.close();
      }
    },
  };
}

module.exports = offstageVitePlugin;
