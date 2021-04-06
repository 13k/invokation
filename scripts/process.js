const cp = require("child_process");
const { inspect } = require("util");

async function run(cmd, args, { log, ...options } = {}) {
  if (log) {
    log = log.fields("cmd", inspect(cmd));
    log.fields("args", inspect(args)).debug("spawning child process");
  }

  const child = cp.spawnSync(cmd, args, { encoding: "utf-8", ...options });

  if (child.error) {
    throw child.error;
  }

  const stdout = child.stdout.trim();
  const stderr = child.stderr.trim();

  if (child.status !== 0) {
    if (log) {
      if (stdout.length > 0) log.warn(stdout, { label: "stdout" });
      if (stderr.length > 0) log.error(stderr, { label: "stderr" });
    }

    throw Error(`Command ${cmd} exited with status ${child.status}`);
  }

  if (log) {
    log.fields("pid", child.pid, "status", child.status).debug("process exited");
    log.debug(inspect(stdout), { label: "stdout" });
    log.debug(inspect(stderr), { label: "stderr" });
  }

  return child;
}

module.exports = {
  run,
};
