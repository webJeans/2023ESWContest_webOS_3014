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

firebase.initializeApp(firebaseConfig);

var database = firebase.database();
const userRef = database.ref('users');

// URL에서 쿼리 매개변수 읽어오기
const urlParams = new URLSearchParams(window.location.search);
const user_name = urlParams.get('user_name');

// 사용자 식별 (예: 사용자 이름)
const userId = user_name;

// 상대방 사용자 ID (예: 상대방 이름)
let otherUserId = null;

// 현재 활성화된 채팅 경로
let activeChatPath = null;

var chatRef = null;

//--------------------------------------------- 친구 목록 ---------------------------------------------

// 리스트에 데이터 추가하는 함수
function drawList(listId, data){
  const list = document.getElementById(listId);

  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      const Data = data[key];
      // 새로운 <div> 요소 생성
      const itemElement = document.createElement("div");

      // 생일 정보를 사용하여 나이 계산
      const birthdate = new Date(Data.birthdate);
      const today = new Date();
      let age = today.getFullYear() - birthdate.getFullYear();
      if (
        today.getMonth() < birthdate.getMonth() ||
        (today.getMonth() === birthdate.getMonth() &&
          today.getDate() < birthdate.getDate())
      ) {
        age--;
      }

      itemElement.innerHTML = `
        <h4>${Data.name}</h4>
        <p>${age}세/${Data.gender}</p>
      `;
      list.appendChild(itemElement);

      // div 요소에 onclick 이벤트 핸들러를 추가
      itemElement.onclick = function() {
        // 클릭했을 때 실행할 코드를 여기에 작성
        otherUserId = itemElement.querySelector('h4').textContent;
        const chatPath = (userId < otherUserId) ? `${userId}-${otherUserId}` : `${otherUserId}-${userId}`;
        activateChat(chatPath);
      };
    }
  }
}

// DOMContentLoaded 이벤트 리스너
document.addEventListener('DOMContentLoaded', (event) => {
  // userlist 데이터 가져오기
  userRef.once('value', (snapshot) => {
    const userData = snapshot.val();
    const chat_title = document.getElementById('chat_title');
    console.log(userData);

    drawList("friendList", userData);
    // 친구 목록을 클릭하여 해당 채팅을 활성화
    const friendElements = document.querySelectorAll('#friendList div');
    friendElements.forEach((friendElement) => {
      friendElement.addEventListener('click', (event) => {
        openChat(friendElement.querySelector('h4').textContent);
        console.log("이벤트 리스너" + friendElement.querySelector('h4').textContent );
        chat_title.innerText = friendElement.querySelector('h4').textContent + ' 님과의 대화';
      });
    });
  }).catch((error) => {
    console.error('Firebase에서 데이터를 읽어오는 중 오류 발생:', error);
  });
});

//--------------------------------------------- 채팅 ---------------------------------------------
function sendMessage() {
  const message = document.getElementById('message').value;

  // 메시지를 "chats" 아래의 특정 경로에 저장
  const chatPath = (userId < otherUserId) ? `${userId}-${otherUserId}` : `${otherUserId}-${userId}`;
  const chatRef = database.ref(`chats/${chatPath}`);
  chatRef.push({
    userId: userId,
    message: message
  });
  document.getElementById('message').value = '';
}

// Enter 키 이벤트를 처리하여 sendMessage 함수 호출
function handleKeyPress(event) {
  if (event.key === 'Enter') {
    sendMessage();
  }
}

// 친구 목록을 클릭했을 때 채팅을 활성화하고 표시하는 함수
function activateChat(chatPath) {
  if (chatRef) {
    // 기존의 이벤트 리스너 제거
    chatRef.off('child_added');
  }
  activeChatPath = chatPath;
  const chatDiv = document.getElementById('chat');
  chatDiv.innerHTML = ''; // 이전 채팅 내용 초기화

  // 선택된 채팅 경로의 메시지를 표시
  chatRef = database.ref(`chats/${chatPath}`);
  chatRef.on('child_added', snapshot => {
    const messageData = snapshot.val();
    const message = messageData.message;
    const sender = messageData.userId;

    const chatContainer = document.createElement('div');
    chatContainer.className = 'chat_container';

    const messageElement = document.createElement('div');

    if (sender === userId) {
      messageElement.className = 'sent-message';
    } else {
      messageElement.className = 'received-message';
    }
    messageElement.textContent = `${message}`;
    //messageElement.textContent = `${sender}: ${message}`;
    console.log("채팅");

    chatContainer.appendChild(messageElement);
    chatDiv.appendChild(chatContainer);

    // 스크롤을 항상 맨 아래로 이동
    chatDiv.scrollTop = chatDiv.scrollHeight;
  }); 
}

// 친구 목록을 클릭했을 때 해당 채팅을 활성화
function openChat(friendName) {
  if (friendName !== user_name) {
    // 대화 상대가 자신이 아닌 경우에만 채팅 활성화
    const chatPath = (userId < friendName) ? `${userId}-${friendName}` : `${friendName}-${userId}`;
    activateChat(chatPath);
  }
}