#!/bin/bash

# Install Node.js if not already installed
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Create deployment directory
DEPLOY_DIR="/var/www/mstr-app"
sudo mkdir -p $DEPLOY_DIR

# Copy build files
sudo cp -r build/* $DEPLOY_DIR/

# Copy server files
sudo cp server.js $DEPLOY_DIR/
sudo cp server/package.json $DEPLOY_DIR/

# Install server dependencies
cd $DEPLOY_DIR
sudo npm install

# Create systemd service
sudo tee /etc/systemd/system/mstr-app.service << EOF
[Unit]
Description=MicroStrategy React App
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$DEPLOY_DIR
Environment=REACT_APP_MSTR_API_URL=http://10.1.51.211:8080/MicroStrategyLibrary/api
Environment=REACT_APP_MSTR_PROJECT_ID=95550C99497DAAC3AC19DD86D91C4BB3
ExecStart=/usr/bin/node server.js
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# Enable and start the service
sudo systemctl daemon-reload
sudo systemctl enable mstr-app
sudo systemctl start mstr-app

echo "Deployment completed! The app should be running at http://localhost:3000" 