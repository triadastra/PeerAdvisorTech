"""Generate outlined Space Grotesk wordmark. Build-time only: fonttools + brotli."""
import json
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen
root = Path(__file__).resolve().parents[1]
font = instantiateVariableFont(TTFont(root / 'node_modules/@fontsource-variable/space-grotesk/files/space-grotesk-latin-wght-normal.woff2'), {'wght': 500})
glyphs = font.getGlyphSet()
cmap = font.getBestCmap()
x = 0
paths = []
bounds = []
for char in 'StandardCAS™':
    name = cmap[ord(char)]
    glyph = glyphs[name]
    pen = SVGPathPen(glyphs, ntos=lambda v: str(round(v, 3)))
    transform = (1, 0, 0, -1, x, 0)
    glyph.draw(TransformPen(pen, transform))
    measure = BoundsPen(glyphs)
    glyph.draw(TransformPen(measure, transform))
    paths.append(pen.getCommands())
    bounds.append(measure.bounds)
    x += glyph.width
left = min(b[0] for b in bounds) - 24
top = min(b[1] for b in bounds) - 24
right = max(b[2] for b in bounds) + 24
bottom = max(b[3] for b in bounds) + 24
(root / 'src/data/standardcas-wordmark.json').write_text(json.dumps({'label': 'StandardCAS™', 'viewBox': f'{left} {top} {right-left} {bottom-top}', 'paths': paths}, indent=2)+'\n')
