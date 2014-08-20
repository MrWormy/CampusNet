tinymce.init({
    selector: "#pannel",
    height: 250,
    width:740,
    plugins: [
        "advlist autolink lists link image charmap print preview anchor",
        "searchreplace visualblocks code",
        "insertdatetime media table contextmenu paste"
    ],
    toolbar: "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image"
});


(function (undefined) {
  var pannels = {};

  function getServices () {
    $.get("getPannels", function (data) {
      var display = document.getElementById("pannels");
      for(var i = 0, l= data.length; i < l; i++){
        var opt = document.createElement("option"),
          pan = data[i],
          name = pan.pName;

        opt.value = name;
        opt.innerHTML = name;
        opt.id = pan.id;
        pannels[name] = {
          id: pan.id,
          text: pan.text,
          isPannel: pan.pannel
        };
        display.appendChild(opt);
      }
      displayPannel({target: display});
    });
  }

  function changeHtmlDisplay (bool) {
    var pan = document.getElementById("pannel"),
      dial = document.getElementById("dialogue");

    if(bool){
      tinymce.activeEditor.show();
      dial.style.display = "none";
    } else {
      tinymce.activeEditor.hide();
      pan.style.display = "none";
      dial.style.display = "block";
    }
  }

  function displayText (text, bool){
    if(bool){
      tinymce.activeEditor.setContent(text);
    } else {
      document.getElementById("dialogue").value = text;
    }
  }

  function displayPannel (e) {
    var name = e.target.value,
      pan = pannels[name];

    if(pan){
      changeHtmlDisplay(pan.isPannel);
      displayText(pan.text, pan.isPannel);
    }
  }

  function getText (bool) {
    var text = "";

    if(bool){
      text = tinymce.activeEditor.getContent();
    } else {
      text = document.getElementById("dialogue").value;
    }

    return text;
  }

  function sendPanToServ (pannel) {
    $.ajax({
      type: "POST",
      url: "setNewPanText",
      data: JSON.stringify(pannel),
      success: function(data, status){
        if(data == "OK"){
          alert("les modifications ont bien été enregistrées");
        } else {
          alert("une erreur est survenue lors de l'enregitrement, veuillez réessayer : ");
        }
      },
      error: function (data) {
        alert("une erreur est survenue lors de l'enregitrement, veuillez réessayer : ", data);
      }
    });
  }

  function sendToServ (e) {
    var name = document.getElementById("pannels").value,
      pan = pannels[name];

    if(pan){
      var text = getText(pan.isPannel);

      if(text && text.length > 0){
        pan.text = text;
        sendPanToServ(pan);
      }
    }
  }

  function initListeners () {
    var pans = document.getElementById("pannels"),
      save = document.getElementById("save");

    pans.addEventListener("change", displayPannel, false);
    save.addEventListener("click", sendToServ, false);
  }

  function initialize () {
    getServices();
    initListeners();
  }

  window.onload = initialize;
})()
