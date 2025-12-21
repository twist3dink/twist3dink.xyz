import os

EXCLUDE = {'.git','node_modules','.next','dist','build','coverage','.cache'}

for root, dirs, files in os.walk('..'):  # '..' so it starts at repo root
    dirs[:] = [d for d in dirs if d not in EXCLUDE]
    level = root.count(os.sep) - os.path.abspath('..').count(os.sep)
    indent = '  ' * max(level, 0)
    print(f"{indent}{os.path.basename(root) or '.'}/")
    for f in sorted(files):
        print(f"{indent}  {f}")
