# RLCard Showdown
This is the GUI support for the [RLCard](https://github.com/datamllab/rlcard) project and [DouZero](https://github.com/kwai/DouZero) project. RLCard-Showdown provides evaluation and visualization tools to help understand the performance of the agents. It includes a replay module, where you can analyze the replays, and a PvE module, where you can play with the AI interactively. Currently, we only support Leduc Hold'em and Dou Dizhu. The frontend is developed with [React](https://reactjs.org/). The backend is based on [Django](https://www.djangoproject.com/) and [Flask](https://flask.palletsprojects.com/). Have fun!

## Quick Links
- [Official Website](http://www.rlcard.org)
- [Documentation](docs/README.md)
- [Tutorial in Jupyter Notebook](https://github.com/datamllab/rlcard-tutorial)
- [Research Paper](https://www.ijcai.org/Proceedings/2020/764)
- [Online Demo with DouZero](https://www.douzero.org/)
- [Data-centric AI Survey](https://arxiv.org/abs/2303.10158)
- [Awesome Data-centric AI Resources](https://github.com/daochenzha/data-centric-AI)

## Resources
*   Official Website: [http://www.rlcard.org](http://www.rlcard.org)
*   Tutorial in Jupyter Notebook: [https://github.com/datamllab/rlcard-tutorial](https://github.com/datamllab/rlcard-tutorial)
*   Paper: [https://www.ijcai.org/Proceedings/2020/764](https://www.ijcai.org/Proceedings/2020/764)
*   Document: [Click Here](docs/README.md)
*   Online Demo with DouZero: [https://www.douzero.org/](https://www.douzero.org/)
*   Miscellaneous Resources: Have you heard of data-centric AI? Please check out our [data-centric AI survey](https://arxiv.org/abs/2303.10158) and [awesome data-centric AI resources](https://github.com/daochenzha/data-centric-AI)!

## Cite this work
Zha, Daochen, et al. "RLCard: A Platform for Reinforcement Learning in Card Games." IJCAI. 2020.
```bibtex
@inproceedings{zha2020rlcard,
  title={RLCard: A Platform for Reinforcement Learning in Card Games},
  author={Zha, Daochen and Lai, Kwei-Herng and Huang, Songyi and Cao, Yuanpu and Reddy, Keerthana and Vargas, Juan and Nguyen, Alex and Wei, Ruzhe and Guo, Junyu and Hu, Xia},
  booktitle={IJCAI},
  year={2020}
}
```

## Installation and Running with Docker

### Prerequisites
- Docker installed on your system
- Docker Compose (optional, for easier management)

### Download Pre-trained Models
First, download the pre-trained models:
```bash
cd pve_server
wget https://github.com/pourmand1376/rlcard-showdown/releases/download/v0.1/pretrained.zip
unzip -o pretrained.zip -d .
```

### Building Docker Images
Build the three required Docker images:
```bash
# Build frontend image
docker build -t rlcard-frontend -f Dockerfile.frontend .

# Build backend image
docker build -t rlcard-backend -f Dockerfile.backend .

# Build PvE server image
docker build -t rlcard-pve -f Dockerfile.pve .
```

### Running the Application
You can run each component in a separate terminal:

1. Start the frontend (React application):
```bash
docker run -p 3000:3000 rlcard-frontend
```

2. Start the backend (Django server):
```bash
docker run -p 8000:8000 rlcard-backend
```

3. Start the PvE server (Flask server):
```bash
docker run -p 5000:5000 rlcard-pve
```

### Accessing the Application
Once all containers are running, you can access:
- Leaderboard: [http://127.0.0.1:3000/](http://127.0.0.1:3000/)
- PvE Demo: [http://127.0.0.1:3000/pve/doudizhu-demo](http://127.0.0.1:3000/pve/doudizhu-demo)
- Backend API: [http://127.0.0.1:8000/](http://127.0.0.1:8000/)
- PvE Server: [http://127.0.0.1:5000/](http://127.0.0.1:5000/)

### Alternative: Using Docker Compose
For easier management, you can use Docker Compose. Create a `docker-compose.yml` file with the following content:

```yaml
version: '3'
services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
      - pve

  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "8000:8000"

  pve:
    build:
      context: .
      dockerfile: Dockerfile.pve
    ports:
      - "5000:5000"
```

Then run:
```bash
docker-compose up
```

## Demos
![leaderboards](https://github.com/datamllab/rlcard-showdown/blob/master/docs/imgs/leaderboards.png?raw=true)
![upload](https://github.com/datamllab/rlcard-showdown/blob/master/docs/imgs/upload.png?raw=true)
![doudizhu-replay](https://github.com/datamllab/rlcard-showdown/blob/master/docs/imgs/doudizhu-replay.png?raw=true)
![leduc-replay](https://github.com/datamllab/rlcard-showdown/blob/master/docs/imgs/leduc-replay.png?raw=true)

## Contact Us
If you have any questions or feedback, feel free to drop an email to [Songyi Huang](https://github.com/hsywhu) for the frontend or [Daochen Zha](https://github.com/daochenzha) for backend.

## Acknowledgements
We would like to thank JJ World Network Technology Co., LTD for the generous support, [Chieh-An Tsai](https://anntsai.myportfolio.com/) for user interface design, and [Lei Pan](https://github.com/lpan18) for the help in visualizations.
