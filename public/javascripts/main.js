var slideIndex = 1;
var YOUR_FACE_API_KEY = "*******************";
var YOUR_EMOTION_API_KEY = "*******************";

window.onload = function () {

	
	showDivs(slideIndex);
	var file = document.getElementById('file');
	var photo = document.getElementById('photo');
	var photoWrap = document.getElementById('photo-wraper');
	var photosWrap = document.getElementById('photos-wrap');
	file.onchange = function () {
		//document.getElementById('hint').innerHTML = 'file change啦！！！';
		var photoWrap = document.getElementById('photo-wraper');
		var nname = photoWrap.firstChild.nodeName;
		var p = this.files.length !== 0 ? this.files[0] : null;
		console.log(p.size);
		if (p.size >= 4190000) {
			//console.log('Photo\'s size is too large to deal!');
			document.getElementById('hint').innerHTML = '照片太大啦！！';
			alert("照片太大啦！！");
			return;
		}
		if (p) {
			var reader = new FileReader();
			var img;
			if (!reader) {
				this.value = '';
				return;
			}
			var orientation;
			//EXIF js 可以读取图片的元信息  https://github.com/exif-js/exif-js
			EXIF.getData(p, function () {
				orientation = EXIF.getTag(this, 'Orientation');
			});
			reader.onload = function (e) {

				rotateImg(this.result, orientation, function (data) {
					//这里可以使用校正后的图片data了 

					document.getElementById('photos-wrap').style.display = 'none';
					document.getElementById('photo-wrap').style.display = 'block';
					document.getElementById('useother').style.display = 'block';
					
					document.getElementById('hint').innerHTML = '';
					this.value = '';
					img = data;
					if (document.getElementById('canvas')) {
						document.getElementById('photo-wraper').removeChild(document.getElementById('canvas'));
					}
					var photo = document.createElement('img');
					photo.id = 'photo';
					photo.classList.add('photo');
					console.log(img);
					photo.src = img;
					document.getElementById('photo-wraper').appendChild(photo);
					//checkDirection(img,photo);
					markFace(img);
				});
			};
			// reader.addEventListener("load", function () {
			// }, false);
			reader.readAsDataURL(p);
		}
		this.value = "";
	};

	
};

function makeBlob(dataURL) {
	var BASE64_MARKER = ';base64,';
	if (dataURL.indexOf(BASE64_MARKER) == -1) {
		var parts = dataURL.split(',');
		var contentType = parts[0].split(':')[1];
		var raw = decodeURIComponent(parts[1]);
		return new Blob([raw], { type: contentType });
	}
	var parts = dataURL.split(BASE64_MARKER);
	var contentType = parts[0].split(':')[1];
	var raw = window.atob(parts[1]);
	var rawLength = raw.length;

	var uInt8Array = new Uint8Array(rawLength);

	for (var i = 0; i < rawLength; ++i) {
		uInt8Array[i] = raw.charCodeAt(i);
	}

	return new Blob([uInt8Array], { type: contentType });
}

function markFace(img) {
	var photoWrap = document.getElementById('photo-wraper');
	//console.log(photoWrap);
	if (document.getElementById('photo')) {
		var photo = document.getElementById('photo');
	} else {
		if (!img) {
			console.log('没有照片哈'); return;
		}
		var photo = document.createElement('img');
		photo.id = 'photo';
		photo.classList.add('photo');
		console.log("你选择了 " + img);
		photo.src = img;
		document.getElementById('photo-wraper').appendChild(photo);
	}

	if (img == null) getBase64FromImageUrl(photo);
	else postImgToFace(photo, img);
	//var binaryString = String.fromCharCode.apply(null, imgArray);
	//document.getElementById('hint').innerHTML = 'size: '+ bytes.byteLength;
}

function postImgToFace(photo, img) {
	$.ajax({
		url: "https://api.cognitive.azure.cn/face/v1.0/detect?returnFaceId=true&returnFaceLandmarks=false&returnFaceAttributes=age,gender,emotion",
		beforeSend: function (xhrObj) {
			// Request headers
			xhrObj.setRequestHeader("Content-Type", "application/octet-stream");
			xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", YOUR_FACE_API_KEY);
		},
		type: "POST",
		// Request body
		processData: false,
		data: makeBlob(img)
	})
		.done(function (response) {

			postImgtoCognitiveService(photo, img, response);
		})
		.fail(function () {
			//alert("error");
		});
}

