const useCreate = require('./src/use-create.js');
const useMock = require('./src/use-mock.js');
const useGenerate = require('./src/use-generate.js');
const useMount = require('./src/use-mount.js');
const useOverride = require('./src/use-override.js');

const services = {};
const mocks = {};

const create = useCreate(services);
const mock = useMock(mocks);
const generate = useGenerate(services, mocks);
const mount = useMount(services, mocks);
const override = useOverride();

const factory = (defaultValues) => 
  new Proxy({}, {
    get(obj,key) {
      return (init) => {
        const result = {
          ...defaultValues,
          ...init,
        }
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
}
