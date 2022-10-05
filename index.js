const useCreate = require('./src/use-create.js');
const useMock = require('./src/use-mock.js');
const useGenerate = require('./src/use-generate.js');
const useMount = require('./src/use-mount.js');

const services = {};
const mocks = {};

const create = useCreate(services);
const mock = useMock(mocks);
const generate = useGenerate(services, mocks);
const mount = useMount(services, mocks);

module.exports = {
  create,
  mock,
  generate,
  mount,
}
