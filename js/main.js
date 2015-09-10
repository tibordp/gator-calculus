$('.modal-overlay').on("click", function() {
    $('.modal-overlay').removeClass("shown");
    $('.modal').removeClass("shown");
});

function Sprite(sprite_name, tag_name) {
  this.element = $(document.createElement(tag_name || "sprite"));
  this.element.html(Sprites[sprite_name]);
}

function Gator() {
  this.element = $(document.createElement("gator"));
  this.element.html(Sprites["alligator.svg"]);
  this.jaw = $(".upper_jaw", this.element);
  var gator = this;
  $("svg", this.element).click(function(event) {
    gator.element.addClass("shake shake-constant shake-rotate dying");
    window.setTimeout(function() {
    }, 500);
    window.setTimeout(function() {
      gator.element.remove();
    }, 1500);
    event.stopPropagation();
  });
  this.setColor(0);
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
}

Egg.prototype.shake = function () {
  var element = this.element;
  element.addClass("shake shake-slow shake-constant");
  window.setTimeout(function() { element.removeClass("shake shake-slow shake-constant"); },1000)
}

Egg.prototype.setColor = function(color) {
  this.color = color;
  $(".colored", this.element).css("fill", "hsl(" + String(color) + ", 50%, 50%)");
}

function Family(parent, color) {
  var family = this;

  this.parent = parent;
  this.bound_eggs = [];
  this.gator = new Gator();
  this.add_more = new Sprite("add-more.svg", "add-more");
  this.add_more.element.click(function(event) {
    $('.modal-overlay').addClass("shown");
    var modal = $('#new-selector')
      .empty()
      .addClass("shown");

    var oldGator = new Sprite("old-gator.svg", "gator");
    oldGator.element.appendTo(modal);
    var rainbowGator = new Sprite("colored-gator.svg", "gator");
    rainbowGator.element.appendTo(modal);
    $("<br>").appendTo(modal);

    Object.keys(family.possibleEggs()).forEach(function(color) {
      for (var i = 0; i < 10; ++i) {
      var selectEgg = new Egg(color);
      selectEgg.element.appendTo(modal); }
    });

    event.stopPropagation();
    event.preventDefault();
  });

  this.setColor(color);

  this.row = $(document.createElement("board-group")).addClass("row")
  .append(this.add_more.element);
  this.element = $(document.createElement("board-group")).addClass("col")
  .append(this.gator.element)
  .append(this.row)
  .mouseover(function(event) {
    $(this).addClass("hover").parents().removeClass("hover");
    event.stopPropagation();
  }).mouseout(function(event) {
    $(this).removeClass("hover");
  }).click(function(event) {
    var foo = $(this);
    foo.addClass("eaten");
    window.setTimeout(function() {
      foo.remove();
    }, 1000);
    event.stopPropagation();
  });
}

Family.prototype.possibleEggs = function(color) {
  var possibleColors = {};
  var current = this;
  while (current) {
    possibleColors[current.color] = true;
    current = current.parent;
  }
  return possibleColors;
}

Family.prototype.setColor = function(color) {
  this.color = color;
  this.gator.setColor(color);
  this.bound_eggs.forEach(function(egg) {
    egg.setColor(color);
  })
}
