#!bin/bash

sudo dnf install -y git

# sudo dnf install -y curl

sudo dnf install -y docker

systemctl enable docker
systemctl start docker

usermod -aG docker ec2-user

git clone --filter=blob:none --no-checkout https://github.com/ASHP-10/leetcode-judge.git

cd leetcode-judge

git sparse-checkout init --cone
git sparse-checkout set ec2

git checkout master

cd ec2
npm install

curl -fsSL https://rpm.nodesource.com/setup_22.x | sudo bash -
sudo dnf install -y nodejs

aws ecr get-login-password --region ap-south-1 | sudo docker login --username AWS --password-stdin 354918378371.dkr.ecr.ap-south-1.amazonaws.com

sudo docker pull 354918378371.dkr.ecr.ap-south-1.amazonaws.com/leetcode-judge:latest


cat > /home/ec2-user/leetcode-judge/ec2/.env <<EOF
AWS_REGION=ap-south-1
SQS_URL=https://sqs.ap-south-1.amazonaws.com/354918378371/leetcode-judge-ec2
S3_BUCKET=leetcode-judge-354918378371-ap-south-1-an
CONTAINER_NAME=354918378371.dkr.ecr.ap-south-1.amazonaws.com/leetcode-judge
EOF

cat > /etc/systemd/system/judge-worker.service <<EOF
[Unit]
Description=LeetCode Judge Worker
After=network.target docker.service

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/home/ec2-user/leetcode-judge/ec2

EnvironmentFile=/home/ec2-user/leetcode-judge/ec2/.env

ExecStart=/usr/bin/node /home/ec2-user/leetcode-judge/ec2/src/worker.js

Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo sysetmctl enable judge-worker
sudo systemctl start judge-worker