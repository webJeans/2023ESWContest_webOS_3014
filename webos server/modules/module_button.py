import RPi.GPIO as GPIO
import time
import firebase_admin
from firebase_admin import credentials, db

def setup_button_listener():
    # Firebase Admin SDK 초기화
    cred_path = "/home/jeongwon/webos/webjeans-f0f95-firebase-adminsdk-e1kg5-1d4a0f977c.json"
    database_url = "https://webjeans-f0f95-default-rtdb.firebaseio.com"
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred, {'databaseURL': database_url})

    # GPIO 핀 번호 설정
    BUTTON_PIN_16 = 16
    BUTTON_PIN_26 = 26
    BUTTON_PIN_6 = 6

    # GPIO 초기화
    GPIO.setmode(GPIO.BCM)
    GPIO.setup(BUTTON_PIN_16, GPIO.IN, pull_up_down=GPIO.PUD_UP)
    GPIO.setup(BUTTON_PIN_26, GPIO.IN, pull_up_down=GPIO.PUD_UP)
    GPIO.setup(BUTTON_PIN_6, GPIO.IN, pull_up_down=GPIO.PUD_UP)

    # Firebase Realtime Database 레퍼런스
    ref = db.reference('/mode')

    # 버튼 누름 감지 및 Firebase 업로드 함수
    def button_pressed_callback(channel):
        mode = 0
        if channel == BUTTON_PIN_16:
            mode = 1
        elif channel == BUTTON_PIN_26:
            mode = 2
        elif channel == BUTTON_PIN_6:
            mode = 3

        ref.set(mode)

    # GPIO 핀에 대한 이벤트 핸들러 등록
    GPIO.add_event_detect(BUTTON_PIN_16, GPIO.FALLING, callback=button_pressed_callback, bouncetime=200)
    GPIO.add_event_detect(BUTTON_PIN_26, GPIO.FALLING, callback=button_pressed_callback, bouncetime=200)
    GPIO.add_event_detect(BUTTON_PIN_6, GPIO.FALLING, callback=button_pressed_callback, bouncetime=200)

    try:
        while True:
            # 프로그램 계속 실행
            time.sleep(0.1)

    except KeyboardInterrupt:
        pass

    # GPIO 정리
    GPIO.cleanup()

# 함수 호출
setup_button_listener()