# Setup a Muon Light Shield Node


### 1- Clone the repository

```
git clone git@github.com:muon-protocol/light-shield-node.git
```

### 2- Copy the MuonApps to `muon-apps` directoy
### 3- Create and edit .env file

```
cp .env.example .env
```
Edit the file and set `SIGN_WALLET_ADDRESS` and `SIGN_WALLET_PRIVATE_KEY`

### 4- Run the webserver

```
npm install
nodejs server.js # for development
pm2 start # for production
```
