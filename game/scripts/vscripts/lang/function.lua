local module = {}

function module.bindbyname(t, name)
  return function(...)
    return t[name](t, ...)
  end
end

function module.lookupbyname(t, name)
  return function(...)
    return t[name](...)
  end
end

return module