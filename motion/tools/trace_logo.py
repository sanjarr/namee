# Traces a transparent PNG logo into polygon islands (with holes) for 3D extrusion.
# usage: python3 tools/trace_logo.py logo.png out.json
import sys, json
import cv2
import numpy as np

src, dst = sys.argv[1], sys.argv[2]
UP = 4
im = cv2.imread(src, cv2.IMREAD_UNCHANGED)
alpha = cv2.resize(im[..., 3], None, fx=UP, fy=UP, interpolation=cv2.INTER_CUBIC)
_, b = cv2.threshold(alpha, 127, 255, cv2.THRESH_BINARY)
cs, h = cv2.findContours(b, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_NONE)
h = h[0]

def poly(c):
    c = cv2.approxPolyDP(c, 1.0, True)[:, 0, :].astype(float) / UP
    return [[round(x, 2), round(y, 2)] for x, y in c]

islands = []
for i, c in enumerate(cs):
    if h[i][3] >= 0:
        continue
    x, y, w, hh = cv2.boundingRect(c)
    x, y, w, hh = x / UP, y / UP, w / UP, hh / UP
    area = cv2.contourArea(c) / UP / UP
    holes = [poly(cs[j]) for j in range(len(cs)) if h[j][3] == i]
    # classify by position: tooth (y < 560), title (y 600-760), subtitle (below)
    if y < 560:
        kind = 'body' if area > 5000 else 'facet'
    elif y < 780:
        kind = 'title'
    else:
        kind = 'sub'
    islands.append({'kind': kind, 'bbox': [x, y, w, hh], 'area': area, 'outer': poly(c), 'holes': holes})

islands.sort(key=lambda s: (s['kind'], s['bbox'][0]))
json.dump({'size': [im.shape[1], im.shape[0]], 'islands': islands}, open(dst, 'w'))
print({k: sum(1 for s in islands if s['kind'] == k) for k in ('facet', 'body', 'title', 'sub')})
