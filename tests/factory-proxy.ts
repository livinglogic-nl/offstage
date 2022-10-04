import { test, expect } from '@playwright/test';
test('just a test', async() => {
  const factory = (defaultValues) => 
    new Proxy({}, {
      get(obj,key) {
        return (init) => ({
          ['x-os-type']: key,
          ...defaultValues,
          ...init,
        });
      },
    });
  
  const { Person } = factory({
    name: 'jack',
    title: 'mr',
  });
  console.log(Person({ title:'ms' }));
});
