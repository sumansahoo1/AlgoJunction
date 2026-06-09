export default {
  apps: [
    {
      name: 'algojunction-server',
      script: 'src/index.js',
      interpreter: 'node',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
}
