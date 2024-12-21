import fs from 'fs';
import path from 'path';

const unlinkFile = (file: string) => {
  const filePath = path.join('uploads', file); // it make path design for cros-platform when is needed like windows(file\\file.png) or linux(file/file.png)
  
  if (fs.existsSync(filePath)) {
    // remove file from uploads folder if this file(if same file store in DB) exist
    fs.unlinkSync(filePath);
  }
};

export default unlinkFile;
