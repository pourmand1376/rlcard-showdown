import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import FastForwardIcon from '@material-ui/icons/FastForward';
import FastRewindIcon from '@material-ui/icons/FastRewind';
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import PauseIcon from '@material-ui/icons/Pause';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import SkipNextIcon from '@material-ui/icons/SkipNext';
import SkipPreviousIcon from '@material-ui/icons/SkipPrevious';
import axios from 'axios';
import qs from 'query-string';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { apiUrl } from '../../utils/config';

const useStyles = makeStyles((theme) => ({
    root: {
        padding: theme.spacing(3),
    },
    card: {
        marginTop: theme.spacing(3),
    },
    cardHeader: {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
    },
    button: {
        margin: theme.spacing(1),
    },
    player: {
        padding: theme.spacing(2),
        margin: theme.spacing(2),
        height: '100%',
    },
    playerActive: {
        padding: theme.spacing(2),
        margin: theme.spacing(2),
        height: '100%',
        backgroundColor: '#f0f0f0',
    },
    hokmSuit: {
        marginTop: theme.spacing(2),
        padding: theme.spacing(2),
        backgroundColor: '#f5f5f5',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: '1.2em',
    },
    controller: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing(2),
    },
    cardItem: {
        display: 'inline-block',
        margin: '0 5px',
        padding: '5px 10px',
        border: '1px solid #ddd',
        borderRadius: '5px',
        backgroundColor: '#fff',
    },
    hearts: {
        color: 'red',
    },
    diamonds: {
        color: 'red',
    },
    spades: {
        color: 'black',
    },
    clubs: {
        color: 'black',
    },
    trick: {
        marginTop: theme.spacing(2),
        padding: theme.spacing(2),
        textAlign: 'center',
    },
}));

