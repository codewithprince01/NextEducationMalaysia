import os
import shutil

BASE_DIR = r'd:\NEXT\NextEducationMalaysia\src\app\api\v1'

DUPLICATES = [
    'banners/%5Bpage%5D',
    'course-category/%5Bslug%5D',
    'faqs/%5Bslug%5D',
    'university-details/%5Buname%5D',
    'university-gallery/%5Buname%5D',
    'university-overview/%5Buname%5D',
    'university-ranking/%5Buname%5D',
    'university-reviews/%5Buname%5D',
    'university-videos/%5Buname%5D'
]

def cleanup():
    for dup in DUPLICATES:
        full_path = os.path.join(BASE_DIR, dup.replace('/', os.sep))
        if os.path.exists(full_path):
            print(f"Deleting duplicate: {full_path}")
            shutil.rmtree(full_path)
        else:
            print(f"Not found: {full_path}")

if __name__ == "__main__":
    cleanup()
