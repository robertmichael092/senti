[app]
title = Senti
package.name = senti
package.domain = org.senti

source.dir = .
source.include_exts = py,kv,png,db

version = 0.1

requirements = python3,kivy

orientation = portrait

fullscreen = 0

icon.filename = icon.png

android.permissions = INTERNET

android.api = 31
android.minapi = 21

android.archs = armeabi-v7a,arm64-v8a

[buildozer]
log_level = 2
warn_on_root = 1