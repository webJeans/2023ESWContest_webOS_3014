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

// Firebase Authentication 및 Firestore 참조
//const auth = firebase.auth();
//const firestore = firebase.firestore();
const storage = firebase.storage();
const database = firebase.database();

const video = document.getElementById('video');
const nameInput = document.getElementById('nameInput');
const telInput = document.getElementById('usertel');
const bdateInput = document.getElementById('userbdate');

// 성별 정보 가져오기
const userGenderElements = document.querySelectorAll('input[name="usergender"]');
let userGender = null;

const captureButton = document.getElementById('captureButton');
const info = document.getElementById('countdown');
let captureCount = 0;
var picNum = 5;  // 사진 촬영 횟수  *****************************************************************************

// 웹캠을 위한 사용자 미디어 가져오기
navigator.mediaDevices.getUserMedia({ video: true })
  .then((stream) => {
    video.srcObject = stream;
  })
  .catch((error) => {
    console.error('웹캠 접근 오류:', error);
  });

/*------------------------------------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------------------------------------*/

    // 캡처 버튼 클릭 이벤트
    captureButton.addEventListener('click', () => {

      const userName = nameInput.value;
      const userTel = telInput.value;
      const userBDate = bdateInput.value;
      
      userGenderElements.forEach((element) => {
        if (element.checked) {
          userGender = element.value;
        }
      });

      captureCount = 0;

      // Firebase Realtime Database에서 현재 저장된 아이템 개수 가져오기
      const userRef = database.ref('users');

      userRef.once('value').then((snapshot) => {

        const userNumber = snapshot.numChildren() + 1; // 저장된 아이템 개수 + 1
        
        // 중복된 이름이 있는지 확인
        userRef.orderByChild('name').equalTo(userName).once('value').then((snapshot) => {

          if (snapshot.exists()) {
            alert('이미 같은 이름이 저장되어 있습니다.');
            createToast("이미 같은 이름이 저장되어 있습니다.");
          } else {
            // 중복된 이름이 없을 때 Firebase Realtime Database에 이름 및 번호 저장
            userRef.push({ name: userName, number: userNumber,  tel: userTel, birthdate: userBDate, gender: userGender });

            const capturePromises = [];

            for(let i = 0; i < picNum; i++){
              const capturePromise = new Promise((resolve, reject) => {

                setTimeout(() => {
                  console.log('사진 촬영' + captureCount);

                  // <canvas> 요소의 2D 그래픽 컨텍스트를 가져와서 context 변수에 저장
                  const canvas = document.createElement('canvas');
                  const context = canvas.getContext('2d');

                  // 사진 사이즈 설정  *****************************************************************************
                  canvas.setAttribute("width", 640);
                  canvas.setAttribute("height", 480);

                  // <video> 요소에서 현재 프레임을 가져와서 <canvas>에 그림
                  // 캡처된 Canvas 이미지를 데이터 URL로 변환
                  context.drawImage(video, 0, 0, canvas.width, canvas.height);
                  const imageDataURL = canvas.toDataURL('image/png');

                  // 고유한 파일명 생성
                  const name = nameInput.value || 'unknown';
                  const fileName = `user.${userNumber}.${captureCount + 1}.png`;

                  // 캡처 카운트 증가
                  captureCount += 1;

                  // Firebase 스토리지의 참조(저장할 위치) 생성 (파일 경로 설정)
                  const storageRef = storage.ref(`signup/user_id.${userNumber}/${fileName}`);

                  // 카운트 다운
                  timer = picNum - captureCount;
                  info.innerText = '잠시만 기다려 주세요 . . . ' + timer;
                  

                  // 이미지 업로드
                  storageRef.putString(imageDataURL, 'data_url').then((snapshot) => {
                    console.log('이미지 업로드 성공:', snapshot);

                    // 업로드된 이미지의 다운로드 URL 가져오기
                    storageRef.getDownloadURL().then((url) => {
                      console.log('다운로드 URL:', url);
                    });

                    console.log('URL 업로드' + captureCount);
                    // 성공 시 resolve 호출
                    resolve();
                    
                    }).catch((error) => {
                        console.error('이미지 업로드 오류:', error);
                    });

                    console.log('사진 업로드', i);

                    // // 성공 시 resolve 호출
                    // resolve();
                  }, i * 1000);
                });
                capturePromises.push(capturePromise);
              }

              // for문 완료 후 실행
              Promise.all(capturePromises)
                .then(() => {
                  console.log('사진 업로드 완료!!!!!!!!');
                  info.innerText = '얼굴 인식 완료';
                  createToast(userName+"님 가입을 환영합니다.");

                  // 회원가입 / 로그인 페이지 구별용 flag 설정 ( 1 -> 회원가입 )
                  firebase.database().ref('flag').set(1)
                    .then(() => {
                      console.log('Flag 값 설정: ', 1);
                      window.location.href = 'index.html';
                    })
                    .catch(error => {
                      console.error('Flag 값 설정 중 오류 발생:', error);
                    });
                })
                .catch(error => {
                  console.error('작업 중 오류 발생:', error);
                });
          }
        });
      });
    });
  
