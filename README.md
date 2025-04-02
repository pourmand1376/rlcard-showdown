# RLCard Showdown
This is the GUI support for the [RLCard](https://github.com/datamllab/rlcard) project and [DouZero](https://github.com/kwai/DouZero) project. RLCard-Showdown provides evaluation and visualization tools to help understand the performance of the agents. It includes a replay module, where you can analyze the replays, and a PvE module, where you can play with the AI interactively. Currently, we only support Leduc Hold'em and Dou Dizhu.

## Quick Start

### Prerequisites
- Docker and Docker Compose installed on your system

### Installation
1. Download the pre-trained models:
```bash
cd pve_server
wget https://github.com/pourmand1376/rlcard-showdown/releases/download/v0.1/pretrained.zip
unzip -o pretrained.zip -d .
cd ..
```

2. Start the application:
```bash
docker-compose up
```

### Accessing the Application
Once the containers are running, you can access:
- Main application: [http://localhost:3000](http://localhost:3000)
- PvE Demo: [http://localhost:3000/pve/doudizhu-demo](http://localhost:3000/pve/doudizhu-demo)

## Resources
- [Official Website](http://www.rlcard.org)
- [Documentation](docs/README.md)
- [Tutorial in Jupyter Notebook](https://github.com/datamllab/rlcard-tutorial)
- [Research Paper](https://www.ijcai.org/Proceedings/2020/764)
- [Online Demo with DouZero](https://www.douzero.org/)

## Demos
![leaderboards](https://github.com/datamllab/rlcard-showdown/blob/master/docs/imgs/leaderboards.png?raw=true)
![upload](https://github.com/datamllab/rlcard-showdown/blob/master/docs/imgs/upload.png?raw=true)
![doudizhu-replay](https://github.com/datamllab/rlcard-showdown/blob/master/docs/imgs/doudizhu-replay.png?raw=true)
![leduc-replay](https://github.com/datamllab/rlcard-showdown/blob/master/docs/imgs/leduc-replay.png?raw=true)

## Contact
If you have any questions or feedback, feel free to drop an email to [Songyi Huang](https://github.com/hsywhu) for the frontend or [Daochen Zha](https://github.com/daochenzha) for backend.

## Acknowledgements
We would like to thank JJ World Network Technology Co., LTD for the generous support, [Chieh-An Tsai](https://anntsai.myportfolio.com/) for user interface design, and [Lei Pan](https://github.com/lpan18) for the help in visualizations.
