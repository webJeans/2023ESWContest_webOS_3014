import cv2
import firebase_admin
from firebase_admin import credentials, db

# Firebase Admin SDK 초기화
#cred_path = "/home/jeongwon/webos/webjeans-f0f95-firebase-adminsdk-e1kg5-1d4a0f977c.json"
#database_url = 'https://webjeans-f0f95-default-rtdb.firebaseio.com'
#cred = credentials.Certificate(cred_path)
#firebase_admin.initialize_app(cred, {'databaseURL': database_url})

# 이미지 경로 설정 (전역 변수로 선언)
image_path = '/home/jeongwon/webos/firebase_faceid/testset/signin_image_1.png'

def recognize_and_upload_to_firebase():
    # LBPH 얼굴 인식기 초기화 및 학습된 모델 불러오기
    recognizer = cv2.face.LBPHFaceRecognizer_create()
    recognizer.read('/home/jeongwon/webos/firebase_faceid/trainer/trainer.yml')

    # Haar 얼굴 검출기 경로
    cascadePath = "/home/jeongwon/webos/FacialRecognitionProject/haarcascade_frontalface_default.xml"
    faceCascade = cv2.CascadeClassifier(cascadePath)
    font = cv2.FONT_HERSHEY_SIMPLEX

    img = cv2.imread(image_path)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    faces = faceCascade.detectMultiScale(
        gray,
        scaleFactor=1.2,
        minNeighbors=5,
        minSize=(30, 30)
    )

    # 얼굴을 찾지 못한 경우
    if len(faces) == 0:
        # Firebase Realtime Database에 데이터 업로드 (user_id 값을 0으로 설정)
        ref = db.reference('/user_data')
        ref.child('user_id').set({
            'id': 0,
            'confidence': 0
        })
    else:
        for i, (x, y, w, h) in enumerate(faces):
            id, confidence = recognizer.predict(gray[y:y+h, x:x+w])

            # 신뢰도가 100 미만이면 "0"은 완벽한 일치
            if confidence < 100:
                id = id
                confidence = 100 - confidence
            else:
                id = 0
                confidence = 0

            # Firebase Realtime Database에 데이터 업로드
            ref = db.reference('/user_data')  # 데이터베이스 레퍼런스 설정
            ref.child('user_id').set({
                'id': id,
                'confidence': confidence
            })

            cv2.rectangle(img, (x, y), (x + w, y + h), (0, 255, 0), 2)
            cv2.putText(img, f"ID: {id}, Confidence: {confidence}%", (x + 5, y - 5), font, 1, (255, 255, 255), 2)

        cv2.imshow('얼굴 인식', img)
        cv2.waitKey(0)
        cv2.destroyAllWindows()

# 함수 호출
#recognize_and_upload_to_firebase()