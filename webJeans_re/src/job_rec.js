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

// Firebase 초기화
firebase.initializeApp(firebaseConfig);

// URL에서 쿼리 매개변수 읽어오기
const urlParams = new URLSearchParams(window.location.search);
const user_name = urlParams.get('user_name');

// Firebase Realtime Database 참조 생성
const db = firebase.database();
const jobRef = db.ref('job_titles');     // 일자리 데이터베이스 참조
const vlntrRef = db.ref('vlntr_titles'); // 일자리 데이터베이스 참조


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
            <p>${Data.contents}</p>
            `;
            list.appendChild(itemElement);
        }
    }
}

  // DOMContentLoaded 이벤트 리스너
    document.addEventListener('DOMContentLoaded', (event) => {

    // job 데이터 가져오기
    jobRef.once('value', (snapshot) => {
        const jobData = snapshot.val();

        // job 데이터 표시
        drawList("jobList", jobData);

    }).catch((error) => {
        console.error('Firebase에서 데이터를 읽어오는 중 오류 발생:', error);
    });

    // vlntr 데이터 가져오기
    vlntrRef.once('value', (snapshot) => {
        const vlntrData = snapshot.val();

        // vlntr 데이터 표시
        drawList("vlntrList", vlntrData);

    }).catch((error) => {
        console.error('Firebase에서 데이터를 읽어오는 중 오류 발생:', error);
    });
    //drawList("vlntrList", vlntrData);
});
