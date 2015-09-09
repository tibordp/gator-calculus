function Gator() {
  this.element = $(document.createElement("gator"));
  this.element.html(Sprites["alligator.svg"]);
  this.jaw = $(".upper_jaw", this.element);
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
