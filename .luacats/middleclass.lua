--# selene: allow(unused_variable)
--- @meta

--- @class middleclass
--- @overload fun(classname: string, super?: middleclass.Class): middleclass.Class
local M = {}

--- @class middleclass.Class
--- @field name string
--- @field static table
--- @field class middleclass.Class
local Class = {}

--- @param class middleclass.Class
--- @param ... any
--- @return self
function Class.new(class, ...) end

--- @param class middleclass.Class
--- @param mixin table
function Class.include(class, mixin) end

--- @param class middleclass.Class
--- @param super middleclass.Class
--- @return boolean
function Class.isSubclassOf(class, super) end

--- @param self self
--- @param class middleclass.Class
--- @return boolean
function Class.isInstanceOf(self, class) end

return M
