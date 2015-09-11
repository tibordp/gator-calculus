function modalClose() {
  $('.modal-overlay').removeClass("shown");
  $('.modal').removeClass("shown");
}

var color = 0;

function nextColor() {
  color += 1.618033988749894848204;
  color %= 1;
  return color * 360;
}

$('.modal-overlay').on("click", modalClose);

function Sprite(sprite_name, tag_name) {
  this.element = $(document.createElement(tag_name || "sprite"));
  this.element.html(Sprites[sprite_name]);
}

function Gator(old) {
  this.element = $(document.createElement("gator"));
  this.old = !!old;
  this.element.html(Sprites[old ? "old-gator.svg" : "alligator.svg"]);
  this.jaw = $(".upper_jaw", this.element);
  var gator = this;
  this.setColor(0);
}

Gator.prototype.die = function(callback) {
  var gator = this;
  this.element.addClass("dying");
  window.setTimeout(function() {
  }, 500);
  window.setTimeout(function() {
    gator.element.remove();
    if (callback) callback();
  }, 1500);
}

Gator.prototype.openJaw = function () {
  this.jaw.attr("class", "upper_jaw open")
}

Gator.prototype.closeJaw = function () {
  this.jaw.attr("class", "upper_jaw closed")
}

Gator.prototype.setColor = function(color) {
  this.color = color;
  $(".colored", this.element).css("fill", "hsl(" + String(color) + ", 50%, 50%)");
}

function Egg(color) {
  this.element = $(document.createElement("egg"));
  this.element.html(Sprites["egg.svg"]);
  this.setColor(color);
  this.element.data("reference", this);
}

Egg.prototype.clone = function (callback) {
  return new Egg(this.color);
}

Egg.prototype.hatch = function (callback) {
  var element = this.element;
  element.addClass("shake shake-constant");
  window.setTimeout(function() {
    element.removeClass("shake shake-constant");
    if (callback) callback();
  },3000)
}

Egg.prototype.setColor = function(color) {
  this.color = color;
  $(".colored", this.element).css("fill", "hsl(" + String(color) + ", 50%, 50%)");
}

function Family(color, old_gator) {
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


  this.add_more = new Sprite("add-more.svg", "add-more");
  this.add_more.element.click(function(event) {
    $('.modal-overlay').addClass("shown");
    var modal = $('#new-selector')
      .empty()
      .addClass("shown");

    var oldGator = new Sprite("old-gator.svg", "gator");
    oldGator.element.appendTo(modal);
    oldGator.element.click(function() {
      var new_family = new Family(null, true);
      family.row.append(new_family.element);
      modalClose();
    });

    var rainbowGator = new Sprite("colored-gator.svg", "gator");
    rainbowGator.element.appendTo(modal);

    rainbowGator.element.click(function() {
      var new_family = new Family(nextColor());
      family.row.append(new_family.element);
      modalClose();
    });

    $("<br>").appendTo(modal);
    Object.keys(family.possibleEggs()).forEach(function(color) {
      var selectEgg = new Egg(color);
      selectEgg.element.appendTo(modal);
      selectEgg.element.click(function() {
        var new_egg = new Egg(color);
        family.row.append(new_egg.element);
        modalClose();
      });
    });

    event.stopPropagation();
    event.preventDefault();
  });


  this.row = $(document.createElement("board-group")).addClass("row")
  this.element = $(document.createElement("board-group")).addClass("col")
  .data("reference", this)
  .append(this.gator.element)
  .append(this.row)
  .append(this.add_more.element)
  .mouseover(function(event) {
    $(this).addClass("hover").parents().removeClass("hover");
    event.stopPropagation();
  }).mouseout(function(event) {
    $(this).removeClass("hover");
  }).click(function() {
    family.element.toggleClass("collapsed");
    event.stopPropagation();
  });

  this.row.sortable({
    distance: 5,
    opacity: 0,
    cursorAt: { top: 5, left: 5 },
    tolerance: "pointer",
    items: "board-group.col, egg",
    placeholder: "drag-placeholder",
    connectWith: "board-group.row"
  }).disableSelection();
  this.setColor(color);
}

Family.prototype.dieOfAge = function() {
  var family = this;
  var eater = family.gator.element;
  var eater_svg = $("svg", family.gator.element);

  var children = family.row.children("egg, board-group");
  if (children.size() != 1) return;

  family.gator.die(function() {
    family.element.replaceWith(children);
  });

}

Family.prototype.eat = function() {
  var family = this;
  var eater = family.gator.element;
  var eater_svg = $("svg", family.gator.element);
  var eaten = family.element.next();

  var eaten_family = eaten.data("reference");

  if (!eaten_family) return;
  var replacements = family.associatedEggs().map(function(egg) {
    return { 'egg' : egg, 'replacement' : eaten_family.clone() };
  });

  eater.addClass("eating");
  eaten.addClass("eaten");

  var deltax = eater.offset().left - eaten.offset().left +
   (eater.outerWidth() - eaten.outerWidth()) / 2;
  var deltay = eater.offset().top - eaten.offset().top +
   (eater.outerHeight() - eaten.outerHeight()) / 2;
  var angle = -Math.atan2(deltay, -deltax);


  eater.css("transform", "rotate("+ String(angle) +"rad)");
  eaten.css("transform", "translate(" + String(deltax) + "px, " +
    String(deltay) + "px)  " + " scale(0)"
  );

  window.setTimeout(function() {
    eater.css("transform", "");
  }, 2500);

  window.setTimeout(function() {
    eaten.remove();
    eater.removeClass("eating");
    family.gator.die(function() {
      var children = family.row.children("egg, board-group");
      console.log("foo", children, children.filter("board-group"))
      family.element.replaceWith(children);
    });

    replacements.forEach(function(data) {
      data.egg.hatch(function() { data.egg.element.replaceWith(data.replacement.element); });
    });
  }, 3000);
}

Family.prototype.associatedEggs = function(color) {
  if (!color) color = this.color;

  var family = this;
  var result = [];

  this.row.children("egg").each(function() {
    var egg = $(this).data("reference");
    if (egg.color == color) result.push(egg);
  });

  this.row.children("board-group").each(function() {
    var family = $(this).data("reference");
    Array.prototype.push.apply(result, family.associatedEggs(color));
  });

  return result;
}

Family.prototype.clone = function() {
  var new_family = new Family(this.color, this.old_gator);
  var family = this;

  this.row.children("egg, board-group").each(function() {
    console.log($(this), $(this).data("reference"))
    var new_object = $(this).data("reference").clone();
    new_family.row.append(new_object.element);
  });

  return new_family;
}

Family.prototype.possibleEggs = function(color) {
  var possibleColors = {};
  var current = this;
  while (current) {
    if (!current.gator.old) possibleColors[current.color] = true;
    var parent_element = current.element.parents("board-group.col").first();
    if (!parent_element) break;
    current = parent_element.data("reference");
  }
  return possibleColors;
}

Family.prototype.getZoom = function(color) {
  var zoom = 1.0;
  var current = this;
  while (current) {
    zoom *= 0.95;
    var parent_element = current.element.parents("board-group.col").first();
    if (!parent_element) break;
    current = parent_element.data("reference");
  }
  return zoom;
}

Family.prototype.setColor = function(color) {
  this.color = color;
  this.gator.setColor(color);
  this.associatedEggs().forEach(function(egg) {
    egg.setColor(color);
  })
}
