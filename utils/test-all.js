import child_process from 'child_process';

const shell = (command, cwd = '') => {
  console.log(cwd.length
    ? `run "${command}" in ${cwd}`
    : `run "${command}"`);
  child_process.execSync(command, { cwd:process.cwd() + '/' + cwd, stdio:'inherit' });
}

const testDemoModule = async() => {
  // shell('npm run qbuild', 'demo/vite');
  shell('npx serve -p 5173', 'demo/vite')
  

}

await testDemoModule();
