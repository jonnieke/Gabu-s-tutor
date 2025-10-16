// Simple test to check if the build works
const { exec } = require('child_process');

console.log('Testing build...');
exec('npm run build', (error, stdout, stderr) => {
  if (error) {
    console.error('Build failed:', error.message);
    console.error('Stderr:', stderr);
    return;
  }
  console.log('Build successful!');
  console.log(stdout);
});
