import os

def phone_svg(accent, label):
    return f'''<svg width="600" height="600" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="600" fill="#F1F3F6"/>
  <defs>
    <linearGradient id="body" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#2b2f38"/>
      <stop offset="1" stop-color="#14161c"/>
    </linearGradient>
    <linearGradient id="screen" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="{accent}" stop-opacity="0.9"/>
      <stop offset="1" stop-color="{accent}" stop-opacity="0.55"/>
    </linearGradient>
  </defs>
  <rect x="205" y="90" width="190" height="420" rx="34" fill="url(#body)"/>
  <rect x="217" y="112" width="166" height="376" rx="22" fill="url(#screen)"/>
  <rect x="217" y="112" width="166" height="34" rx="10" fill="#0d0f13" opacity="0.35"/>
  <circle cx="300" cy="129" r="4" fill="#0d0f13"/>
  <rect x="280" y="470" width="40" height="4" rx="2" fill="#ffffff" opacity="0.6"/>
  <text x="300" y="560" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="#4c5262">{label}</text>
</svg>'''

items = [
    ("iphone-15-pro", "#8f8f8b", "iPhone 15 Pro"),
    ("iphone-14", "#3a4a63", "iPhone 14"),
    ("galaxy-s24", "#1b1b1b", "Galaxy S24"),
    ("galaxy-s23", "#e9dfc9", "Galaxy S23"),
    ("pixel-9", "#2b2b2b", "Pixel 9"),
    ("oneplus-13", "#1c3a4a", "OnePlus 13"),
]

outdir = "/home/claude/phonebay/public/images/phones"
for fname, accent, label in items:
    with open(os.path.join(outdir, f"{fname}.svg"), "w") as f:
        f.write(phone_svg(accent, label))
print("done")