function HokmReplayView() {
    const classes = useStyles();
    const { t } = useTranslation();
    
    const [replay, setReplay] = React.useState({});
    const [currentStep, setCurrentStep] = React.useState(0);
    const [isPlaying, setIsPlaying] = React.useState(false);
    const [playbackSpeed, setPlaybackSpeed] = React.useState(1000); // in milliseconds
    const [teams, setTeams] = React.useState({ team1: 0, team2: 0 });
    const [currentTrick, setCurrentTrick] = React.useState([]);
    
    const { name, agent0, agent1, index } = qs.parse(window.location.search);
    
    const cardSuitSymbol = {
        'S': '♠',
        'H': '♥',
        'D': '♦',
        'C': '♣'
    };
    
    const hokmSuitDisplay = {
        'hearts': '♥ Hearts',
        'spades': '♠ Spades',
        'diamonds': '♦ Diamonds',
        'clubs': '♣ Clubs'
    };

    useEffect(() => {
        async function fetchData() {
            const res = await axios.get(`${apiUrl}/tournament/query_replay?name=${name}&agent0=${agent0}&agent1=${agent1}&index=${index}`);
            const replayData = JSON.parse(JSON.parse(res.data.data).replace(/'/g, '"'));
            console.log(replayData);
            setReplay(replayData);
        }
        fetchData();
    }, [name, agent0, agent1, index]);

    useEffect(() => {
        let timer = null;
        if (isPlaying && currentStep < (replay.moveHistory ? replay.moveHistory.length : 0)) {
            timer = setTimeout(() => {
                setCurrentStep(currentStep + 1);
            }, playbackSpeed);
        } else if (currentStep >= (replay.moveHistory ? replay.moveHistory.length : 0)) {
            setIsPlaying(false);
        }
        return () => {
            if (timer) {
                clearTimeout(timer);
            }
        };
    }, [isPlaying, currentStep, replay, playbackSpeed]);

    useEffect(() => {
        if (replay.moveHistory && currentStep > 0) {
            // Track trick cards and calculate team scores
            const move = replay.moveHistory[currentStep - 1];
            if (move.move !== 'pass' && move.move !== 'hearts' && move.move !== 'spades' && 
                move.move !== 'diamonds' && move.move !== 'clubs') {
                
                const updatedTrick = [...currentTrick, { 
                    card: move.move, 
                    player: move.playerIdx 
                }];
                
                // Complete trick (4 cards played)
                if (updatedTrick.length === 4) {
                    // Determine winner and update scores
                    const winningTeam = determineWinningTeam(updatedTrick, replay.hokm);
                    setTeams(prev => ({
                        team1: prev.team1 + (winningTeam === 'team1' ? 1 : 0),
                        team2: prev.team2 + (winningTeam === 'team2' ? 1 : 0)
                    }));
                    // Clear trick for next round
                    setCurrentTrick([]);
                } else {
                    setCurrentTrick(updatedTrick);
                }
            }
        }
    }, [currentStep, replay]);

    const determineWinningTeam = (trick, hokmSuit) => {
        // Simplified trick winning logic
        // In a real implementation, this would determine the highest card based on suit rules
        // For this demo, we'll just return team1 or team2 based on player indexes
        const winningPlayer = trick[0].player; // Simplified logic
        return winningPlayer % 2 === 0 ? 'team1' : 'team2';
    };

    const getPlayerCards = (playerIdx) => {
        if (!replay.initHands) return [];
        
        let hand = replay.initHands[playerIdx].split(' ');
        
        // Remove cards that have been played
        if (replay.moveHistory) {
            for (let i = 0; i < currentStep; i++) {
                const move = replay.moveHistory[i];
                if (move.playerIdx === playerIdx && 
                    move.move !== 'pass' && 
                    move.move !== 'hearts' && 
                    move.move !== 'spades' && 
                    move.move !== 'diamonds' && 
                    move.move !== 'clubs') {
                    const index = hand.indexOf(move.move);
                    if (index !== -1) {
                        hand.splice(index, 1);
                    }
                }
            }
        }
        
        return hand;
    };

    const renderCard = (card) => {
        if (!card) return null;
        
        let suit = card[0]; // First character is the suit
        let rank = card.substring(1); // Rest is the rank
        let suitClass = '';
        
        if (suit === 'H') suitClass = classes.hearts;
        else if (suit === 'D') suitClass = classes.diamonds;
        else if (suit === 'S') suitClass = classes.spades;
        else if (suit === 'C') suitClass = classes.clubs;
        
        return (
            <span className={`${classes.cardItem} ${suitClass}`}>
                {rank}{cardSuitSymbol[suit]}
            </span>
        );
    };

    const renderMoveHistory = () => {
        if (!replay.moveHistory) return null;
        
        return (
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Step</TableCell>
                            <TableCell>Player</TableCell>
                            <TableCell>Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {replay.moveHistory.slice(0, currentStep).map((move, idx) => (
                            <TableRow key={idx}>
                                <TableCell>{idx + 1}</TableCell>
                                <TableCell>
                                    {replay.playerInfo ? replay.playerInfo[move.playerIdx].agentInfo.name : move.playerIdx}
                                </TableCell>
                                <TableCell>{move.move}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    };

    return (
        <div className={classes.root}>
            <Typography variant="h4">Hokm Game Replay</Typography>
            
            <Card className={classes.card}>
                <CardHeader 
                    title="Game Information"
                    className={classes.cardHeader}
                />
                <CardContent>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <Typography variant="body1">
                                <strong>Team 1:</strong> {agent0} (Players 0 & 2)
                            </Typography>
                            <Typography variant="body1">
                                <strong>Score:</strong> {teams.team1}
                            </Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="body1">
                                <strong>Team 2:</strong> {agent1} (Players 1 & 3)
                            </Typography>
                            <Typography variant="body1">
                                <strong>Score:</strong> {teams.team2}
                            </Typography>
                        </Grid>
                        {replay.hokm && (
                            <Grid item xs={12}>
                                <div className={classes.hokmSuit}>
                                    <strong>Hokm (Trump Suit):</strong> {hokmSuitDisplay[replay.hokm]}
                                </div>
                            </Grid>
                        )}
                    </Grid>
                </CardContent>
            </Card>
            
            <Card className={classes.card}>
                <CardHeader 
                    title="Current State"
                    className={classes.cardHeader}
                />
                <CardContent>
                    <Grid container spacing={2}>
                        {[0, 1, 2, 3].map((playerIdx) => (
                            <Grid item xs={6} key={playerIdx}>
                                <Paper 
                                    className={
                                        replay.moveHistory && 
                                        currentStep < replay.moveHistory.length && 
                                        replay.moveHistory[currentStep].playerIdx === playerIdx
                                            ? classes.playerActive
                                            : classes.player
                                    }
                                >
                                    <Typography variant="h6">
                                        Player {playerIdx} ({replay.playerInfo ? replay.playerInfo[playerIdx].agentInfo.name : ''})
                                    </Typography>
                                    <Divider />
                                    <div>
                                        {getPlayerCards(playerIdx).map((card, idx) => (
                                            <React.Fragment key={idx}>
                                                {renderCard(card)}
                                                {' '}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </Paper>
                            </Grid>
                        ))}
                        
                        <Grid item xs={12}>
                            <Paper className={classes.trick}>
                                <Typography variant="h6">Current Trick</Typography>
                                <Divider />
                                <div style={{ marginTop: '10px' }}>
                                    {currentTrick.length === 0 ? (
                                        <Typography variant="body1">No cards played yet</Typography>
                                    ) : (
                                        currentTrick.map((trickCard, idx) => (
                                            <React.Fragment key={idx}>
                                                <Typography variant="body2" display="inline">
                                                    Player {trickCard.player}: 
                                                </Typography>
                                                {' '}{renderCard(trickCard.card)}{' '}
                                            </React.Fragment>
                                        ))
                                    )}
                                </div>
                            </Paper>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
            
            <div className={classes.controller}>
                <IconButton onClick={() => setCurrentStep(0)}>
                    <SkipPreviousIcon />
                </IconButton>
                <IconButton onClick={() => setCurrentStep(Math.max(0, currentStep - 5))}>
                    <FastRewindIcon />
                </IconButton>
                <IconButton onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}>
                    <NavigateBeforeIcon />
                </IconButton>
                <IconButton onClick={() => setIsPlaying(!isPlaying)}>
                    {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                </IconButton>
                <IconButton 
                    onClick={() => setCurrentStep(Math.min(replay.moveHistory ? replay.moveHistory.length : 0, currentStep + 1))}
                >
                    <NavigateNextIcon />
                </IconButton>
                <IconButton 
                    onClick={() => setCurrentStep(Math.min(replay.moveHistory ? replay.moveHistory.length : 0, currentStep + 5))}
                >
                    <FastForwardIcon />
                </IconButton>
                <IconButton 
                    onClick={() => setCurrentStep(replay.moveHistory ? replay.moveHistory.length : 0)}
                >
                    <SkipNextIcon />
                </IconButton>
                
                <Button 
                    className={classes.button} 
                    variant={playbackSpeed === 2000 ? 'contained' : 'outlined'} 
                    color="primary"
                    onClick={() => setPlaybackSpeed(2000)}
                >
                    Slow
                </Button>
                <Button 
                    className={classes.button} 
                    variant={playbackSpeed === 1000 ? 'contained' : 'outlined'} 
                    color="primary"
                    onClick={() => setPlaybackSpeed(1000)}
                >
                    Normal
                </Button>
                <Button 
                    className={classes.button} 
                    variant={playbackSpeed === 500 ? 'contained' : 'outlined'} 
                    color="primary"
                    onClick={() => setPlaybackSpeed(500)}
                >
                    Fast
                </Button>
            </div>
            
            <Card className={classes.card}>
                <CardHeader 
                    title="Move History"
                    className={classes.cardHeader}
                />
                <CardContent>
                    {renderMoveHistory()}
                </CardContent>
            </Card>
        </div>
    );
}

export default HokmReplayView; 