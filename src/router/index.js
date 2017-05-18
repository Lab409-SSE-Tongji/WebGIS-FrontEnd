import Vue from 'vue'
import Router from 'vue-router'
import Google from '@/views/google'
import MapCompare from '@/views/mapCompare'
import MyMap from '@/views/myMap'
import Recycled from '@/views/recycled'
import Login from '@/views/login'
import Signup from '@/views/signup'


Vue.use(Router)
const router = new Router({
  routes: [
    {
      path: '/',
      redirect: '/myMap'
    },
    {
      path: '/google/:mapId',
      name: 'google',
      components: {
        mainPage: Google
      }
    },
    {
      path: '/google/compare/:mapId',
      name: 'mapCompare',
      components: {
        mainPage: MapCompare
      }
    },
    {
      path:'/myMap',
      name:'myMap',
      components:{
        mainPage:MyMap
      }
    },
    {
      path:'/recycled',
      name:'recycled',
      components:{
        mainPage:Recycled
      }
    },
     {
      path: '/signup',
      name: 'signup',
      components:{
        mainPage: Signup
      }
    },
    {
      path: '/login',
      name:'login',
      components: {
        mainPage: Login
      }
    },
    {
      path: '*',
      name: 'others',
      redirect: '/myMap'
    }
  ]
})

// router.beforeEach( (to, from, next) => {
//     console.log('beforeEach')
//     console.log(store)
//     console.log(store.getters.isLoggedIn)
//     console.log(store.state.session.userName)
//     let userName = store.state.session.userName
//     let isLoggedIn = store.getters.isLoggedIn
//     if(isLoggedIn) next()
//     else next('/index')
//   }
// )

export default router
