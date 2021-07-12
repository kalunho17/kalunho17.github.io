var domElement = "#timeline";
data = read_data();

timeline(domElement)
			.data(data)
			.band("mainBand", 0.55)
			.band("naviBand", 0.25)
			.xAxis("mainBand")
			.tooltips("mainBand")
			.xAxis("naviBand")
			.labels("mainBand")
			.labels("naviBand")
			.brush("naviBand", ["mainBand"])
			.redraw();
			
function read_data (){
	const rows = [
		["start","end","label", "message", "color"],
		["2007-09-01","2010-07-31","Abitur", "Technisches Gymnasium<br>Hubert-Sternberg-Schule<br>Wiesloch", "Steelblue"],
		["2010-09-01","2013-07-31","Bachelor", "Bachelor of Science<br>Business Informatics<br>University of Mannheim", "Steelblue"],
		["2014-02-01","2017-01-31","Master", "Master of Science<br>Business Informatics<br>University of Mannheim", "Steelblue"],
		["2018-07-01",,"PhD", "PhD Candidate<br>Computer Vision<br>University of Mannheim<br>Fraunhofer ITWM<br>Kaiserslautern, Germany", "Steelblue"],
		["2012-08-01","2013-01-31","Exchange", "Exchange Semester<br>National Chengchi University<br>Taipei, Taiwan", "Navy"],
		["2016-08-01","2017-01-31","Exchange", "Exchange Semester<br>University of Ottawa<br>Ottawa, Canada", "Navy"],
		["2010-07-01","2010-08-20","Internship", "Student Internship (1.5 Month)<br>Freudenberg FV Service SE & Co. KG<br>Weinheim, Germany", "Gray"],
		["2011-06-27","2011-08-15","Internship", "Student Internship (1.5 Month)<br>Freudenberg Vilene Intl. Ltd.<br>Hong Kong", "Gray"],
		["2011-09-01","2012-07-31","Teaching", "Tutor in 'Praktische Informatik'<br>Chair of Computer Science IV<br>University of Mannheim", "CornflowerBlue"],
		["2014-02-02","2016-01-31","Teaching", "Tutor in 'Programmierkurs in C'<br>Chair of Computer Science IV<br>University of Mannheim", "CornflowerBlue"],
		["2013-09-01","2014-01-31","Internship", "IT Consultant (Full-Time)<br>Freudenberg Vilene Nonwovens Co. Ltd<br>Taoyuan, Taiwan", "Gray"],
		["2014-02-03","2017-02-28","IT Consultant", "IT Consultant (Part-Time)<br>Freudenberg Performance Materials SE & Co. KG <br>Weinheim, Germany", "Gray"],
		["2017-03-01","2018-06-30","IT Consultant", "IT Consultant (Full-Time)<br>Freudenberg Performance Materials SE & Co. KG <br>Weinheim, Germany", "Gray"],
	];

	var data = [];
	var datapoint = {};
	var x_ = [];
	var y_ = [];
	for (i = 1; i < rows.length; i++){
	  datapoint = {};
	  datapoint["start"] = rows[i][0]
	  if (rows[i][1] == null){
		datapoint["end"] = "";
	  } else{
		datapoint["end"] = rows[i][1];
	  }
	  datapoint["label"] = rows[i][2];
	  datapoint["message"] = rows[i][3];
	  datapoint["color"] = rows[i][4];
	  data.push(datapoint);
	}
	return data;
}
