function Enum(valuesByName) {
  const valuesById = {};
  const values = Object.create(valuesById);

  for (const [name, value] of Object.entries(valuesByName)) {
    values[(valuesById[value] = name)] = value;
  }

  return Object.freeze(values);
}

module.exports = Enum;
