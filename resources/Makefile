createAtlas:
	convert +append "[1-4]*.png" tempAtlas1.png && \
	convert +append "[5-8]*.png" tempAtlas2.png && \
	convert +append A*.png tempAtlasA.png && \
	convert +append B*.png tempAtlasB.png && \
	convert -append temp*.png atlas.png && \
	rm temp*.png


createPlayerSprites:
	convert 8dot.png -size 64x64 -gravity Center -pointsize 30 -font Silom -annotate 0 'A' oil.png
