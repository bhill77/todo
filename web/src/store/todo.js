
import PouchyStore from 'pouchy-store';

const config = {
  couchDBUrl: 'http://13.250.43.79:5984/',
  couchDBAuth: {
    username: 'admin',
    password: 'iniadmin',
  },
}

class TodosStore extends PouchyStore {
  get name() {
    return this._name;
  }

  setName(userId) {
    this._name = `todos_${userId}`;
  }

  get urlRemote() {
    return config.couchDBUrl;
  }

  get optionsRemote() {
    return {
      auth: config.couchDBAuth,
    };
  }

}

export default new TodosStore();
