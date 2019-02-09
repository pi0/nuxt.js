export const WORKER_STATUS = {
  CREATED: 0,
  RUNNING: 1,
  EXITED: 2
}

export const WORKER_STATUS_STR = {
  [WORKER_STATUS.CREATED]: 'created',
  [WORKER_STATUS.RUNNING]: 'running',
  [WORKER_STATUS.EXITED]: 'exited'
}
