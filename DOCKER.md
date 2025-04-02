# Running RLCard-Showdown with Docker

This guide explains how to run RLCard-Showdown using Docker containers.

## Prerequisites

- Docker
- Docker Compose
- Git

## Setup Instructions

1. Clone the repository:
```bash
git clone https://github.com/datamllab/rlcard-showdown.git
cd rlcard-showdown
```

2. Download the pre-trained models:
   - Download from [Google Drive](https://drive.google.com/file/d/1zx-20xNBDbCFd8GWhZFUkl07lofbNHpy/view?usp=sharing) or [百度网盘](https://pan.baidu.com/s/12MgxVBBz4mgitT74quSWfw) (extraction code: qh6s)
   - Extract the downloaded file in the `pve_server/pretrained` directory

3. Build and start the containers:
```bash
docker-compose up --build
```

This will start three services:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- PvE Server: http://localhost:5000

## Development

The setup includes volume mounts for both the backend and PvE server, allowing you to make changes to the code without rebuilding the containers.

### Making Changes

1. For frontend changes:
   - Rebuild the frontend container:
   ```bash
   docker-compose build frontend
   docker-compose up frontend
   ```

2. For backend changes:
   - Changes to the `server` directory will be reflected immediately
   - You may need to restart the backend container:
   ```bash
   docker-compose restart backend
   ```

3. For PvE server changes:
   - Changes to the `pve_server` directory will be reflected immediately
   - You may need to restart the PvE container:
   ```bash
   docker-compose restart pve
   ```

## Stopping the Application

To stop all containers:
```bash
docker-compose down
```

## Troubleshooting

1. If you encounter permission issues with the mounted volumes:
   ```bash
   sudo chown -R $USER:$USER .
   ```

2. If the containers fail to start, check the logs:
   ```bash
   docker-compose logs
   ```

3. To rebuild all containers from scratch:
   ```bash
   docker-compose down
   docker-compose build --no-cache
   docker-compose up
   ``` 