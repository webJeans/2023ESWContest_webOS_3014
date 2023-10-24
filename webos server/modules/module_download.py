import os
from firebase_admin import credentials, storage, initialize_app

def download_latest_files():
    bucket_name = 'webjeans-f0f95.appspot.com'
    folder_path = 'signup/'  # 다운로드할 폴더 경로
    local_dir = '/home/jeongwon/webos/firebase_faceid/fbdataset/'  # 로컬 다운로드 경로

    # Firebase Admin SDK 초기화
    #cred = credentials.Certificate("/home/jeongwon/webos/webjeans-f0f95-firebase-adminsdk-e1kg5-1d4a0f977c.json")
    #initialize_app(cred, {'storageBucket': bucket_name})

    storage_client = storage.bucket(bucket_name)
    blobs = storage_client.list_blobs(prefix=folder_path)

    latest_newnumber = 1

    # Find the latest newnumber
    for blob in blobs:
        if "/" in blob.name[len(folder_path):]:
            parts = blob.name.split("/")
            if len(parts) >= 3:
                # Extracting newnumber from the correct position
                newnumber = int(parts[1].split('.')[1])
                latest_newnumber = max(latest_newnumber, newnumber)

    # Download files from the latest newnumber folder
    latest_folder_path = f"{folder_path}user_id.{latest_newnumber}/"
    blobs = storage_client.list_blobs(prefix=latest_folder_path)

    for blob in blobs:
        if not blob.name.endswith("/"):  # Exclude folders
            local_path = os.path.join(local_dir, os.path.basename(blob.name))
            blob.download_to_filename(local_path)
            print(f'Downloaded: {blob.name} to {local_path}')

#if __name__ == "__main__":
#download_latest_files()