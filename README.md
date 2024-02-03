# CUPChain Webapp

## Dependencies
Install the following dependencies:

```bash
cd frontend
npm install
cd ..
cd backend
pip install -r requirements.txt
```

If you want to do a clean deployment of the database run:
```python
python backend/create_db.py
```
Ensure first that the url is correct in your .env file

## How to run

### Option 1: Build react app and run it with flask

```bash
# Run flask app on port 5000
cd frontend
npm run build
cd ..
cd backend
flask run
```

### Option 2: Run react app and flask separately
Run the following commands in two separate terminals:

```bash
# Run react app on port 3000
cd frontend
npm start
```

```bash
# Run flask app on port 5000
cd backend
flask run
```
## Blockchain
Execute these commands from inside the `frontend/` folder
### `npx hardhat node`
Starts the blockchain node. It always resets the chain.

### `npx hardhat run scripts/deploy.ts --network localhost`
Deploys the contracts located in `contracts/`. The script needs to get updated when creating new contracts.

### Chain explorer
```bash
git clone https://github.com/blockscout/blockscout.git
cd blockscout/docker-compose
docker-compose up --build
docker-compose -f hardhat-network.yml up -d
```
The explorer will be available on http://localhost.