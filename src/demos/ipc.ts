
window.ipcRenderer.on('main-process-message', (_event, ...args) => {
  console.log('[Receive Main-process message]:', ...args)
})



// const loginForm: any = document.querySelector('formd');
// const loginButton = document.querySelector('#login-btn');
// const errorDiv = document.getElementById('error');
// // const adminModel = require('./src/models/client.model')


// loginForm.addEventListener('click', async (event: any) => {
//     event.preventDefault();
//     // const username = document.getElementById('username').value;
//     // const url = window.location.href;
//     // window.loginAPI.login(username)
//     console.log("+++++++++++++++++++++");
//     // const admin = await adminModel.find({});
//     console.log("+++++++++++++++++++++");
//     console.log(admin);
// });

