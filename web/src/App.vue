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
    </div>
  </div>
</template>

<script>
import userStore from './store/user'

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
    }
  },

  mounted: async function() {
    await userStore.initialize()
    if (userStore.data.user) {
      this.isLoggedIn = true
      this.username = userStore.data.user
    }
  },

  methods: {
    async login(){
      if (this.loginForm === '') return

      await userStore.editSingle({
        user: this.loginForm
      })
      this.username = this.loginForm
      this.isLoggedIn = true
      this.loginForm = ''
    },

    async logout() {
      await userStore.deleteSingle();
      this.isLoggedIn = false
    },

    async submit(e) {
      e.preventDefault()
      if (this.todoText === '') return
      console.log(this.todoText)
      //
    }
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
</style>
