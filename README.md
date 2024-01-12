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