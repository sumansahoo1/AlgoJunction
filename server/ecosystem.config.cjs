module.exports = {
  apps: [
    {
      name: 'algojunction-server',
      script: 'src/index.js',
      interpreter: 'node',
      restart_delay: 5000,
      max_restarts: 10,
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
