import useMount from './use-mount.js';
import { state } from './state.js';


interface EachArgs { page:any }
type EachCallback = (args:EachArgs, testInfo:any) => Promise<void>;
type EachFunc = (handler:EachCallback) => void;

interface Test {
  beforeEach: EachFunc;
  afterEach: EachFunc;
}

const mount = useMount(state);
export const attach = (test:Test) => {
  test.beforeEach(async({ page }, testInfo:any) => {
    await mount(page, testInfo);
  });
  test.afterEach(async({ page }) => {
    await page.evaluate(() => {
      delete (window as any).isOffstagePlaywright;
    });
  });
}
