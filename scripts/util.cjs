const { spawnSync } = require("child_process");

function createEnum(valuesByName) {
  const valuesById = {},
    values = Object.create(valuesById);

  for (const [name, value] of Object.entries(valuesByName)) {
    values[(valuesById[value] = name)] = value;
  }

  return Object.freeze(values);
}

function spawn(cmd, args, { log, ...options } = {}) {
  const cp = spawnSync(cmd, args, { encoding: "utf-8", ...options });

  if (cp.error) {
    throw Error(cp.error);
  }

  if (cp.status !== 0) {
    throw Error(`Command ${cmd} exited with status ${cp.status}: ${cp.stderr}`);
  }

  if (log != null) {
    log.debug(cp.stdout, { label: "stdout" });
    log.debug(cp.stderr, { label: "stderr" });
  }

  return cp;
}

module.exports = {
  createEnum,
  spawn,
};
