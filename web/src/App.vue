<template>
  <div id="app">
    <div v-if="!isLoggedIn">
      Username: <input type="email" v-model="loginForm" v-on:keyup.enter="login"> &nbsp;
      <button @click="login">Login</button>
    </div>
    <div v-else>
      <div class="user">Hi, {{ username }}! &nbsp; <button @click="logout">Logout</button></div>
      <div>
        Add Todo:
        <input v-model="todoText" v-on:keyup.enter="submit" /> &nbsp;
        Tag: <input v-model="todoTag" v-on:keyup.enter="submit" /> &nbsp;
        <button @click="submit">Save</button>
      </div>

      <div class="list">
        <h4>Todos: <button @click="upload">Sync ({{ countUnuploaded }})</button></h4>
        <div>Last sync: {{ lastUpload }}</div>
        <table>
          <tr>
            <th>Todo</th>
            <th>Tag</th>
            <th>Created</th>
            <th></th>
          </tr>
          <tr v-for="todo in list" :key="todo._id">
            <td>{{ todo.text }}</td>
            <td>{{ todo.tag }}</td>
            <td>{{ todo.createdAt }}</td>
            <td><button>Delete</button></td>
          </tr>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import userStore from './store/user'
import todoStore from './store/todo'

export default {
  name: 'App',

  data() {
    return {
      isLoggedIn: false,
      loginForm: '',
      username: '',
      todoText: '',
      todoTag: '',
      list: [],
      countUnuploaded: 0,
      lastUpload: '',
    }
  },

  mounted: async function() {
    await userStore.initialize()
    if (userStore.data.username) {
      this.isLoggedIn = true
      this.username = userStore.data.username
    }
  },

  updated: async function() {
    if (this.isLoggedIn && !todoStore.isInitialized) {
      todoStore.setName(this.username)
      await todoStore.initialize()
      this.list = todoStore.data
    }

    if (this.isLoggedIn) {
      this.countUnuploaded = todoStore.countUnuploadeds()
      this.lastUpload = todoStore.dataMeta.tsUpload
    }
  },

  methods: {
    async login(){
      if (this.loginForm === '') return

      await userStore.editSingle({
        username: this.loginForm
      })
      this.username = this.loginForm
      this.isLoggedIn = true
      this.loginForm = ''
    },

    async logout() {
      await userStore.deleteSingle();
      await todoStore.deinitialize();
      this.isLoggedIn = false
    },

    async submit(e) {
      e.preventDefault()
      if (this.todoText === '') return

      const data = {
        text: this.todoText,
        tag: this.todoTag,
      }
      await todoStore.addItem(data, userStore.data)
      this.list = todoStore.data

      this.todoText = ''
      this.todoTag = ''
    },

    async upload() {
      try {
        await todoStore.upload();
        this.countUnuploaded = todoStore.countUnuploadeds()
      } catch (err) {
        alert(err.message);
      }
    },
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  width: 500px;
  color: #2c3e50;
  margin: 60px auto 0;
}

.user {
  margin-bottom: 10px;
}

.list h4 {
  margin: 5px auto;
}

table {
  border: 1px solid;
}
table td, table th {
  border-bottom: 1px solid;
  padding: 3px 10px;
  margin: 2px;
}
</style>
