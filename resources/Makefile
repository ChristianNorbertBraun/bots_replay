createAtlas:
	convert +append "[1-4]*.png" tempAtlas1.png && \
	convert +append "[5-8]*.png" tempAtlas2.png && \
	convert -append temp*.png atlas.png && \
	rm temp*.png && \
	convert +append "[a-d].png" tempAtlas3.png && \
	convert +append "[e-h].png" tempAtlas4.png && \
	convert +append "[i-l].png" tempAtlas5.png && \
	convert +append "[m-p].png" tempAtlas6.png && \
	convert +append "[q-t].png" tempAtlas7.png && \
	convert +append "[u-x].png" tempAtlas8.png && \
	convert +append "[y-z].png" 9snake.png tempAtlas9.png && \
	convert -append temp*.png tempLetterAtlas.png && \
	convert -append atlas.png tempLetterAtlas.png atlas.png && \
	convert -append "explosion/e[1-3]Explosion.png" tempExplosionAtlas.png && \
	convert -append atlas.png tempExplosionAtlas.png atlas.png && \
	convert atlas.png -background none -gravity north -extent 256x2048 atlas.png && \
	rm temp*.png


createPlayerSprites:
	for letter in A B C D E F G H I J K L M N O P; do \
		cat playerSprites.txt| xargs -I {} convert templates/{} -size 64x64 -gravity Center -pointsize 30 -font Silom -annotate 0 $$letter $$letter{}; \
		convert +append $$letter*.png tempAtlas$$letter.png; \
	done 

createLetters:
	for letter in a b c d e f g h i j k l m n o p q r s t u v w x y z; do \
		convert templates/flatland.png -size 64x64 -gravity Center -pointsize 30 -font Silom -annotate 0 $$letter $$letter.png; \
	done 

createExplosion:

all: createPlayerSprites createLetters createAtlas