function postImgtoCognitiveService(photo, img, faceresponse) {
	$.ajax({
		url: "https://api.cognitive.azure.cn/emotion/v1.0/recognize",
		beforeSend: function (xhrObj) {
			// Request headers
			xhrObj.setRequestHeader("Content-Type", "application/octet-stream");
			xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", YOUR_EMOTION_API_KEY);
		},
		type: "POST",
		// Request body
		processData: false,
		data: makeBlob(img)
	})
		.done(function (response) {
			//alert("success");
			var w = photo.width,
				h = photo.height;
			//var soucrew = img.width, soucreh = img.height;

			var testimg = new Image();

			testimg.setAttribute('crossOrigin', 'anonymous');

			testimg.onload = function () {
				var soucrew = this.width, soucreh = this.height;

				var wratio = w / soucrew, hratio = h / soucreh;
				
				result = response;
				var faceresult = faceresponse;
				postDataToServer(getJsonObject(faceresult,result));
				var photoWrap = document.getElementById('photo-wraper');
				var canvas = document.createElement('canvas');
				canvas.id = 'canvas';
				canvas.width = w;
				canvas.height = h;
				var ctx = canvas.getContext('2d');
				ctx.lineWidth = '20px';
				ctx.strokeStyle = 'rgba(255,255,255,1)'
				ctx.fillStyle = 'rgba(255,100,50,1)';
				ctx.drawImage(photo, 0, 0, w, h);
				photoWrap.removeChild(document.getElementById('photo'));
				//checkDirection(photo,canvas);
				photoWrap.appendChild(canvas);
				if (result.length <= 0) {
					//[]
					document.getElementById('hint').innerHTML = '没找到你的脸。。。T_T';
					document.getElementById('emotionword').innerHTML = '';
					return;
				} else {
					//[{"faceRectangle":{"height":75,"left":175,"top":62,"width":74},"scores":{"anger":2.25950828E-07,"contempt":2.07544915E-09,"disgust":1.46274264E-08,"fear":2.08273E-09,"happiness":0.9999996,"neutral":3.00663565E-08,"sadness":5.228413E-11,"surprise":1.5693125E-07}},{"faceRectangle":{"height":69,"left":32,"top":71,"width":69},"scores":{"anger":3.62900576E-09,"contempt":1.59568227E-13,"disgust":1.03942621E-09,"fear":1.5040174E-12,"happiness":1.0,"neutral":9.446575E-13,"sadness":7.759674E-12,"surprise":6.514645E-10}},{"faceRectangle":{"height":52,"left":122,"top":129,"width":52},"scores":{"anger":3.798923E-05,"contempt":4.24225072E-05,"disgust":0.000173884677,"fear":0.0127741341,"happiness":3.15350371E-06,"neutral":0.226828724,"sadness":0.0106423106,"surprise":0.749497354}}]
					//[{"faceRectangle":{"height":144,"left":304,"top":195,"width":144},"scores":{"anger":0.000121840094,"contempt":0.007945492,"disgust":0.00183907372,"fear":7.100359E-07,"happiness":0.9179283,"neutral":0.07188488,"sadness":0.0001372545,"surprise":0.000142478108}}]

					var hintString = ''; var count = result.length;

					for (i = 0; i < count; i++) {
						if (faceresult[i].faceAttributes.gender === "male")
							hintString = hintString + '<img class="emoji" src="../assets/user_male.png">';
						else hintString = hintString + '<img class="emoji" src="../assets/user_female.png">';
					}
					document.getElementById('hint').innerHTML = hintString;
					for (j = 0; j < count; j++) {
						faceDeal(ctx, result[j], wratio, hratio, faceresult[j], j === 0 ? true : false);
					}
					document.getElementById('photo-wraper').style.display = 'block';
					document.getElementById('title-img').style.display = 'none';
					// result.forEach(function (result) {
					// 	faceDeal(ctx, result);
					// });
				}

			};

			testimg.src = img;

			//document.getElementById('hint').innerHTML = response;
			//var result = JSON.parse(response);//JSON && JSON.parse(response) || $.parseJSON(response);

		})
		.fail(function () {
			//alert("error");
		});
}


