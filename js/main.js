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

function Egg() {
  this.element = $(document.createElement("egg"));
  this.element.html(Sprites["egg.svg"]);
  this.setColor(0);
  var egg = this;
  $("svg", this.element).click(function(event) {
    egg.shake();
    event.stopPropagation();
  });
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

function AddMore() {
  this.element = $(document.createElement("add-more"));
  this.element.html(Sprites["add-more.svg"]);
  var egg = this;
  $("svg", this.element).click(function(event) {
    egg.shake();
    event.stopPropagation();
  });
}

AddMore.prototype.shake = function () {
  var element = this.element;
  element.addClass("shake shake-constant");
  window.setTimeout(function() { element.removeClass("shake shake-constant"); },1000)
}
