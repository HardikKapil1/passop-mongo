const { ObjectId } = require("mongodb");

class User {
  constructor(db) {
    this.collection = db.collection("users");
  }

  async createUser({ username, email, passwordHash }) {
    const user = {
      username,
      email,
      passwordHash,
      createdAt: new Date()
    };
    const result = await this.collection.insertOne(user);
    return result;
  }

  async findByEmail(email) {
    return this.collection.findOne({ email });
  }

  async findById(id) {
    return this.collection.findOne({ _id: new ObjectId(id) });
  }
}

module.exports = User;
