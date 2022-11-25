const path = require('path');
const chokidar = require('chokidar');

let watcher = null;
let debounceId = 0;

const syncFile = path.resolve(__dirname + '/sync.js');

const sync = async() => {
  delete require.cache[syncFile];
  const func = require(syncFile);
  await func();
}

const offstageVitePlugin = () => {
  if(process.env.NODE_ENV === 'production') {
    return {};
  }

  watcher = chokidar.watch('src/offstage', {
    ignored: [
      'src/offstage/index.ts',
    ],
  });

  watcher.on('change', _ => {
    clearTimeout(debounceId);
    debounceId = setTimeout(sync, 500);
  });

  const result = {
    name: 'offstage-vite-plugin',
    buildStart: {
      sequential: true,
      order: 'pre',
      async handler() {
        await sync();
      },
    },
    buildEnd: {
      if(watcher) {
        watcher.close();
        watcher = null;
      }
    },
  }
  return result;
}

module.exports = offstageVitePlugin;

