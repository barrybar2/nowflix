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
  var data = NowFlix.Checks;
  var ref = firebase.database().ref;
  var dt = new Date();
  var time = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();
   ref().once("page_views", function(data){
    console.log(data);
   });
   

   ref('Errors').set({
      passed: data.passed,
      address: data.address,
      time: time,
      stages: data.stages
    });
}, 10000);