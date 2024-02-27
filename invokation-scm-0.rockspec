rockspec_format = "3.0"
package = "invokation"
version = "scm-0"

source = {
  url = "git+https://github.com/13k/invokation",
  branch = "main",
}

description = {
  summary = "Invokation School of Arcane Arts",
  homepage = "https://github.com/13k/invokation",
  issues_url = "https://github.com/13k/invokation/issues",
  maintainer = "Kiyoshi '13k' Murata <kbmurata@proton.me>",
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

test_dependencies = {
  "bit32 ~> 5.3",
  "busted",
  "compat53 ~> 0.7",
  "luacov",
  "moses ~> 2.1",
  "penlight ~> 1.7",
}

test = {
  type = "busted",
}

build = {
  type = "none",
}
