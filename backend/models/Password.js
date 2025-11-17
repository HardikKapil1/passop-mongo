class Password {
  constructor(db) {
    this.collection = db.collection("passwords");
  }

  async createPassword({ site, username, password, userId }) {
    const entry = {
      site,
      username,
      password,       // encrypted already (frontend)
      userId,         // reference to user
      createdAt: new Date()
    };

    return this.collection.insertOne(entry);
  }

  async getAllPasswords(userId) {
    return this.collection.find({ userId }).toArray();
  }

  async deletePassword(id, userId) {
    return this.collection.deleteOne({ id, userId });
  }

  async updatePassword(id, updatedData, userId) {
    return this.collection.updateOne(
      { id, userId },
      { $set: updatedData }
    );
  }
}

module.exports = Password;
