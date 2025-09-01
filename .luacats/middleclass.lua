--# selene: allow(unused_variable)
--- @meta

--- @class middleclass
--- @overload fun(classname: string, super?: middleclass.Class): middleclass.Class
local M = {}

--- @class middleclass.Class
--- @field static table
local Class = {}

--- @param ... any
--- @return self
function Class:new(...) end

--- @param mixin table
function Class:include(mixin) end

--- @param class middleclass.Class
--- @return boolean
function Class:isInstanceOf(class) end

--- @param super middleclass.Class
--- @return boolean
function Class:isSubclassOf(super) end

return M
