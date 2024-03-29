const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");

const SequelizeService = require("../../sequelize/sequelize.service");
const User = require("../../../models/userModel");
const { webpConvertor,deleteFile } = require("../../../helper/imageConvertor");
const { generateToken } = require("../../../helper/jwt");

class AuthService {
  constructor() {
    this.User = new SequelizeService(User);
  }

  async signUp(req) {
    try {
      const userName = req.body.userName;
      const email = req.body.email;
      const roleId = 2;

      let file=req.body.profile
      let webpresult 
      if (!file) {
        file=''
        webpresult=''
      }else{
      webpresult=await webpConvertor(
          req.file.path,
          "public/uploads/images",
          "kk",
          50,
          50);
      }
      if (req.body.comfirmPass !== req.body.password) {
        return Error
      }
      const password = await bcrypt.hash(req.body.password, 12);
      
      const user = await this.User.create({
        userName,
        email,
        password,
        roleId,
        profile:webpresult
      });
      const accessToken = generateToken(user.id);

      return { user: user, token: accessToken };
    } catch (error) {
      console.log(error);
      return error;
      //   next(error);
    }
  }
  async logIn(req) {
    const userName = req.body.userName;
    const password = req.body.password;
    try {
      const user = await this.User.findOne({ where: { userName } });
      if (!user) {
        return new Error("no such user");
      }
      if (!bcrypt.compareSync(password, user.password)) {
        return new Error("wrong");
      }
      const accessToken = generateToken(user.id);
      return { user: user, token: accessToken };
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  async usersList() {
    const users = await this.User.findOne();
    return users;
  }

  async deleteUser(req) {
    try {
      if (await this.User.findOne({req})) {
      await deleteFile(this.profile)
        
      }
      const deletedUser = await this.User.delete({ where: { id: req } });
      return deletedUser;
    } catch (error) {
      return error;
    }
  }

  async user(req) {
    try {
      const user = await this.User.findOne({ where: { id: req } });
      return user;
    } catch (error) {
      return error;
    }
  }

  async edit(req) {
    try {
      const row = await this.User.findOne({ where: { id: req.params.id } });
      const email = req.body.email;
      const userName = req.body.userName;
      const password = bcrypt.hashSync(req.body.password);
      const edited = await this.User.findOneAndUpdate(
        { email, password, userName },
        row
      );
      return edited;
    } catch (error) {
      return error;
    }
  }
}

module.exports = AuthService;
