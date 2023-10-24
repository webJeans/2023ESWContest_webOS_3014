import cv2
import numpy as np
from PIL import Image
import os

def train_face_recognition_model():
    # 데이터셋 경로
    path = '/home/jeongwon/webos/firebase_faceid/dataset_test/'

    # LBPH 얼굴 인식기와 얼굴 검출기 초기화
    recognizer = cv2.face.LBPHFaceRecognizer_create()
    detector = cv2.CascadeClassifier('/home/jeongwon/webos/FacialRecognitionProject/haarcascade_frontalface_default.xml')

    def getImagesAndLabels(path):
        imagePaths = [os.path.join(path, f) for f in os.listdir(path)]
        faceSamples = []
        ids = []

        for imagePath in imagePaths:
            PIL_img = Image.open(imagePath).convert('L')
            img_numpy = np.array(PIL_img, 'uint8')
            id = int(os.path.split(imagePath)[-1].split(".")[1])
            faces = detector.detectMultiScale(img_numpy)

            for (x, y, w, h) in faces:
                faceSamples.append(img_numpy[y:y + h, x:x + w])
                ids.append(id)

        return faceSamples, ids

    print("\n[INFO] 얼굴 학습 중. 잠시 기다려주세요...")
    faces, ids = getImagesAndLabels(path)
    recognizer.train(faces, np.array(ids))

    # 학습된 모델 저장
    recognizer.write('/home/jeongwon/webos/firebase_faceid/trainer/trainer.yml')

    print("\n{0} 얼굴 학습 완료. 프로그램을 종료합니다.".format(len(np.unique(ids))))

# 함수 호출
#train_face_recognition_model()