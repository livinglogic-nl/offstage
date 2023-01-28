import useMount from './use-mount.js';
import { state } from './state.js';


interface BeforeEachArgs { page:any }
type BeforeEachCallback = (args:BeforeEachArgs, testInfo:any) => Promise<void>;
type BeforeEachFunc = (handler:BeforeEachCallback) => void;

interface Test {
  beforeEach: BeforeEachFunc;
}

const mount = useMount(state);
export const attach = (test:Test) => {
  test.beforeEach(async({ page }, testInfo:any) => {
    await mount(page, testInfo);
  });
}
