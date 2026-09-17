import multer from "multer";
import path from "path";
import fs from "fs";


const uploadDirectory = "uploads/";


if (
  !fs.existsSync(uploadDirectory)
) {
  fs.mkdirSync(
    uploadDirectory,
    {
      recursive: true,
    }
  );
}


// ================= STORAGE =================

const storage =
  multer.diskStorage({

    destination: function (
      req,
      file,
      cb
    ) {

      cb(
        null,
        uploadDirectory
      );
    },


    filename: function (
      req,
      file,
      cb
    ) {

      const uniqueName =
        Date.now() +
        "-" +
        Math.round(
          Math.random() * 1e9
        ) +
        path.extname(
          file.originalname
        );


      cb(
        null,
        uniqueName
      );
    },
  });


// ================= FILE FILTER =================

const fileFilter = (
  req,
  file,
  cb
) => {

  const allowedTypes = [
    "application/pdf",
  ];


  if (
    allowedTypes.includes(
      file.mimetype
    )
  ) {

    cb(
      null,
      true
    );

  } else {

    cb(
      new Error(
        "Only PDF quotation files are allowed"
      ),
      false
    );
  }
};


// ================= MULTER =================

const upload =
  multer({

    storage,

    fileFilter,

    limits: {
      fileSize:
        10 * 1024 * 1024,
    },
  });


export {
  upload,
};