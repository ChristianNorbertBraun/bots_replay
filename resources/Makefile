createAtlas:
	convert +append "[1-4]*.png" tempAtlas1.png && \
	convert +append "[5-8]*.png" tempAtlas2.png && \
	convert +append A*.png tempAtlasA.png && \
	convert +append B*.png tempAtlasB.png && \
	convert -append temp*.png atlas.png && \
	rm temp*.png
