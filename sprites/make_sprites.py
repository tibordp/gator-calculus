import os
import re
import datetime
import base64

def chunks(l, n):
    """Yield successive n-sized chunks from l."""
    for i in range(0, len(l), n):
        yield l[i:i+n]

def all_sprites(dir):
    for filename in os.listdir(dir):
        if filename.endswith(".svg"):
            sprite_name = os.path.basename(filename)
            with open(filename, "rb") as file:
                data = base64.b64encode(file.read()).decode("ascii");
            yield "\t\"{0}\": atob({1})".format(
                sprite_name,
                " + \n\t\t".join("\"{0}\"".format(i) for i in chunks(data, 100))
            )

with open("sprites.js", "w") as f:
    f.write("var Sprites = {{\n{0}\n}}".format(", \n".join(all_sprites("."))))
