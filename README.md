
# Node, Mongo, SES & JWT Server.

The project is a node/express server dt using JWT access / refresh token to passwordlessly authenticate mobile app users.  
  
It is very secure as it tracks unique Id & IP address of every device the user has & authenticate refresh token against the device it was originally issued to.  
  
The server uses the full power of MongoDb, sends email with AWS SES & also use a few other AWS services.  
  
The server can be convert to password based system using bcrypt or preferably the more secure argon2 based encryption package & also implement other required feature if you deem it worthy.  



## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`ACCESS_TOKEN_SIGNATURE`

`REFRESH_TOKEN_SIGNATURE`  
  
`AWS_ACCESS_KEY`  
  
`AWS_SECRET_KEY`  

`AWS_REGION`  
  
`MongoDB_URL`

`EMAIL_ADDRESS`  (Your SES verified sender email)

`WEB_DOMAIN` (The client side domain name. used when authentication links)


## Installation

Install my-project with npm

```bash
  git clone git@github.com:Sh3riff/node_presentation.git
  cd node_presentation
  npm i
  npm run dev
```
    
## Authors

- [@sh3riff](https://www.github.com/sh3riff)
- [+2347068481276](tel:+2347068481276)

