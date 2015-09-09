all: sprites/sprites.js

sprites/sprites.js: sprites/*.svg
	cd sprites; python3 make_sprites.py
