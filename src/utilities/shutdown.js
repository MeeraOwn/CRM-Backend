async function gracefulShutDown() {
  console.error("--> Server stopped <--");
  logger.error("--> Server stopped <--");
  process.exit(0);
}

export default gracefulShutDown;
