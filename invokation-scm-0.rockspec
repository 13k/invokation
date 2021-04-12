rockspec_format = "3.0"
package = "invokation"
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

supported_platforms = {
  "linux",
  "macosx",
  "windows",
}

dependencies = {
  "lua == 5.1",
}

build_dependencies = {
  "ldoc",
  "luacheck ~> 0.24",
  "luaformatter",
}

test_dependencies = {
  "bit32 ~> 5.3",
  "busted ~> 2.0",
  "compat53 ~> 0.7",
  "luacov ~> 0.15",
  "moses ~> 2.1",
  "penlight ~> 1.7",
}

test = {
  type = "busted",
}

build = {
  type = "make",
  build_target = "rock-build",
  install_target = "rock-install",
}
