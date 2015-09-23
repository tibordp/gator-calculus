var phi = 1.618033988749894848204;

// =============================== SPRITE =================================== //

function Sprite(sprite_name, tag_name) {
  this.element = $(document.createElement(tag_name || "sprite"));
  this.element.html(Sprites[sprite_name]);
}

// ================================ GATOR =================================== //

function Gator(old) {
  this.element = $(document.createElement("gator"));
  this.old = !!old;
  this.element.html(Sprites[old ? "old-gator-true.svg" : "alligator.svg"]);
  this.jaw = $(".upper_jaw", this.element);
  this.setColor(0);
}

Gator.prototype.die = function(callback) {
  var gator = this;
  window.setTimeout(function() {
  }, 500);
  window.setTimeout(function() {
    gator.element.remove();
    if (callback) callback();
  }, 1500);
};

Gator.prototype.openJaw = function () {
  this.jaw.attr("class", "upper_jaw open");
};

Gator.prototype.closeJaw = function () {
  this.jaw.attr("class", "upper_jaw closed");
};

Gator.prototype.setColor = function(color) {
  this.color = color;
  $(".colored", this.element).css("fill", "hsl(" +
  String((360 * color * phi) % 360) +
  ", 50%, 50%)");
};

// ================================= EGG ==================================== //

function Egg(color) {
  this.element = $(document.createElement("egg"));
  this.element.html(Sprites["egg.svg"]);
  this.setColor(color);
  this.element.data("reference", this);
}

Egg.prototype.clone = function () {
  return new Egg(this.color);
};

Egg.prototype.hatch = function (callback) {
  var element = this.element;
  window.setTimeout(function() {
    element.addClass("shake shake-constant");
  }, Math.random() * 100);
  window.setTimeout(function() {
    element.removeClass("shake shake-constant");
    if (callback) callback();
  }, 3000);
};

Egg.prototype.setColor = function(color) {
  this.color = color;
  $(".colored", this.element).css("fill", "hsl(" +
  String((360 * color * phi) % 360) +
  ", 50%, 50%)");
};

Egg.prototype.export = function() {
  return {
    type: "egg", color: this.color
  };
};

Egg.import = function(data) {
  return new Egg(data.color);
};

// ================================ FAMILY ================================== //

function Family(color, old_gator, row) {
  var family = this;

  this.bound_eggs = [];
  this.old_gator = !!old_gator;
  this.gator = new Gator(this.old_gator);

  if (this.old_gator)
  {
    $("svg", this.gator.element).click(function(event) {
      family.dieOfAge();
      event.stopPropagation();
    });
  }
  else
  {
    $("svg", this.gator.element).click(function(event) {
      family.eat();
      event.stopPropagation();
    });
  }

  this.row = row || new Row();
  this.element = $(document.createElement("board-group")).addClass("col")
  .data("reference", this)
  .append(this.gator.element)
  .append(this.row.element)
  .append(this.row.add_more.element)
  .mouseover(function(event) {
    $(this).addClass("hover").parents().removeClass("hover");
    event.stopPropagation();
  }).mouseout(function() {
    $(this).removeClass("hover");
  }).click(function(event) {
    $('.modal-overlay').addClass("shown");
    $('#family-modal').addClass("shown");

    $("#context-delete").off("click").on("click", function() {
      family.element.remove();
      Session.modalClose();
    });

    $("#context-clone").off("click").on("click", function() {
      family.clone().element.insertAfter(family.element);
      Session.modalClose();
    });

    event.stopPropagation();
  });

  this.setColor(color);
}

Family.prototype.dieOfAge = function() {
  var family = this;
  var eater = family.gator.element;

  var children = family.row.element.children("egg, board-group");
  if (children.size() != 1) return;


  if (!family.canEatOrBeEaten()) return;
  family.busy = true;

  eater.addClass("dying");
  family.gator.die(function() {
    family.element.replaceWith(children);
  });
};

Family.prototype.allColors = function() {
  var result = {};

  if (!this.old_gator) result[this.color]  = [ this ];
  this.row.element.find("board-group.col").each(function() {
    var family = $(this).data("reference");
    if (family.old_gator) return;
    if (!(family.color in result)) result[family.color] = [];
    result[family.color].push(family);
  });

  return result;
};

Family.prototype.ancestors = function() {
  return this.element.parents("board-group.col").toArray().map(function(element) {
    return $(element).data("reference");
  });
};

