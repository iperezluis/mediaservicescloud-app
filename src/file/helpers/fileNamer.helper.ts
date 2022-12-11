import { v4 as uuid } from 'uuid';

export const fileNamer = (
  req: Express.Request,
  file: Express.Multer.File,
  callback: Function,
) => {
  // console.log(file);
  if (!file) return callback(new Error(`File is empty`), false);
  const fileExtension = file.mimetype.split('/')[1];
  console.log(file);
  // if (!req.file) return;
  const fileName = `${file.originalname}`;
  // const fileName = `${uuid()}.${fileExtension}`;
  // const fileName = `${file.filename}.${fileExtension}`;

  callback(null, fileName);
};
