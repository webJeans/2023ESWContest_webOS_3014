#module test
import time

from module_download import download_latest_files
from module_extract import extract_faces_and_save
from module_train import train_face_recognition_model
from module_recog import recognize_and_upload_to_firebase
from module_login_download import download_folder
#from module_button import setup_button_listener
import firebase_admin
from firebase_admin import credentials, db


# Firebase 초기화
cred = credentials.Certificate('/home/jeongwon/webos/webjeans-f0f95-firebase-adminsdk-e1kg5-1d4a0f977c.json')
firebase_admin.initialize_app(cred, {'databaseURL': 'https://webjeans-f0f95-default-rtdb.firebaseio.com/'})

ref = db.reference('flag')

while True:
    #setup_button_listener()
    flag = ref.get()
    print('현재 flag 값:', flag)
    # flag 값에 따른 작업 수행
    if flag == 1:
        print('회원가입 버튼이 클릭되었습니다.')
        time.sleep(2)
        download_latest_files()
        extract_faces_and_save()
        train_face_recognition_model()
        print("새로운 사용자 얼굴 학습 완료")
        ref.set(0)  # flag 값을 0으로 변경
    elif flag == 2:
        print('로그인 버튼이 클릭되었습니다.')
        time.sleep(2)
        download_folder()
        recognize_and_upload_to_firebase()
        print("로그인 시도")
        ref.set(0)  # flag 값을 0으로 변경

    time.sleep(1)
