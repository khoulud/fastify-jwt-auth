const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const fileUpload = require("express-fileupload");

const PORT = process.env.PORT || 5500;
const jwtSecret = "5d8bae78-baef-4bf1-9250-5fdfaf5192b0";

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/profile-pics", express.static(path.join(__dirname, "profile-pics")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post("/login", (req, reply) => {
  let data = req.body;
  let username = data.email;
  let password = data.password;

  getUserData(username, password)
    .then((result) => {
      if (result.length > 0) {
        jwt.sign(
          { user: result[0].user },
          jwtSecret,
          { expiresIn: 60 * 60 },
          (err, token) => {
            reply.status(200).send({
              msg: "auth success",
              token: token,
              user: result[0].user,
              roles: result[0].roles,
              img: result[0].img,
              fullname: result[0].fullname,
            });
          }
        );
      } else {
        reply.status(305).send({ msg: "bad credentials" });
      }
    })
    .catch((err) => {
      reply.status(500).send({ msg: "an error occured" });
    });
});

// app.post("/register", (req, reply) => {
//   let data = req.body;
//   let fullname = data.fullName;
//   let user = data.email;
//   let password = data.password;
//   if (fullname != "" && user != "" && password != "") {
//     users.push({
//       fullname: fullname,
//       user: user,
//       password: password,
//     });
//     reply.status(200).send({ msg: "Account registered successfully" });
//   } else {
//     reply.status(305).send({ msg: "bad credentials" });
//   }
// });

app.get("/api/data", (req, reply) => {
  let jwtHeader = req.headers.authorization;
  let token =
    jwtHeader != [] &&
    jwtHeader != null &&
    jwtHeader != undefined &&
    jwtHeader != ""
      ? jwtHeader.split(" ")[1]
      : false;
  console.log(token);
  if (!token) {
    reply.status(401).send({ msg: "missing token" });
  } else {
    jwt.verify(token, jwtSecret, (err, decoded) => {
      if (err) {
        reply.status(401).send({ msg: "missing token" });
      } else {
        fs.readFile(
          path.join(__dirname, "data.json"),
          { encoding: "utf-8" },
          (err, res) => {
            if (err) {
              reply.send({ msg: "can't get data" });
            } else {
              reply.send({ data: JSON.parse(res) });
            }
          }
        );
      }
    });
  }
});

app.get("/api/liste/demandes", (req, reply) => {
  let jwtHeader = req.headers.authorization;
  let token =
    jwtHeader != [] &&
    jwtHeader != null &&
    jwtHeader != undefined &&
    jwtHeader != ""
      ? jwtHeader.split(" ")[1]
      : false;
  console.log(token);
  if (!token) {
    reply.status(401).send({ msg: "missing token" });
  } else {
    jwt.verify(token, jwtSecret, (err, decoded) => {
      if (err) {
        reply.status(401).send({ msg: "missing token" });
      } else {
        fs.readFile(
          path.join(__dirname, "listeDemandesExpo.json"),
          { encoding: "utf-8" },
          (err, res) => {
            if (err) {
              reply.send({ msg: "can't get data" });
            } else {
              reply.send({ data: JSON.parse(res) });
            }
          }
        );
      }
    });
  }
});

app.listen(PORT, () => {
  console.log("listening on " + PORT);
});

const getUserData = (login, pwd) => {
  return new Promise((resolve, reject) => {
    fs.readFile(
      path.join(__dirname, "users.json"),
      { encoding: "utf-8" },
      (err, res) => {
        if (err) {
          reject(err);
        } else {
          let users = JSON.parse(res);
          console.log(users);
          console.log(login, pwd);
          let user = users.filter(
            (item) => item.user == login && item.password == pwd
          );
          console.log(user);
          resolve(user);
        }
      }
    );
  });
};

app.post("/testing/api", (req, reply) => {
  reply.send({ message: "Ceci est un message de succès", data: req.body });
});

app.post("/testing/file-upload", (req, reply) => {
  // console.log("BODY", req.body);
  // console.log("FILES", req.files);
  // req.files.file.mv(
  //   path.join(__dirname, "uploaded", req.files.file.name),
  //   (error) => {
  //     console.log(error);
  //   }
  // );
  reply.send({ message: "File upload success", files: req.files });
});
