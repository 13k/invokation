local class = require("pl.class")

-- selene: allow(incorrect_standard_library_use)
CBaseFlex = class(CBaseAnimating)

function CBaseFlex:_init(attributes)
  self:super(attributes or {})
end
