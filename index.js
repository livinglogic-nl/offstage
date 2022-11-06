const useCreate = require('./src/use-create.js');
const useMock = require('./src/use-mock.js');
const useGenerate = require('./src/use-generate.js');
const useMount = require('./src/use-mount.js');
const useOverride = require('./src/use-override.js');

const vitePluginOffstage = require('./vite-plugin.js');

const services = {};
const mocks = {};
const factorySamples = {};

const create = useCreate(services);
const mock = useMock(mocks);
const generate = useGenerate(services, mocks, factorySamples);
const mount = useMount(services, mocks);
const override = useOverride();

const factory = (defaultValue) => 
  new Proxy({}, {
    get(obj,key) {
      factorySamples[key] = [];
      return (init) => {
        const result = {
          ...defaultValue,
          ...init,
        }
        factorySamples[key].push(result);
        Object.defineProperty(result, 'x-os-type', {
          value: key,
        });
        return result;
      }
    },
  });

module.exports = {
  create,
  mock,
  generate,
  mount,
  override,
  factory,

  vitePluginOffstage,
}
