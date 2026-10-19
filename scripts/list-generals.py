# -*- coding: utf-8 -*-
import json
from pathlib import Path
g = json.loads((Path(__file__).resolve().parents[1] / "data" / "generals.json").read_text(encoding="utf-8"))
for x in g["list"]:
    print(f"{x['id']}\t{x['name']}\t{x.get('npcOnly', False)}")
