import cv2
import os

def extract_faces_and_save():
    # 얼굴 감지에 사용할 Haar Cascade 분류기를 불러옵니다.
    face_cascade = cv2.CascadeClassifier('/home/jeongwon/webos/FacialRecognitionProject/haarcascade_frontalface_default.xml')

    # 입력 폴더와 출력 폴더 지정
    input_folder = '/home/jeongwon/webos/firebase_faceid/fbdataset'  # 입력 이미지 폴더
    output_folder = '/home/jeongwon/webos/firebase_faceid/dataset_test'  # 얼굴이 감지된 이미지를 저장할 폴더

    # 결과를 저장할 폴더가 없으면 생성
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    # 입력 폴더의 이미지들을 읽어들여 얼굴을 감지하고 저장
    for count, filename in enumerate(os.listdir(input_folder), start=1):
        if filename.endswith(('png', 'jpg', 'jpeg')):
            input_path = os.path.join(input_folder, filename)
            output_path = os.path.join(output_folder, filename)  # 원본 파일 이름 사용

            # 이미지를 불러옵니다.
            image = cv2.imread(input_path)

            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

            # 얼굴을 감지합니다.
            faces = face_cascade.detectMultiScale(gray, scaleFactor=1.3, minNeighbors=5, minSize=(30, 30))

            # 감지된 얼굴 주위에 사각형을 그리고 저장
            for (x, y, w, h) in faces:
                cv2.rectangle(image, (x, y), (x+w, y+h), (255, 0, 0), 2)
                face_img = image[y:y+h, x:x+w]
                cv2.imwrite(output_path, face_img)

    # 감지된 얼굴 이미지를 출력 폴더에 저장
    print('얼굴 감지 및 저장이 완료되었습니다.')

# 함수 호출
#extract_faces_and_save()