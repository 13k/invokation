local class = require("pl.class")

-- selene: allow(incorrect_standard_library_use)
CBaseAnimating = class(CBaseEntity)

function CBaseAnimating:_init(attributes)
  self:super(attributes or {})
end
