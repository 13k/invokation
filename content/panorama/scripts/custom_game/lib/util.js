"use strict";

((global /*, context */) => {
  const { lodash: _ } = global;
  const { INVOKER, TALENTS } = global.Const;

  const ITEM_NAME_PATTERN = /^item_\w+$/;

  const Util = {};

  Util.IsLuaArray = (obj) =>
    _.isPlainObject(obj) &&
    _.chain(obj)
      .keys()
      .find((key) => parseInt(key))
      .value() != null;

  // should support Lua arrays with non-integer keys,
  // like the common construct (5.1) `{n=select("#", ...), ...}` or (>=5.2) `table.pack(...)`
  Util.LuaArray = (obj) => {
    if (!Util.IsLuaArray(obj)) {
      return obj;
    }

    const reduce = (list, value, key) => {
      const idx = parseInt(key);

      if (_.isInteger(idx)) {
        list[idx - 1] = value;
      }

      return list;
    };

    return _.reduce(obj, reduce, []);
  };

  Util.LuaArrayDeep = (obj, options) => {
    options = options || {};

    if (Util.IsLuaArray(obj)) {
      return _.map(Util.LuaArray(obj), (value) => Util.LuaArrayDeep(value, options));
    }

    if (_.isArray(obj)) {
      return _.map(obj, (value) => Util.LuaArrayDeep(value, options));
    }

    if (_.isPlainObject(obj)) {
      if (options.inplace) {
        const transform = (result, value, key) => {
          result[key] = Util.LuaArrayDeep(value, options);
        };

        return _.transform(obj, transform, obj);
      }

      return _.mapValues(obj, (value) => Util.LuaArrayDeep(value, options));
    }

    return obj;
  };

  Util.LuaIndexArray = (obj) => _.map(Util.LuaArray(obj), _.partial(_.add, -1));

  Util.Prefixer = (string, prefix) => {
    if (!_.startsWith(string, prefix)) {
      string = prefix + string;
    }

    return string;
  };

  Util.FlattenObjectWith = (object, path, fn) => {
    path = path || [];
    fn = fn || _.identity;

    const transform = (result, value, key) => {
      const subPath = _.concat(path, [key]);
      const fullKey = _.join(subPath, ".");

      if (_.isPlainObject(value)) {
        _.assign(result, Util.FlattenObjectWith(value, subPath, fn));
      } else {
        result[fullKey] = fn(value);
      }
    };

    return _.transform(object, transform, {});
  };

  Util.IsOrbAbility = (abilityName) => abilityName in INVOKER.ORB_ABILITIES;

  Util.IsInvocationAbility = (abilityName) =>
    Util.IsOrbAbility(abilityName) || abilityName === INVOKER.ABILITY_INVOKE;

  Util.IsItemAbility = (abilityName) => !!abilityName.match(ITEM_NAME_PATTERN);

  // TODO: handle errors
  Util.CreatePanelWithLayout = (parent, id, layout) => {
    const panel = $.CreatePanel("Panel", parent, id);

    panel.BLoadLayout(layout, false, false);

    return panel;
  };

  // TODO: handle errors
  Util.CreatePanelWithLayoutSnippet = (parent, id, snippet) => {
    const panel = $.CreatePanel("Panel", parent, id);

    panel.BLoadLayoutSnippet(snippet);

    return panel;
  };

  // TODO: handle errors
  Util.CreateAbilityImage = (parent, id, abilityName) => {
    const image = $.CreatePanel("DOTAAbilityImage", parent, id);

    image.abilityname = abilityName;

    return image;
  };

  // TODO: handle errors
  Util.CreateItemImage = (parent, id, itemName) => {
    const image = $.CreatePanel("DOTAItemImage", parent, id);

    image.itemname = itemName;

    return image;
  };

  Util.CreateAbilityOrItemImage = (parent, id, abilityName) =>
    Util.IsItemAbility(abilityName)
      ? Util.CreateItemImage(parent, id, abilityName)
      : Util.CreateAbilityImage(parent, id, abilityName);

  Util.ElementParams = (params) => {
    if (!_.isPlainObject(params)) {
      return params;
    }

    const transform = (pairs, value, key) => {
      pairs.push(`${key}=${value}`);
    };

    return _.chain(params).transform(transform, []).join("&").value();
  };

  Util.TalentConstKey = (level, side) => `L${level}_${_.toUpper(side)}`;
  Util.TalentConstValue = (level, side) => TALENTS[Util.TalentConstKey(level, side)];

  Util.IsTalentSelected = (level, side, selected) =>
    (Util.TalentConstValue(level, side) & selected) > 0;

  Util.TalentArrayIndexToLevel = (i) => (Math.floor(i / 2) + 2) * 5;
  Util.TalentArrayIndexToSide = (i) => (i % 2 === 0 ? "right" : "left");

  global.Util = Util;
})(GameUI.CustomUIConfig(), this);
