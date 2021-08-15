<template>
  <div id="app">
    <div v-if="!isLoggedIn">
      Username: <input type="email" v-model="loginForm" v-on:keyup.enter="login"> &nbsp;
      <button @click="login">Login</button>
    </div>
    <div v-else>
      <div class="user">Hi, {{ username }}! &nbsp; <button @click="logout">Logout</button></div>
      <div>
        {{ editMode ? 'Edit': 'Add' }} Todo:
        <input v-model="todo.text" v-on:keyup.enter="submit" ref="todoForm" /> &nbsp;
        Tag: <input v-model="todo.tag" v-on:keyup.enter="submit" /> &nbsp;
        <button @click="submit">{{ editMode? 'Update' : 'Add' }}</button>
        <button v-if="editMode" @click="cancel">Cancel</button>
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
          <tr v-for="(todo, index) in list" :key="index">
            <td>{{ todo.text }}</td>
            <td>{{ todo.tag }}</td>
            <td>{{ todo.createdAt }}</td>
            <td>
              <button @click="edit(todo, index)">Edit</button>
              <button @click="deleteTodo(todo._id)">Done</button>
            </td>
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
      list: [],
      countUnuploaded: 0,
      lastUpload: '',
      todo: {},
      editMode: false,
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
    }

    if (this.isLoggedIn) {
      this.list = todoStore.data
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
      if (!this.todo.text) return

      if (!this.editMode) {
        this.addTodo()
      } else {
        this.updateTodo()
      }
    },

    async addTodo() {
      await todoStore.addItem(this.todo, userStore.data)
      this.todo = {}
    },

    async updateTodo() {
      const data = {
        text: this.todo.text,
          tag: this.todo.tag
        }
        await todoStore.editItem(this.todo._id, data, userStore.data)
        this.editMode = false
        this.$set(this.list, this.index, { ...this.todo })
        this.todo = {}
    },

    async upload() {
      try {
        await todoStore.upload();
        this.countUnuploaded = todoStore.countUnuploadeds()
      } catch (err) {
        alert(err.message);
      }
    },

    async deleteTodo(id) {
      await todoStore.deleteItem(id, userStore.data)
      this.list = todoStore.data
    },

    async edit(todo, index) {
      this.editMode = true
      this.todo = { ...todo }
      this.$refs.todoForm.focus()
      this.index = index
    },

    cancel() {
      this.editMode = false
      this.todo = {}
    },

  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  width: 600px;
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
