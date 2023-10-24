// 서버에서 돌릴, api들 받아와서 fb에 올리는 js파일
const admin = require('firebase-admin');
const serviceAccount = require('./webjeans-f0f95-firebase-adminsdk-e1kg5-1d4a0f977c.json'); // 서비스 계정 키 경로

// Firebase Admin SDK 초기화
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://webjeans-f0f95-default-rtdb.firebaseio.com/' // Firebase 프로젝트의 데이터베이스 URL
});
const axios = require('axios');
const db = admin.database();

// Firebase Realtime Database의 참조 설정
const jobTitlesRef = db.ref('job_titles');
const WeatherRef = db.ref('weather');
const HobbyRef = db.ref('hobby');

// OpenWeather API 키
const apiKey = '5224641ff185d45d2dc0aa329ef4acf2';

// 일자리 업데이트 함수
function updateJobTitles() {
  const job_url = 'http://openapi.seoul.go.kr:8088/6f4c5564757370633834794374716f/json/GetJobInfo/1/10///J01300';

  axios.get(job_url)
    .then(function (response) {
      // 10개의 일자리 정보 배열을 가져와 Firebase에 업로드
      const jobInfoArray = response.data.GetJobInfo.row;

      // 이전 일자리 정보 모두 삭제
      jobTitlesRef.remove()
        .then(() => {
          console.log('이전 일자리 정보 삭제 완료');
        });

      for (const job of jobInfoArray) {
        const jobTitle = job.JO_SJ; // JO_SJ 필드 추출
        const jobContents = job.GUI_LN; // GUI_LN 필드 추출

        // Firebase에 데이터 업로드
        jobTitlesRef.push({ title: jobTitle, contents: jobContents })
        .catch((error) => {
          console.error(`Firebase에 데이터를 업로드하는 중 오류 발생: ${error}`);
        });
      }
    })
    .catch(function (error) {
      // 요청이 실패한 경우
      console.error('Error:', error);
    });
}

// 날씨 업데이트 함수
function updateWeather() {
    const city = 'Seoul'; // 원하는 도시 이름으로 변경 가능
    const weather_url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=kr`;
  
    fetch(weather_url)
      .then(response => response.json())
      .then(data => {
        // 날씨 정보 업데이트
        console.log('도시:', data.name);
        console.log('온도:', data.main.temp);
        console.log('날씨:', data.weather[0].description);

        // Firebase에 날씨 정보 업로드
        const weatherData = {
            city: data.name,
            temperature: data.main.temp,
            description: data.weather[0].description
        };
        // 이미 존재하는 위치에 데이터 업데이트 (set으로)
        WeatherRef.set(weatherData); // 기존 데이터를 덮어씁니다.
      })
      .catch(error => console.error('날씨 정보를 가져오는 동안 오류 발생:', error));
    }

// 취미교실 업데이트 함수
function updateHobby() {
    const hobby_url = 'http://openapi.seoul.go.kr:8088/6f4c5564757370633834794374716f/json/GbElderlyClassroom/1/10/';
  
    axios.get(hobby_url)
      .then(function (response) {
        // 10개의 취미교실 정보 배열을 가져와 Firebase에 업로드
        const hobbyInfoArray = response.data.GbElderlyClassroom.row;
  
        // 이전 일자리 정보 모두 삭제
        HobbyRef.remove()
          .then(() => {
            console.log('이전 취미 정보 삭제 완료');
          });
  
        for (const hobby of hobbyInfoArray) {
          const hobbyTitles = hobby.COURSE;
          const hobbyClass = hobby.ELDERLY_CLASSROOM_NM;
  
          // Firebase에 데이터 업로드
          HobbyRef.push({ title: hobbyTitles, class: hobbyClass })
          .catch((error) => {
            console.error(`Firebase에 데이터를 업로드하는 중 오류 발생: ${error}`);
          });
        }
      })
      .catch(function (error) {
        // 요청이 실패한 경우
        console.error('Error:', error);
      });
  }

// 주기적으로 업데이트 함수 호출 (10초마다)
const job_interval = 10000;
setInterval(updateJobTitles, job_interval);

// 주기적으로 업데이트 함수 호출 (5초마다)
const weather_interval = 5000;
setInterval(updateWeather, weather_interval);

// 주기적으로 업데이트 함수 호출 (초마다)
const hobby_interval = 5000;
setInterval(updateHobby, hobby_interval);
