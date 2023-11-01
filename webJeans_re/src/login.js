var bridge = new WebOSServiceBridge();  
function createToast(msg) {
  var url = 'luna://com.webos.notification/createToast';
  var params = JSON.stringify({
      "message":msg
  });
  bridge.call(url,params);
}

const firebaseConfig = {
  apiKey: "AIzaSyD5OBSUvXY-Yd_eBUsBWnNG8hltOZFXazE",
  authDomain: "webjeans-f0f95.firebaseapp.com",
  databaseURL: "https://webjeans-f0f95-default-rtdb.firebaseio.com",
  projectId: "webjeans-f0f95",
  storageBucket: "webjeans-f0f95.appspot.com",
  messagingSenderId: "334680708380",
  appId: "1:334680708380:web:35d36575bf793088e396d9",
  measurementId: "G-DXDNFGKM7T"
};

const urlParams = new URLSearchParams(window.location.search);
const user_name = urlParams.get('user_name');

// Firebase 초기화
firebase.initializeApp(firebaseConfig);

// 데이터베이스 경로 설정
var db = firebase.database();
var useridRef = db.ref('user_data/user_id');
var userRef = db.ref('users');

let name = null;

const storage = firebase.storage();

const video = document.getElementById('video');
const captureButton = document.getElementById('captureButton');
const info = document.getElementById('countdown');
let captureCount = 0;
firebase.database().ref('flag').set(0);

// 웹캠을 위한 사용자 미디어 가져오기
navigator.mediaDevices.getUserMedia({ video: true })
  .then((stream) => {
    video.srcObject = stream;
  })
  .catch((error) => {
    createToast('웹캠 접근 오류:');
  });

 /*-------------------------------------------------------------------------------------------------*/
 /*-------------------------------------------------------------------------------------------------*/
 /*-------------------------------------------------------------------------------------------------*/

 
// 메인 페이지로 이동
function redirectToAnotherLocalFile() {
    // 새로운 로컬 파일의 경로를 지정
    var newPagePath = "index.html?user_name=" + name;
    // 페이지 이동
    window.location.href = newPagePath;
}

function queryUserData(userId) {
    userRef.orderByChild("number").equalTo(userId).once('value')
        .then(function(snapshot) {
            snapshot.forEach(function(childSnapshot) {
                var data = childSnapshot.val();
                name = data.name;
            });
        })
        .catch(function(error) {
            console.error("데이터 조회 오류:", error);
        });   
}

captureButton.addEventListener('click', () => {
  info.innerText = ' 잠시만 기다려 주세요 . . . ';
  // 이미 캡처한 경우
  if (captureCount >= 1) {
    console.log('로그인 시도');
    return;
  }

  console.log('사진 촬영' + captureCount);

  // <canvas> 요소의 2D 그래픽 컨텍스트를 가져와서 context 변수에 저장
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  // 사진 사이즈 설정
  canvas.setAttribute("width", 640);
  canvas.setAttribute("height", 480);
  
  // 캡처된 Canvas 이미지를 데이터 URL로 변환
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  const imageDataURL = canvas.toDataURL('image/png');

  // 고유한 파일명 생성
  const filename = `signin_image_${captureCount + 1}.png`;

  // Firebase Storage 위치에 대한 참조
  const storageRef = storage.ref(`testset/${filename}`);

  // 이미지 업로드
  function handleImageUpload() {
    storageRef.putString(imageDataURL, 'data_url').then((snapshot) => {
      console.log('이미지 업로드 성공:', snapshot);

      // 업로드된 이미지의 다운로드 URL 가져오기
      storageRef.getDownloadURL().then((url) => {
        useridRef.once('value')
          .then(function(snapshot) {
            var user_data = snapshot.val();
            if (user_data) {
              var confidence = user_data.confidence || 0.0;
              if (confidence >= 20.0) {
                setTimeout(function() {
                  info.innerText = "로그인 성공";
                  hello.innerText = name + "님, 반갑습니다.";
                  createToast(name + "님, 반갑습니다.");
                }, 5000);

                const user_id = user_data.id;
                queryUserData(user_id);

                setTimeout(redirectToAnotherLocalFile, 10000);
              } else {
                setTimeout(function() {
                  info.innerText = "로그인 실패";
                }, 5000);
              }
            } 
          })
          .catch(function(error) {
            console.error("오류 발생: " + error);
          });
      });

      // 캡처 카운트 증가
      captureCount += 1;
    }).catch((error) => {
      console.error('이미지 업로드 오류:', error);
    });
  }

  setTimeout(handleImageUpload, 5000);


  console.log('사진 업로드 완료!!!!!!!!');

  // 회원가입 / 로그인 페이지 구별용 flag 설정 ( 2 -> 로그인 )
  firebase.database().ref('flag').set(2)
    .then(() => {
        console.log('Flag 값 설정: ', 2);
    })
    .catch(error => {
        console.error('Flag 값 설정 중 오류 발생:', error);
    });

});
