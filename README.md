function printMousePos(event) {
  console.log("await this.pageTempEmail.mouse.click("+event.clientX+", "+event.clientY+")");
}

document.addEventListener("click", printMousePos);