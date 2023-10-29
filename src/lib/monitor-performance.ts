export async function monitorPerformance(fn: () => Promise<any>) {
  const startMemory = process.memoryUsage().heapUsed

  const start = process.hrtime()
  await fn()
  const diff = process.hrtime(start)
  const timeInMilliseconds = diff[0] * 1e3 + diff[1] * 1e-6

  const endMemory = process.memoryUsage().heapUsed
  const memoryUsage = (endMemory - startMemory) / 1024 / 1024

  console.log(`Execution time: ${timeInMilliseconds} ms`)
  console.log(`Memory used: ${memoryUsage} MB`)
}
