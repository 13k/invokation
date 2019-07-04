function LuaListTableToArray(table) {
  var result = [];

  for (var key in table) {
    var i = parseInt(key);

    if (!i) {
      $.Msg("[ERROR] Tried to convert a non-list lua table to a javascript array (key '", key, "' [" + typeof(key) + "] is not a number): ", table);
      return;
    }

    result[i] = table[key];
  }

  result = result.filter(function(elem) {
    return elem !== undefined && elem != null;
  });

  return result;
}

function StringLexicalCompare(left, right) {
  if (left < right) {
    return -1;
  }

  if (left > right) {
    return 1;
  }

  return 0;
}