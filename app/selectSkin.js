function showChoices (form){
	var role = form.role.value,
		sexe = form.sexe.value,
		hair = ["blond", "brown", "red"],
		color = ["blue", "green", "red"],
		skinTable = "";
	if(role == "adm" && sexe == "m"){
		color[2] = "black";
	}
	skinTable = '<h2> Choisissez votre avatar</h2><h2 class="warning">Attention, ce choix est définitif !</h2><br><table>';
	for(var i = 0; i < 3; i++){
		skinTable += '<tr>';
		for(var j = 0; j < 3; j++){
			skinTable += '<td><img src="assets/resources/img/select/' + role + '-' + sexe + '/' + hair[i] + '-' + color[j] + '.png" onclick="sendChoice(\''+ role + '-' + sexe + '-' + hair[i] + '-' + color[j] +'.png\');"></td>';
		}
		skinTable += '</tr>';
	}
	document.getElementById("selectSkin").innerHTML = skinTable;
}

function sendChoice (choice){
	// Envoi du choix vers la base de donnée
	console.log(choice);
	window.location.replace("http://campusnet.tem-tsp.eu:8090/");
}