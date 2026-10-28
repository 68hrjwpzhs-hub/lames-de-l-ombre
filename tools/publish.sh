#!/bin/sh
# Reconstruit le jeu et place la version installable (PWA) à la racine du dépôt, prête pour GitHub Pages (branche main, dossier racine).
cd "$(dirname "$0")/.."
sh build.sh && python3 tools/pwa_build.py && cp -r dist/. . && rm -rf dist
