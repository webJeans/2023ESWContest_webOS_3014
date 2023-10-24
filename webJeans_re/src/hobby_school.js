    // Firebase 구성 객체
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

    // Firebase Realtime Database 참조 생성
    const db = firebase.database();
    const hobbyRef = db.ref('hobby'); // 취미 현장 강의 데이터베이스 참조
    const videoRef = db.ref('video_titles'); // 취미 영상 강의 데이터베이스 참조


    // 리스트에 데이터 추가하는 함수
    function drawList(listId, data) {
      // 데이터를 표시할 목록 요소
      const list = document.getElementById(listId);

      for (const key in data) {
          if (data.hasOwnProperty(key)) {
            const Data = data[key];
            const itemElement = document.createElement('div');
            itemElement.innerHTML = `
              <h4>${Data.title}</h4>
              <p>${Data.class}</p>
            `;
            list.appendChild(itemElement);
          }
      }
    }

    // DOMContentLoaded 이벤트 리스너
    document.addEventListener('DOMContentLoaded', (event) => {

      // hobby 데이터 가져오기
      hobbyRef.once('value', (snapshot) => {
          const hobbyData = snapshot.val();
          console.log(hobbyData);

          // job 데이터 표시
          drawList("lecList", hobbyData);

      }).catch((error) => {
          console.error('Firebase에서 데이터를 읽어오는 중 오류 발생:', error);
      });

      // video 데이터 가져오기
      videoRef.once('value', (snapshot) => {
          const videoData = snapshot.val();
          console.log(videoData);

          // video 데이터 표시
          drawList("videoList", videoData);

      }).catch((error) => {
          console.error('Firebase에서 데이터를 읽어오는 중 오류 발생:', error);
      });

    });
