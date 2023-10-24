# 이거 로그인하면 사진 한 장 받아오기

import os
import firebase_admin
from firebase_admin import credentials, storage

# Firebase Admin SDK 초기화
#cred = credentials.Certificate("/home/jeongwon/webos/webjeans-f0f95-firebase-adminsdk-e1kg5-1d4a0f977c.json")
#firebase_admin.initialize_app(cred, {'storageBucket': 'webjeans-f0f95.appspot.com'})

def download_folder():
    bucket_name = 'webjeans-f0f95.appspot.com'
    folder_path = 'testset/'  # 다운로드할 폴더 경로
    local_dir = '/home/jeongwon/webos/firebase_faceid/testset/'  # 로컬 다운로드 경로

    storage_client = storage.bucket(bucket_name)
    bucket = storage_client

    blobs = bucket.list_blobs(prefix=folder_path)  # 해당 폴더의 모든 파일 및 하위 폴더를 가져옵니다.

    for blob in blobs:
        if "/" in blob.name[len(folder_path):]:
            # 하위 폴더일 경우 해당 폴더를 생성하고 재귀적으로 다운로드합니다.
            subfolder = os.path.join(local_dir, blob.name[len(folder_path):])
            os.makedirs(subfolder, exist_ok=True)
            download_folder(bucket, blob.name, subfolder)
        else:
            # 파일일 경우 다운로드합니다.
            local_path = os.path.join(local_dir, blob.name[len(folder_path):])
            blob.download_to_filename(local_path)
            print(f'다운로드 완료: {local_path}')

#if __name__ == "__main__":
#    download_folder()