import os
import zipfile

def create_project_zip():
    zip_path = 'public/kampot-harvest-project.zip'
    if os.path.exists(zip_path):
        os.remove(zip_path)

    exclude_dirs = {
        'node_modules',
        '.playwright-cli',
        '.git',
        'dist',
        '.aistudio',
        '.cache',
        'tmp'
    }

    exclude_files = {
        'kampot-harvest-project.zip',
        '.DS_Store'
    }

    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
        for root, dirs, files in os.walk('.'):
            # Modify dirs in-place to skip excluded directories
            dirs[:] = [d for d in dirs if d not in exclude_dirs and not d.startswith('.')]
            
            for f in files:
                if f in exclude_files or f.endswith('.pyc'):
                    continue
                file_path = os.path.join(root, f)
                # Archive name should be relative to project root
                arcname = os.path.relpath(file_path, '.')
                if arcname.startswith('public/kampot-harvest-project.zip'):
                    continue
                zf.write(file_path, arcname)

    size_mb = os.path.getsize(zip_path) / (1024 * 1024)
    print(f"Created {zip_path} ({size_mb:.2f} MB)")

if __name__ == '__main__':
    create_project_zip()
