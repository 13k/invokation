rockspec_format = "3.0"
package = "Invokation"
version = "scm-0"

source = {
  url = "git+https://github.com/13k/invokation",
  branch = "master",
}

description = {
  summary = "Invokation School of Arcane Arts",
  homepage = "https://github.com/13k/invokation",
  issues_url = "https://github.com/13k/invokation/issues",
  maintainer = "Kiyoshi Murata <kbmurata@gmail.com>",
  labels = { "dota2", "dota2-addon", "dota2-custom-game", "invoker", "invoker-trainer", "trainer" },
  license = "MIT",
}

supported_platforms = { "linux", "macosx", "windows" }

dependencies = {
  "lua == 5.1",
}

build_dependencies = {
  "ldoc",
  "lunamark",
  "luacheck",
}

test_dependencies = {
  "luacov",
  "busted",
  "compat53 ~> 0.7",
  "bit32 ~> 5.3",
}

test = {
	type = "busted",
}

build = {
  type = "make",
  build_target = "luarocks-build",
}
