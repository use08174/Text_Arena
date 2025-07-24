import os
from PIL import Image
import io

def compress_image(image_path, output_path):
    """이미지 압축 후 저장"""
    with open(image_path, "rb") as image_file:
        img = Image.open(image_file)
        img = img.convert("RGB")
        output = io.BytesIO()
        img.save(output, format="JPEG", quality=30)  # quality를 낮춰 압축 비율을 높임
        with open(output_path, 'wb') as f:
            f.write(output.getvalue())  # 압축된 이미지 저장

def compress_images_in_folder(input_folder, output_folder):
    """assets 폴더 내 모든 이미지를 압축"""
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)  # 압축된 이미지를 저장할 폴더가 없으면 생성

    for filename in os.listdir(input_folder):
        # 확장자가 .jpg, .jpeg, .png인 파일들만 처리
        if filename.lower().endswith(('.jpg', '.jpeg', '.png')):
            image_path = os.path.join(input_folder, filename)
            output_path = os.path.join(output_folder, f"{filename}")
            compress_image(image_path, output_path)
            print(f"Compressed: {filename}")

# 사용 예시
input_folder = "../assets"  # 원본 이미지가 들어있는 폴더
output_folder = "compressed_assets"  # 압축된 이미지를 저장할 폴더

compress_images_in_folder(input_folder, output_folder)