function getBase64FromImageUrl(photo) {
	var img = new Image();

	img.setAttribute('crossOrigin', 'anonymous');

	img.onload = function () {
		var canvas = document.createElement("canvas");
		canvas.width = this.width;
		canvas.height = this.height;

		var ctx = canvas.getContext("2d");
		ctx.drawImage(this, 0, 0);

		var dataURL = canvas.toDataURL("image/jpeg");

		postImgToFace(photo, dataURL.replace(/^data:image\/(png|jpg);base64,/, ""));
	};

	img.src = photo.src;
}

//responseText	"<h1>Unexpected token o in JSON at position 1</h1>\n<h2>400</h2>\n<pre>SyntaxError: Unexpected token o in JSON at position 1\n    at Object.parse (native)\n    at parse (c:\\Projects\\EmotionWeb\\node_modules\\body-parser\\lib\\types\\json.js:84:17)\n    at c:\\Projects\\EmotionWeb\\node_modules\\body-parser\\lib\\read.js:102:18\n    at IncomingMessage.onEnd (c:\\Projects\\EmotionWeb\\node_modules\\body-parser\\node_modules\\raw-body\\index.js:149:7)\n    at IncomingMessage.g (events.js:292:16)\n    at emitNone (events.js:86:13)\n    at IncomingMessage.emit (events.js:185:7)\n    at endReadableNT (_stream_readable.js:974:12)\n    at _combinedTickCallback (internal/process/next_tick.js:80:11)\n    at process._tickCallback (internal/process/next_tick.js:104:9)</pre>\n"
function postDataToServer(result) {
	$.ajax({
		url: "http://ocpemotion.chinacloudsites.cn/api/addemotiondata",
		beforeSend: function (xhrObj) {
			// Request headers
			xhrObj.setRequestHeader("Content-Type", "application/json");
		},
		type: "POST",
		// Request body
		processData: false,
		data: result
	})
		.done(function (response) {
		})
		.fail(function (error) {
			//alert("error"+error.responseText);
		});
}

function getJsonObject(faceresult,emotionresult)
{
	var finalResult = "[";
	for (i = 0; i<faceresult.length;i++)
	{
		if (i!=0) finalResult+= ",";
		var faceid = faceresult[i].faceId;
		var emotionText = getMaxEmotion(emotionresult[i].scores);
		var gender = faceresult[i].faceAttributes.gender=="male"?"男":"女";
		var age = Math.round(faceresult[i].faceAttributes.age);
		finalResult +='{"faceid":"'+faceid+'","gender":"'+gender+'","age":"'+age+'","emotion":"'+emotionText+'"}';
	}
	return finalResult+"]";
}

function faceDeal(ctx, data, wratio, hratio, facedata, emotionwordflag) {


	var face = data.faceRectangle;
	var emotion = data.scores;
	var gender = facedata.faceAttributes.gender;
	var age = Math.round(facedata.faceAttributes.age);


	ctx.font = '' + face.width * wratio / 4 + 'px sans-serif';
	ctx.textAlign = 'center';
	var emotionText = getMaxEmotion(emotion);

	if (emotionwordflag) {
		document.getElementById('emotionword').innerHTML = getEmotionText(emotionText);
		if (emotionText === "高兴") 
			document.getElementById('emotionword').innerHTML = "你的笑脸值高达"+getEmotionScores(emotion) +"分，快去和小伙伴们分享一下你的喜悦吧！";
	}

	ctx.fillStyle = 'orange';
	if ((face.top - face.height / 3) < 0) {
		ctx.fillText(emotionText + "," + age + "岁", face.left * wratio + face.width * wratio / 2, face.top * hratio + face.height * hratio * 10 / 8);
	} else {
		ctx.fillText(emotionText + "," + age + "岁", face.left * wratio + face.width * wratio / 2, face.top * hratio - face.height * hratio / 8);
	}


	ctx.rect(face.left * wratio, face.top * hratio, face.width * wratio, face.height * hratio);
	ctx.fillStyle = 'transparent';
	ctx.fill();
	ctx.lineWidth = 2;
	ctx.strokeStyle = 'orange';
	ctx.stroke();

}

