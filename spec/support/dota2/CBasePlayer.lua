local class = require("pl.class")

-- selene: allow(incorrect_standard_library_use)
CBasePlayer = class(CBaseAnimating)

function CBasePlayer:_init(attributes)
  self:super(attributes or {})
end
