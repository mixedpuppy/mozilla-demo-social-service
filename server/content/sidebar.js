var port = navigator.mozSocial.getWorker().port;

function onLoad() {
  var worker = navigator.mozSocial.getWorker();
  if (worker) {
    document.body.style.border = "3px solid green";
    worker.port.postMessage({topic: "broadcast.listen", data: true});
  } else {
    document.body.style.border = "3px solid red";
  }
  // force logout on reload for now, since we dont have real session
  // management for a real user
  document.cookie="userdata=";
}

function signin() {
  var userdata = {
    portrait: location.protocol + "//" + location.host + "/user.png",
    userName: "matey",
    dispayName: "Bucko Matey",
    profileURL: location.protocol + "//" + location.host + "/index.html"
  }
  document.cookie="userdata="+JSON.stringify(userdata);
  //port.postMessage({topic: "send.user-profile", data: userdata});
}

function signout() {
  // send an empty user object to signal a signout to firefox
  document.cookie="userdata=";
  //port.postMessage({topic: "send.user-profile", data: {}});
}

function userIsConnected(userdata)
{
  $("#userid").text(userdata.userName);
  $("#usericon").attr("src", userdata.portrait);
  $("#useridbox").show();
  $("#usericonbox").show();
  $("#signin").hide();
  $("#content").show();
}

function userIsDisconnected()
{
  $("#signin").show();
  $("#content").hide();
  $("#userid").text("");
  $("#usericon").attr("src", "");
  $("#useridbox").hide();
  $("#usericonbox").hide();
}

messageHandlers = {
  "social.user-profile": function(data) {
    if (data.userName)
      userIsConnected(data);
    else
      userIsDisconnected();
  },
  checkconnectionack: function(msg) {
    userIsConnected(msg);
  },
  connectionclose: function(msg) {
    userIsDisconnected(msg);
  },
};

navigator.mozSocial.getWorker().port.onmessage = function(e) {
    //dump("Got message: " + e.data.topic + " " + e.data.data +"\n");
    var topic = e.data.topic;
    var data = e.data.data;
    if (messageHandlers[topic])
        messageHandlers[topic](data);
};

var chatWin;

function openPanel(event) {
  navigator.mozSocial.openPanel("/flyout.html", event.clientY, function(win) {
	dump("window is opened "+win+"\n");
  });
}

function openChat(event) {
  navigator.mozSocial.openChatWindow("/chatWindow.html?id="+(chatters++), function(win) {
	dump("chat window is opened "+win+"\n");
    chatWin = win;
  });
}

function changeLoc() {
  window.location = "http://www.mozilla.org";
}

var chatters = 0;
function notify(type) {
  var port = navigator.mozSocial.getWorker().port;
  switch(type) {
    case "link":
      data = {
        id: "foo",
        type: null,
        icon: "/icon.png",
        body: "This is a cool link",
        action: "link",
        actionArgs: {
          toURL: "/"
        }
      }
      port.postMessage({topic:"social.notification-create", data: data});
      break;
    case "chat-request":
      port.postMessage({topic:"social.request-chat", data: "/chatWindow.html?id="+(chatters++)});
  }
}