function getMaxEmotion(scores) {
	var result = "生气";
	var maxscore = 0;
	if (scores.contempt > maxscore) { maxscore = scores.contempt; result = "蔑视"; }
	if (scores.disgust > maxscore) { maxscore = scores.disgust; result = "厌恶"; }
	if (scores.fear > maxscore) { maxscore = scores.fear; result = "恐惧"; }
	if (scores.happiness > maxscore) { maxscore = scores.happiness; result = "高兴"; }
	if (scores.neutral > maxscore) { maxscore = scores.neutral; result = "自然"; }
	if (scores.sadness > maxscore) { maxscore = scores.sadness; result = "悲伤"; }
	if (scores.surprise > maxscore) { maxscore = scores.surprise; result = "惊讶"; }
	return result;
}

function getEmotionScores(emotion)
{
	var score = Math.round(emotion.happiness*100);
	var result = score + 6 - parseInt(emotion.contempt.toExponential().substring(0,1))
	- parseInt(emotion.disgust.toExponential().substring(0,1))
	- parseInt(emotion.fear.toExponential().substring(0,1))
	- parseInt(emotion.neutral.toExponential().substring(0,1))
	- parseInt(emotion.sadness.toExponential().substring(0,1))
	- parseInt(emotion.surprise.toExponential().substring(0,1));
	return result;

}

function getEmotionText(emotion) {
	if (emotion === "生气") return "如此霸道，一起拯救世界吧！";
	else if (emotion === "蔑视") return "食物链的顶端是人类，鄙视链的顶端就靠你了！";
	else if (emotion === "厌恶") return "如此美丽（帅）的你，真是让我厌恶的不要不要的！！";
	else if (emotion === "恐惧") return "明镜止水、宁静致远。来，跟我一起深呼吸1、2、3……";
	else if (emotion === "高兴") return "你笑得那么美，你妈妈知道吗。";
	else if (emotion === "自然") return getNatualEmotionWord();
	else if (emotion === "悲伤") return "悲伤逆流，转过身，后背给你靠。";
	else return "是瞬间迸发的热情让我们相遇，这样的惊讶是美丽的，然而变化无常更为美丽。";
	// 1.	愤怒：如此霸道，一起拯救世界吧！
	// 2.	轻蔑：食物链的顶端是人类，鄙视链的顶端就靠你了。
	// 3.	厌恶：如此美丽（帅）的你，真是让我厌恶的不要不要的！
	// 4.	恐惧：明镜止水、宁静致远。来，跟我一起深呼吸1、2、3……
	// 5.	快乐：你笑得那么美，你妈妈知道吗。
	// 6.	无表情：是什么让你如此生无可恋？
	// 7.	悲伤：悲伤逆流，转过身，后背给你靠。
	// 8.	惊讶：是瞬间迸发的热情让我们相遇，这样的惊讶是美丽的，然而变化无常更为美丽。

	// 1.	你在想什么？深邃的眼神，让我不禁沉迷其中……
	// 2.	发呆啊发呆，不在发呆中睡着，就在发呆中成为僵尸……
	// 3.	呆若木鸡，说的就是你！O(∩_∩)O哈哈~
	// 4.	是不是我华丽的外表迷惑了你的眼？
	// 5.	我知道你一定是内心如火，只是为了低调隐藏了自己
	// 6.	你在想念谁？你的眼神出卖了你。
	// 7.	我们都是木偶人，一不许说话二不许动……
	// 8.	想笑别憋着！不然，我怎么知道你想笑？
	
}

function getNatualEmotionWord()
{
	var result = ['你在想什么？深邃的眼神，让我不禁沉迷其中……',
				  '发呆啊发呆，不在发呆中睡着，就在发呆中成为僵尸……',
				  '呆若木鸡，说的就是你！O(∩_∩)O哈哈~',
				  '是不是我华丽的外表迷惑了你的眼？',
				  '我知道你一定是内心如火，只是为了低调隐藏了自己',
				  '你在想念谁？你的眼神出卖了你。',
				  '我们都是木偶人，一不许说话二不许动……',
				  '想笑别憋着！不然，我怎么知道你想笑？'
				];
	var index = Math.floor(Math.random() * 7);
	var responsedata = result[index];
	return responsedata;
}

