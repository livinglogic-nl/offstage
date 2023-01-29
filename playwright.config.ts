export default {
  timeout: (process.env.CI ? 10 : 5 ) * 1000,
  forbidOnly: process.env.CI ? true : false,
}

