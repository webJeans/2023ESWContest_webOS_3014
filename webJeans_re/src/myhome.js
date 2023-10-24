var today = null;
var year = null;
var month = null;
var firstDay = null;
var lastDay = null;
var $tdDay = null;
var $tdSche = null;
var $tdPic = null;
var jsonData = null;

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

// URL에서 쿼리 매개변수 읽어오기
const urlParams = new URLSearchParams(window.location.search);
const user_name = urlParams.get('user_name');


document.getElementById('user-name').textContent = user_name;
// Firebase 초기화
firebase.initializeApp(firebaseConfig);

const db = firebase.database();
const scheduleRef = db.ref('schedules/' + user_name); // 데이터베이스 경로
var userRef = db.ref('users');

const imagesByDate = {};



var storage = firebase.storage();
var storageRef = storage.ref();

function queryUserData(user) {
    userRef.orderByChild("name").equalTo(user).once('value')
        .then(function(snapshot) {
            snapshot.forEach(function(childSnapshot) {
                var data = childSnapshot.val();

                // 생일 정보를 사용하여 나이 계산
                const birthdate = new Date(data.birthdate);
                const today = new Date();
                let age = today.getFullYear() - birthdate.getFullYear();
                if (
                    today.getMonth() < birthdate.getMonth() ||
                    (today.getMonth() === birthdate.getMonth() &&
                    today.getDate() < birthdate.getDate())
                ) {
                    age--;
                }

                //et b_Month = 



                document.getElementById('user-name').textContent = data.name;

                document.getElementById('user-age').textContent = age +' 세';

                document.getElementById('user-bdate').textContent = birthdate.getMonth()+1 +' 월  '+birthdate.getDate()+' 일';

                document.getElementById('user-gender').textContent = data.gender;

                document.getElementById('user-tel').textContent = data.tel;
            });
        })
        .catch(function(error) {
            console.error("데이터 조회 오류:", error);
        });   
}
queryUserData(user_name);

// 스케줄 데이터 가져오기
function setData() {
    return new Promise((resolve, reject) => {
        // 데이터를 가져오는 코드
        scheduleRef.once('value', (snapshot) => {
            jsonData = snapshot.val();
            console.log("setData 실행");
            console.log(jsonData);
            resolve(); // 데이터 가져오기가 완료되면 resolve 호출
        }).catch((error) => {
            console.error('Firebase에서 데이터를 읽어오는 중 오류 발생:', error);
            reject(error); // 오류가 발생하면 reject 호출
        });
    });
}

// 사진 데이터 가져오기
function getAllImagesByDate() {

    // 사용자 폴더 참조
    const userFolderRef = storageRef.child(`calendar_images/${user_name}`);

    return userFolderRef.listAll()
        .then((result) => {
            // 모든 항목을 가져옴
            const promises = result.items.map((imageRef) => {
                // 이미지 URL 가져오기
                return imageRef.getDownloadURL().then((url) => {
                    // 이미지 파일명에서 날짜 정보 추출 (예: "20230924.jpg")
                    const fileName = imageRef.name;
                    const dateMatch = fileName.match(/(\d{4})(\d{2})(\d{2})/);
                    if (dateMatch) {
                        const year = dateMatch[1];
                        const month = dateMatch[2];
                        const day = dateMatch[3].replace(/^0+/, ''); // 앞의 0 제거

                        if (!imagesByDate[year]) {
                            imagesByDate[year] = {};
                        }
                        if (!imagesByDate[year][month]) {
                            imagesByDate[year][month] = {};
                        }

                        // 날짜별 이미지 URL 저장
                        imagesByDate[year][month][day] = url;
                    }
                });
            });
            console.log(imagesByDate);
            return Promise.all(promises).then(() => imagesByDate);
        });
}
    
$(document).ready(function() {
    drawCalendar();
    initDate();
    drawDays();

    $("#movePrevMonth").on("click", function(){movePrevMonth();});
    $("#moveNextMonth").on("click", function(){moveNextMonth();});

    // 스케줄 데이터를 불러온 후에 drawPic() 호출
    getAllImagesByDate().then(() => {
        console.log("사진 그리기")
        drawPic();
    });
    // 스케줄 데이터를 불러온 후에 drawSche() 호출
    setData().then(() => {
        console.log("스케줄 그리기")
        drawSche();
    });
});