// @param {string} img 图片的base64
// @param {int} dir exif获取的方向信息
// @param {function} next 回调方法，返回校正方向后的base64
function rotateImg(img, dir, next) {
	var image = new Image();
	image.onload = function () {
		var degree = 0, drawWidth, drawHeight, width, height;
		drawWidth = this.naturalWidth;
		drawHeight = this.naturalHeight;
		//以下改变一下图片大小
		var maxSide = Math.max(drawWidth, drawHeight);
		if (maxSide > 1024) {
			var minSide = Math.min(drawWidth, drawHeight);
			minSide = minSide / maxSide * 1024;
			maxSide = 1024;
			if (drawWidth > drawHeight) {
				drawWidth = maxSide;
				drawHeight = minSide;
			} else {
				drawWidth = minSide;
				drawHeight = maxSide;
			}
		}
		var canvas = document.createElement('canvas');
		canvas.width = width = drawWidth;
		canvas.height = height = drawHeight;
		var context = canvas.getContext('2d');
		//判断图片方向，重置canvas大小，确定旋转角度，iphone默认的是home键在右方的横屏拍摄方式
		switch (dir) {
			//iphone横屏拍摄，此时home键在左侧
			case 3:
				degree = 180;
				drawWidth = -width;
				drawHeight = -height;
				break;
			//iphone竖屏拍摄，此时home键在下方(正常拿手机的方向)
			case 6:
				canvas.width = height;
				canvas.height = width;
				degree = 90;
				drawWidth = width;
				drawHeight = -height;
				break;
			//iphone竖屏拍摄，此时home键在上方
			case 8:
				canvas.width = height;
				canvas.height = width;
				degree = 270;
				drawWidth = -width;
				drawHeight = height;
				break;
		}
		//使用canvas旋转校正
		context.rotate(degree * Math.PI / 180);
		context.drawImage(this, 0, 0, drawWidth, drawHeight);
		//返回校正图片
		next(canvas.toDataURL("image/jpeg", .8));
	}
	image.src = img;
}

function ff(photo) {
	
	var newphoto = document.createElement('img');
	newphoto.id = 'photo';
	newphoto.classList.add('photo');
	newphoto.src = photo.src;
	if (document.getElementById('canvas')) {
		document.getElementById('photo-wraper').removeChild(document.getElementById('canvas'));
	}
	document.getElementById('photo-wraper').appendChild(newphoto);
	document.getElementById('photos-wrap').style.display = 'none';
	document.getElementById('photo-wrap').style.display = 'block';
	document.getElementById('photo-wraper').style.display = 'block';
	document.getElementById('useother').style.display = 'block';
	//document.getElementById('back').style.display = 'block';

	// var reader = new FileReader();
	// reader.onload = function (e) {
	// 	markFace(e.result);
	// }
	// reader.readAsDataURL('/assets/' + path);
	markFace(null);
};
function vm() {
	if (document.getElementById('photo')) {
		document.getElementById('photo-wraper').removeChild(document.getElementById('photo'));
	} else {
		document.getElementById('photo-wraper').removeChild(document.getElementById('canvas'));
	}
	document.getElementById('photo-wrap').style.display = 'none';
	document.getElementById('photo-wraper').style.display = 'none';
	document.getElementById('photos-wrap').style.display = 'block';
	document.getElementById('useother').style.display = 'none';
	document.getElementById('title-img').style.display = 'block';
	
	//document.getElementById('back').style.display = 'none';
}
function tipOn(photo) {
	document.getElementById(photo.id).getElementsByTagName('div')[0].style.display = "block";
};
function tipOff(photo) {
	document.getElementById(photo.id).getElementsByTagName('div')[0].style.display = 'none';
}


function plusDivs(n) {
  showDivs(slideIndex += n);
}

function currentDiv(n) {
  showDivs(slideIndex = n);
}

function showDivs(n) {
  var i;
  var x = document.getElementsByClassName("mySlides");
  var dots = document.getElementsByClassName("demo");
  if (n > x.length) {slideIndex = 1}    
  if (n < 1) {slideIndex = x.length}
  for (i = 0; i < x.length; i++) {
     x[i].style.display = "none";  
  }
  for (i = 0; i < dots.length; i++) {
     dots[i].className = dots[i].className.replace(" w3-white", "");
  }
  x[slideIndex-1].style.display = "block";  
  dots[slideIndex-1].className += " w3-white";
}