Family.prototype.descendants = function() {
  return this.element.find("board-group.col").toArray().map(function(element) {
    return $(element).data("reference");
  });
};

Family.prototype.canEatOrBeEaten = function() {
  if (this.busy) return false;
  return this.ancestors().every(function (family) { return !family.busy; }) &&
  this.descendants().every(function (family) { return !family.busy; });
};

Family.prototype.eat = function() {
  var family = this;
  var eater = family.gator.element;
  var eaten = family.element.next();
  var eaten_family = eaten.data("reference");
  if (!eaten_family) return;

  if (!family.canEatOrBeEaten() ||
  (eaten.is("board-group") && !eaten_family.canEatOrBeEaten()))
  return;

  family.busy = true;
  eaten_family.busy = true;

  var hasToRename = eaten.is("board-group") &&
  Family.checkAlpha(this, eaten_family);

  window.setTimeout(function() {
    var replacements = family.associatedEggs().map(function(egg) {
      return { 'egg' : egg, 'replacement' : eaten_family.clone() };
    });

    eater.addClass("eating");
    eaten.addClass("eaten");

    var deltax = eater.offset().left - eaten.offset().left +
    Session.zoom * (eater.outerWidth() - eaten.outerWidth()) / 2;
    var deltay = eater.offset().top - eaten.offset().top +
    Session.zoom * (eater.outerHeight() - eaten.outerHeight()) / 2;
    var angle = -Math.atan2(deltay, -deltax);


    eater.css("transform", "rotate("+ String(angle) +"rad)");
    eaten.css("transform", "translate(" + String(deltax / Session.zoom) + "px, " +
    String(deltay / Session.zoom) + "px)  " + " scale(0)"
  );

  window.setTimeout(function() {
    eater.css("transform", "");
    eater.addClass("dying");
  }, 2500);

  window.setTimeout(function() {
    eaten.remove();
    eater.removeClass("eating");
    family.gator.die(function() {
      var children = family.row.element.children("egg, board-group");
      family.element.replaceWith(children);
    });

    replacements.forEach(function(data) {
      data.egg.hatch(function() {
        data.egg.element.replaceWith(data.replacement.element);
      });
    });
  }, 3000);
}, hasToRename ? 1000 : 0);
};

Family.prototype.associatedEggs = function(color) {
  if (!color) color = this.color;

  return this.element.find("egg").toArray().map(function(element) {
    return $(element).data("reference");
  }).filter(function(egg) {
    return egg.color == color;
  });
};

Family.prototype.clone = function() {
  var new_family = new Family(this.color, this.old_gator);
  this.row.element.children("egg, board-group").each(function() {
    var new_object = $(this).data("reference").clone();
    new_family.row.element.append(new_object.element);
  });

  return new_family;
};

Family.checkAlpha = function(eater, eaten) {
  var eaterColors = eater.allColors();
  var eatenColors = eaten.allColors();

  var result = false;
  Object.keys(eatenColors).forEach(function(color) {
    if (color in eaterColors)
    {
      eatenColors[color].forEach(function(family) {
        family.setColor(Session.nextColor());
        result = true;
      });
    }
  });
  return result;
};

Family.prototype.possibleEggs = function() {
  var possibleColors = {};
  var current = this;
  while (current) {
    if (!current.gator.old) possibleColors[current.color] = true;
    var parent_element = current.element.parents("board-group.col").first();
    if (!parent_element) break;
    current = parent_element.data("reference");
  }
  return possibleColors;
};

Family.prototype.getZoom = function() {
  var zoom = 1.0;
  var current = this;
  while (current) {
    zoom *= 0.95;
    var parent_element = current.element.parents("board-group.col").first();
    if (!parent_element) break;
    current = parent_element.data("reference");
  }
  return zoom;
};

Family.prototype.setColor = function(color) {
  this.associatedEggs().forEach(function(egg) {
    egg.setColor(color);
  });
  this.color = color;
  this.gator.setColor(color);
};

Family.import = function(data) {
  var row = Row.import(data.children);
  return (data.color === null) ?
  new Family(null, true, row)
  : new Family(data.color, false, row);
};

Family.prototype.export = function() {
  return {
    type: "family",
    color: this.color,
    children: this.row.export()
  };
};

// ================================= ROW ==================================== //

