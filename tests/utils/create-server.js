import http from 'http';
export const createServer = async(handler, config = {
    oneShot: true,
    port:3000
  }) => new Promise(ok => {
  const state = {};
  const server = http.createServer(async(req,res) => {
    state.lastRequest = req;

    const buffers = [];
    for await (const chunk of req) {
      buffers.push(chunk);
    }
    const data = Buffer.concat(buffers).toString();
    req.body = data;
    try {
      req.bodyJSON = JSON.parse(data);
    } catch(e) {
    }

    await handler(req,res);
    if(config.oneShot) {
      server.close();
    }
  });
  state.server = server;
  server.listen(config.port, () => {
    ok(state);
  });
});


