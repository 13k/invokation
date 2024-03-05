---@meta

local class = require("pl.class")

---# Class [`pl.Date`](https://lunarmodules.github.io/Penlight/classes/pl.Date.html)
---
---Date and Date Format classes.
---
---See [the Guide](https://lunarmodules.github.io/Penlight/manual/05-dates.md.html#).
---
---NOTE: the date module is deprecated! see https://github.com/lunarmodules/Penlight/issues/285
---
---Dependencies:
--- [`pl.class`](https://lunarmodules.github.io/Penlight/libraries/pl.class.html#)
--- [`pl.stringx`](https://lunarmodules.github.io/Penlight/libraries/pl.stringx.html#)
--- [`pl.utils`](https://lunarmodules.github.io/Penlight/libraries/pl.utils.html#)
---@class pl.Date : pl.Class
---@operator sub(pl.Date): pl.Date.Interval
---@overload fun(t?: number|pl.Date|osdate, is_utc?: boolean): pl.Date
---@overload fun(year: integer, month: integer, day: integer, hour?: integer, min?: integer, sec?: integer): pl.Date
local Date = class()

---Date constructor.
---@param self pl.Date
---@param t? number|pl.Date|osdate -- this can be either
---
--- * `nil` or empty - use current date and time
--- * `number` - seconds since epoch (as returned by os.time). Resulting time is UTC
--- * `Date` - make a copy of this date
--- * `table` - table containing year, month, etc as for os.time. You may leave out year, month or day, in which case current values will be used.
--- * year (will be followed by month, day etc)
---
---@param is_utc? boolean -- `true` if Universal Coordinated Time
function Date:_init(t, is_utc) end

---@param self pl.Date
---@param year integer
---@param month integer
---@param day integer
---@param hour? integer
---@param min? integer
---@param sec? integer
function Date:_init(year, month, day, hour, min, sec) end

---set the current time of this Date object.
---@param self pl.Date
---@param t integer -- seconds since epoch
function Date:set(t) end

---get the time zone offset from UTC.
---@param ts integer -- seconds ahead of UTC
---@return integer
---@nodiscard
function Date.tzone(ts) end

---convert this date to UTC.
---@param self pl.Date
---@return pl.Date
---@nodiscard
function Date:toUTC() end

---convert this UTC date to local.
---@param self pl.Date
---@return pl.Date
---@nodiscard
function Date:toLocal() end

---set the year.
---@param self pl.Date
---@param y integer -- Four-digit year
---@return pl.Date self
function Date:year(y) end

---set the month.
---@param self pl.Date
---@param m integer -- month
---@return pl.Date self
function Date:month(m) end

---set the day.
---@param self pl.Date
---@param d integer -- day
---@return pl.Date self
function Date:day(d) end

---set the hour.
---@param h integer -- hour
---@return pl.Date self
function Date:hour(h) end

---set the minutes.
---@param self pl.Date
---@param min integer -- minutes
---@return pl.Date self
function Date:min(min) end

---set the seconds.
---@param self pl.Date
---@param sec integer -- seconds
---@return pl.Date self
function Date:sec(sec) end

---set the day of year.
---@param self pl.Date
---@param yday integer -- day of year
---@return pl.Date self
function Date:yday(yday) end

---get the year.
---@param self pl.Date
---@return integer
---@nodiscard
function Date:year() end

---get the month.
---@param self pl.Date
---@return integer
---@nodiscard
function Date:month() end

---get the day.
---@param self pl.Date
---@return integer
---@nodiscard
function Date:day() end

---get the hour.
---@param self pl.Date
---@return integer
---@nodiscard
function Date:hour() end

---get the minutes.
---@param self pl.Date
---@return integer
---@nodiscard
function Date:min() end

---get the seconds.
---@param self pl.Date
---@return integer
---@nodiscard
function Date:sec() end

---get the day of year.
---@param self pl.Date
---@return integer
---@nodiscard
function Date:yday() end

---name of day of week.
---@param self pl.Date
---@param full boolean -- abbreviated if true, full otherwise.
---@return string -- name
---@nodiscard
function Date:weekday_name(full) end

---name of month.
---@param self pl.Date
---@param full boolean -- abbreviated if true, full otherwise.
---@return string -- name
---@nodiscard
function Date:month_name(full) end

---is this day on a weekend?
---@param self pl.Date
---@return boolean
---@nodiscard
function Date:is_weekend() end

---add to a date object.
---@param self pl.Date
---@param t osdate -- a table containing one of the following keys and a value: one of `year`, `month`, `day`, `hour`, `min`, `sec`
---@return pl.Date self -- this date
function Date:add(t) end

---last day of the month.
---@param self pl.Date
---@return integer -- day
---@nodiscard
function Date:last_day() end

---difference between two `Date` objects.
---@param self pl.Date
---@param other pl.Date -- Date object
---@return pl.Date.Interval -- object
---@nodiscard
function Date:diff(other) end

---long numerical ISO data format version of this date.
---@param self pl.Date
---@return string
---@nodiscard
function Date:__tostring() end

---equality between Date objects.
---@param self pl.Date
---@param other pl.Date
---@return boolean
---@nodiscard
function Date:__eq(other) end

---ordering between Date objects.
---@param self pl.Date
---@param other pl.Date
---@return boolean
---@nodiscard
function Date:__lt(other) end

---difference between Date objects.
---@param self pl.Date
---@param other pl.Date
---@return pl.Date.Interval
---@nodiscard
function Date:__sub(other) end

---add a date and an interval.
---@param self pl.Date
---@param other pl.Date.Interval|osdate -- either a `pl.Date.Interval` object or a table such as passed to `Date:add`
---@return pl.Date
---@nodiscard
function Date:__add(other) end

---@class pl.Date.Interval : pl.Class
---@overload fun(t: integer): pl.Date.Interval
local DateInterval = class()

---Date.Interval constructor
---@param self pl.Date.Interval
---@param t integer - an interval in seconds
function DateInterval:_init(t) end

---If it's an interval then the format is '2 hours 29 sec' etc.
---@param self pl.Date.Interval
---@return string
---@nodiscard
function DateInterval:__tostring() end

Date.Interval = DateInterval

---@class pl.Date.Format : pl.Class
---@overload fun(fmt: string): pl.Date.Format
local DateFormat = class()

---Date.Format constructor
---@param self pl.Date.Format
---@param fmt string -- a string where the following fields are significant:
---
--- * `d`: day (either d or dd)
--- * `y`: year (either yy or yyy)
--- * `m`: month (either m or mm)
--- * `H`: hour (either H or HH)
--- * `M`: minute (either M or MM)
--- * `S`: second (either S or SS)
---
---Alternatively, if `fmt` is nil then this returns a flexible date parser that
---tries various date/time schemes in turn:
---
--- * ISO 8601, like `2010-05-10 12:35:23Z` or `2008-10-03T14:30+02`
--- * times like 15:30 or 8.05pm (assumed to be today's date)
--- * dates like 28/10/02 (European order!) or 5 Feb 2012
--- * month name like march or Mar (case-insensitive, first 3 letters); here the day will be 1 and the year this current year
---
---A date in format 3 can be optionally followed by a time in format 2. Please see test-date.lua in the tests folder for more examples.
---
---Usage:
---
---```lua
---df = Date.Format("yyyy-mm-dd HH:MM:SS")
---```
function DateFormat:_init(fmt) end

---parse a string into a Date object.
---@param self pl.Date.Format
---@param str string -- a date string
---@return pl.Date -- date object
---@nodiscard
function DateFormat:parse(str) end

---convert a Date object into a string.
---@param self pl.Date.Format
---@param d pl.Date|integer -- a date object, or a time value as returned by os.time
---@return string
---@nodiscard
function DateFormat:tostring(d) end

---force US order in dates like 9/11/2001
---@param self pl.Date.Format
---@param yesno boolean -- whether US order in dates are forced
function DateFormat:US_order(yesno) end

Date.Format = DateFormat

return Date