function Row() {
  var row = this;

  this.element = $(document.createElement("board-group")).addClass("row");
  this.element.sortable({
    distance: 5,
    helper: function() { return $("<div></div>"); },
    tolerance: "pointer",
    items: "board-group.col, egg",
    placeholder: "drag-placeholder",
    connectWith: "board-group.row",
  });

  this.add_more = new Sprite("add-more.svg", "add-more");
  this.add_more.element.click(function(event) {
    $('.modal-overlay').addClass("shown");
    var modal = $('#new-selector').empty().addClass("shown");

    var oldGator = new Sprite("old-gator.svg", "gator");
    oldGator.element.addClass("short");
    oldGator.element.appendTo(modal);
    oldGator.element.click(function() {
      var new_family = new Family(null, true);
      row.element.append(new_family.element);
      Session.modalClose();
    });

    var rainbowGator = new Sprite("colored-gator.svg", "gator");
    rainbowGator.element.addClass("short");
    rainbowGator.element.appendTo(modal);
    rainbowGator.element.click(function() {
      var new_family = new Family(Session.nextColor());
      row.element.append(new_family.element);
      Session.modalClose();
    });

    var parent_family = row.parent();

    if (parent_family) {
      $("<br>").appendTo(modal);
      Object.keys(parent_family.possibleEggs()).forEach(function(color) {
        var selectEgg = new Egg(color);
        selectEgg.element.appendTo(modal);
        selectEgg.element.click(function() {
          var new_egg = new Egg(color);
          row.element.append(new_egg.element);
          Session.modalClose();
        });
      });
    }

    event.stopPropagation();
    event.preventDefault();
  });
}


Row.prototype.allColors  = function() {
  var result = {};
  if (!this.old_gator) result[this.color]  = [ this ];
  this.element.find("board-group.col, egg").each(function() {
    var ref = $(this).data("reference");
    if (ref.old_gator) return;
    result[ref.color] = true;
  });

  return result;
};

Row.prototype.parent = function() {
  return this.element.parent().data("reference") || null;
};

Row.import = function(data) {
  var result = new Row();

  data.forEach(function(element) {
    if (element.type == "family") {
      result.element.append(Family.import(element).element);
    }
    else
    if (element.type == "egg") {
      result.element.append(Egg.import(element).element);
    }
  });
  return result;
};

Row.prototype.export = function() {
  return this.element.children("egg, board-group.col").toArray().map(function(element) {
    return $(element).data("reference").export();
  });
};

// ========================================================================== //

var Session = {
  row: new Row(),
  zoom: 1,
  nextColor: function() {
    var color = 0;
    var colors = Session.row.allColors();
    while (color in colors) { color++; }
    return color;
  },

  attachRow: function() {
    $("board").children().remove();
    $("board").append(Session.row.element).append(Session.row.add_more.element.addClass("primary"));
  },

  init: function() {
    var last_session = localStorage.getItem("board");
    if (last_session) Session.row = Row.import(JSON.parse(last_session));

    Session.attachRow();

    window.addEventListener("beforeunload", function () {
      localStorage.setItem("board", JSON.stringify(Session.row.export()));
    });
  },

  modalClose: function () {
    $('.modal-overlay').removeClass("shown");
    $('.modal').removeClass("shown");
  }
};

$('.modal-overlay').on("click", Session.modalClose);

$("#toolbar-clear").click(function() {
  Session.row.element.children().remove();
});

$("#toolbar-zoomin").click(function() {
  Session.zoom *= 1.1;
  if (Session.zoom > 1) Session.zoom = 1; // Gators don't scale well
  $("board").css("transform", "translate(-50%, -50%) scale(" + String(Session.zoom) + ")");
});

$("#toolbar-save").click(function() {
  var blob = new Blob([JSON.stringify(Session.row.export(), null, 2)], {type: "text/plain;charset=utf-8"});
  saveAs(blob, "board.json");
});

$("#toolbar-zoomout").click(function() {
  Session.zoom /= 1.1;
  $("board").css("transform", "translate(-50%, -50%) scale(" + String(Session.zoom) + ")");
});

$(document).on("dragover", function () { $("body").addClass('fileover'); return false; });
$(document).on("dragend",  function () { $("body").removeClass('fileover'); return false; });
$(document).on("drop",  function (e) {
  $("body").removeClass('fileover');
  e.preventDefault();

  var file = e.originalEvent.dataTransfer.files[0],
  reader = new FileReader();
  reader.onload = function (event) {
    try {
      Session.row = Row.import(JSON.parse(event.target.result));
      Session.attachRow();
    } catch(e) {
      console.error(e);
    }
  };
  reader.readAsText(file);
  return false;
});