// 달력 컨테이너와 이전/다음 달 버튼
const calendarContainer = document.getElementById("calendar");
const prevMonthBtn = document.getElementById("prevMonthBtn");
const nextMonthBtn = document.getElementById("nextMonthBtn");

//Calendar 그리기
function drawCalendar(){
    var setTableHTML = "";  // setTableHTML 변수는 달력의 HTML 템플릿을 저장하기 위한 문자열
    setTableHTML+='<table class="calendar">';  // CSS 클래스를 지정

        // 요일 헤더 행(<tr>)을 추가합니다. 일요일(SUN)부터 토요일(SAT)까지의 요일을 나타내는 <th> 요소들을 생성
    setTableHTML+='<tr style="font-size:30px; height: 60px; border-bottom: 5px solid black">  <th>일</th><th>월</th><th>화</th><th>수</th><th>목</th><th>금</th><th>토</th>  </tr>';
    
    // 6개의 주를 반복하면서 각 주에 해당하는 <tr> 요소를 추가합니다. <tr height="100">를 사용하여 각 주의 높이를 설정합니다.
    for(var i=0;i<6;i++){
        setTableHTML+='<tr height="90" class="square">';
            // 각 주에서 7일(요일)을 반복하면서 날짜 칸(<td>)을 추가
            // 각 날짜 칸 안에는 두 개의 <div> 요소가 포함
        for(var j=0;j<7;j++){
                // style -> 텍스트가 한 줄로 표시되도록 설정, 텍스트가 요소를 넘어갈 때 숨김 처리, 텍스트를 "..."으로 대체
            setTableHTML+='<td>';

                // 날짜를 표시하는 <div class="cal-day">
            setTableHTML+='    <div class="cal-day"></div>';

                // 사진을 표시하는 <div class="cal_picture">
            setTableHTML+='    <div class="cal_picture"></div>';

                // 일정을 표시하는 <div class="cal-schedule">
            setTableHTML+='    <div class="cal-schedule"></div>';
            
            setTableHTML+='</td>';
        }
        setTableHTML+='</tr>';
    }
    setTableHTML+='</table>';
    // 닫는 태그로 <td>, <tr>, <table>을 순서대로 닫아서 테이블을 완성

    // setTableHTML 문자열을 가지고 있는 HTML 코드를 id가 "cal_tab"인 요소에 삽입합니다. 이렇게 하면 달력이 표시됩니다.
    $("#cal_tab").html(setTableHTML);
}

//날짜 초기화
function initDate(){
    $tdDay = $("td div.cal-day")
    $tdPic = $("td div.cal_picture")
    $tdSche = $("td div.cal-schedule")
    dayCount = 0;
    today = new Date();
    year = today.getFullYear();
    month = today.getMonth()+1;
    if(month < 10){month = "0"+month;}
    firstDay = new Date(year,month-1,1);
    lastDay = new Date(year,month,0);
}

//calendar 날짜표시
function drawDays(){
    document.getElementById("currentMonth").textContent = `${year}년 ${month}월`;

    for(var i=firstDay.getDay();i<firstDay.getDay()+lastDay.getDate();i++){
        $tdDay.eq(i).text(++dayCount);

        // Add a class to today's date
        if (year == today.getFullYear() && month == today.getMonth() + 1 && dayCount == today.getDate()) {
            $tdDay.eq(i).addClass('today');
        }
    }
    for(var i=0;i<42;i+=7){
        $tdDay.eq(i).css("color","red");
    }
    for(var i=6;i<42;i+=7){
        $tdDay.eq(i).css("color","blue");
    }

    // Add click event to today's date
    $(".today").click(function() {
        // Remove red border from other cells
        $(".today").removeClass('today');
        // Add red border to the clicked cell
        $(this).addClass('today');
    });
}

//calendar 월 이동
function movePrevMonth(){
    month--;
    if(month<=0){
        month=12;
        year--;
    }
    if(month<10){
        month=String("0"+month);
    }
    getNewInfo();
    }

function moveNextMonth(){
    month++;
    if(month>12){
        month=1;
        year++;
    }
    if(month<10){
        month=String("0"+month);
    }
    getNewInfo();
}

