let slider = document.getElementById("sound");
let soundVol = 50;
let indicator = document.getElementById("indicator");
indicator.innerHTML = soundVol;

function onChangeVol() {
  let val = slider.value;
  soundVol = val;
  indicator.innerHTML = val;
}
