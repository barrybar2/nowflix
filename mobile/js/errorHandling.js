/*
 * Initialise Firebase
 */
var config = {
  apiKey: "AIzaSyA3JactXlHI_OoadES8gw42ZmVRUy6AoMY",
  authDomain: "nowflix-a4868.firebaseapp.com",
  databaseURL: "https://nowflix-a4868.firebaseio.com",
  storageBucket: "",
};
firebase.initializeApp(config);

/*
 * Add in error handling object
 */

NowFlix.Checks = NowFlix.Checks || {};
NowFlix.Checks.passed = false;
NowFlix.Checks.stages = [];

function stageComp(stage){
  NowFlix.Checks.stages.push(stage);
}

setTimeout(function(){
  var ref = NowFlix.Checks;
  var dt = new Date();
  var time = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();
   firebase.database().ref('Errors').set({
      passed: ref.passed,
      address: ref.address,
      time: time,
      stages: ref.stages
    });
}, 10000);