//정보갱신
function getNewInfo(){
    for(var i=0;i<42;i++){
        $tdDay.eq(i).text("");
        $tdPic.eq(i).text("");
        $tdSche.eq(i).text("");
        $tdDay.eq(i).removeClass('today');  // Remove the 'today' class
    }
    dayCount=0;
    firstDay = new Date(year,month-1,1);
    lastDay = new Date(year,month,0);
    drawDays();
    drawPic();
    drawSche();
}

// 사진 그리기
function drawPic() {
    for (var i = firstDay.getDay(); i < firstDay.getDay() + lastDay.getDate(); i++) {
        var dateMatch = i - firstDay.getDay() + 1;
        var dateStr = year + "-" + month + "-" + dateMatch;

        // 이미지 매핑에서 해당 날짜의 이미지 경로 가져오기
        var imageSrc = imagesByDate[year] && imagesByDate[year][month] && imagesByDate[year][month][dateMatch];

        if (imageSrc) {
            // 이미지가 있는 경우, 배경 이미지로 설정
            $tdPic.eq(i).css('background-image', 'url(' + imageSrc + ')');
            $tdPic.eq(i).text(''); // 텍스트 내용 지우기
        } else {
            // 이미지가 없는 경우, 배경 이미지 초기화
            $tdPic.eq(i).css('background-image', 'none');
            $tdPic.eq(i).text(''); // 텍스트 내용 지우기
        }
    }

    // 이전 달의 이미지 초기화
    for (var i = 0; i < firstDay.getDay(); i++) {
        $tdPic.eq(i).css('background-image', 'none');
        $tdPic.eq(i).text(''); // 텍스트 내용 지우기
    }
    // 다음 달의 이미지 초기화
    for (var i = firstDay.getDay() + lastDay.getDate(); i < 42; i++) {
        $tdPic.eq(i).css('background-image', 'none');
        $tdPic.eq(i).text(''); // 텍스트 내용 지우기
    }
}

//스케줄 그리기
function drawSche(){
    setData();
    var dateMatch = null;  // 변수 dateMatch 초기화

    for(var i=firstDay.getDay();i<firstDay.getDay()+lastDay.getDate();i++){
        var txt = "";

        txt =jsonData[year];
        if(txt){
            txt = jsonData[year][month];
            if(txt){
                txt = jsonData[year][month][i];
                dateMatch = firstDay.getDay() + i - 1; 
                $tdSche.eq(dateMatch).text(txt);
            }
        }
    }
}

// 이벤트와 이미지 컨테이너를 번갈아가며 표시하는 함수
function toggleContainers(showEvents) {
    if (showEvents) {
        console.log("일정")
        $(".cal-schedule").show();
        $(".cal_picture").hide();
    } else {
        console.log("사진")
        $(".cal-schedule").hide();
        $(".cal_picture").show();
    }
}

// 버튼 클릭 이벤트 핸들러
$("#pic-sch").click(function() {
    // 현재 상태를 확인하여 반대로 변경
    var eventContainerIsVisible = $(".cal-schedule").is(":visible");
    toggleContainers(!eventContainerIsVisible);
});

// 일정 추가
document.getElementById('schedule').addEventListener('submit', function (e) {
    e.preventDefault();
    
    const dateInput = new Date(document.getElementById('sch_date').value);

    const sch_year = dateInput.getFullYear();
    const sch_month = dateInput.getMonth()+1;
    const sch_day = dateInput.getDate();
    console.log(sch_year);
    console.log(sch_month);
    console.log(sch_day);

    const event = document.getElementById('event').value;

    const monthStr = (sch_month < 10) ? '0' + sch_month : '' + sch_month;

    // Firestore에 연도별로 그룹화된 컬렉션 내에 일정 추가
    const scheduleRef = db.ref('schedules').child(user_name).child(sch_year).child(monthStr).child(sch_day);
    scheduleRef.set(event)
        .then(() => {
            alert('일정이 추가되었습니다.');
            // 추가한 일정을 즉시 화면에 표시
            const dateMatch = firstDay.getDay() + parseInt(sch_day, 10) - 1;

            // 정확한 월에 해당하는 경우에만 일정을 표시
            if (year == sch_year && month == sch_month) {
                $tdSche.eq(dateMatch).text(event);
            }
            setData().then(() => {
                console.log("스케줄 그리기")
                drawSche();
            });
            
        })
        .catch((error) => {
            console.error('일정 추가 중 오류:', error);
        });

    // 양식 초기화
    document.getElementById('sch_date').value = '';
    document.getElementById('event').value = '';
});