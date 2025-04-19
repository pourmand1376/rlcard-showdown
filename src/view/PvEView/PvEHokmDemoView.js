import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  Paper,
  Typography,
} from '@material-ui/core';
import axios from 'axios';
import { Message } from 'element-react';
import { douzeroDemoUrl } from '../../utils/config';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
  },
  card: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
  cardHeader: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
  playerArea: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  trumpDisplay: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    textAlign: 'center',
    backgroundColor: '#f8f8f8',
  },
  playerCard: {
    display: 'inline-block',
    margin: theme.spacing(0.5),
    padding: theme.spacing(1),
    minWidth: '40px',
    height: '60px',
    textAlign: 'center',
    borderRadius: '5px',
    border: '1px solid #ddd',
    cursor: 'pointer',
    boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
    transition: 'transform 0.2s',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 4px 6px rgba(0,0,0,0.15)',
    },
  },
  playedCard: {
    display: 'inline-block',
    margin: theme.spacing(0.5),
    padding: theme.spacing(1),
    minWidth: '40px',
    height: '60px',
    textAlign: 'center',
    borderRadius: '5px',
    border: '1px solid #ddd',
    boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
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
  trumpSelect: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: theme.spacing(3),
  },
  trumpButton: {
    margin: theme.spacing(1),
    padding: theme.spacing(2),
    minWidth: '60px',
  },
  playerActive: {
    backgroundColor: '#f0f0f0',
    border: '2px solid #4caf50',
  },
  playerInfo: {
    marginBottom: theme.spacing(1),
  },
  gameInfo: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    backgroundColor: '#f5f5f5',
  },
  trickArea: {
    padding: theme.spacing(2),
    minHeight: '150px',
    backgroundColor: '#f8f8f8',
    textAlign: 'center',
  },
  gameControls: {
    marginTop: theme.spacing(2),
    display: 'flex',
    justifyContent: 'center',
  },
}));

// URL for the Hokm PvE server - use the base URL from config with hokm endpoint
const PVE_SERVER_URL = douzeroDemoUrl.replace('/dmc', '/hokm');

function PvEHokmDemoView() {
  const classes = useStyles();
  
  // Game state
  const [gameStarted, setGameStarted] = useState(false);
  const [playerHand, setPlayerHand] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [trumpSuit, setTrumpSuit] = useState(null);
  const [currentTrick, setCurrentTrick] = useState([]);
  const [lastCompletedTrick, setLastCompletedTrick] = useState(null);
  const [lastTrickWinner, setLastTrickWinner] = useState(null);
  const [tricksWon, setTricksWon] = useState([0, 0, 0, 0]);
  const [teamScores, setTeamScores] = useState([0, 0]);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState('');
  const [showGameOverDialog, setShowGameOverDialog] = useState(false);
  const [previousPlayer, setPreviousPlayer] = useState(null);
  const [lastServerResponse, setLastServerResponse] = useState(null);
  const [showServerResponse, setShowServerResponse] = useState(false);
  const [gameHistory, setGameHistory] = useState([]);
  const [showGameHistory, setShowGameHistory] = useState(false);
  
  // Monitor currentTrick changes
  useEffect(() => {
    // If we see 4 cards in the current trick, make a note of it
    if (currentTrick.length === 4) {
      // This is a full trick
    }
  }, [currentTrick]);
  
  // Monitor player changes - this can help detect trick completion
  useEffect(() => {
    // If we have 4 cards and the player changes, this likely means a trick was completed
    if (currentTrick.length === 4 && previousPlayer !== null) {
      // Save this completed trick
      const completedTrick = [...currentTrick];
      
      // The previous player is likely the winner
      setLastCompletedTrick(completedTrick);
      setLastTrickWinner(previousPlayer);
    }
    
    setPreviousPlayer(currentPlayer);
  }, [currentPlayer]);

  // Card suit symbols and colors
  const suitSymbols = {
    'H': '♥',
    'S': '♠',
    'D': '♦',
    'C': '♣'
  };
  
  const suitNames = {
    'H': 'Hearts',
    'S': 'Spades',
    'D': 'Diamonds',
    'C': 'Clubs'
  };
  
  const getSuitClass = (suit) => {
    switch(suit) {
      case 'H': return classes.hearts;
      case 'D': return classes.diamonds;
      case 'S': return classes.spades;
      case 'C': return classes.clubs;
      default: return '';
    }
  };
  
  // Start a new game
  const startGame = async () => {
    try {
      const response = await axios.post(`${PVE_SERVER_URL}/start_game`);
      if (response.data.status === 0) {
        // Store the complete server response
        setLastServerResponse(response.data);
        
        setPlayerHand(response.data.player_hand);
        setCurrentPlayer(response.data.current_player);
        setTrumpSuit(response.data.trump_suit);
        setGameStarted(true);
        setCurrentTrick([]);
        setLastCompletedTrick(null);
        setLastTrickWinner(null);
        setTricksWon([0, 0, 0, 0]);
        setTeamScores([0, 0]);
        setGameOver(false);
        setGameHistory(response.data.game_history || []);
        setMessage('Game started! Choose a trump suit.');
      } else {
        setMessage('Error starting game: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error starting game:', error);
      setMessage('Error connecting to server. Make sure the PvE server is running.');
    }
  };
  
  // Choose trump suit
  const chooseTrumpSuit = async (suit) => {
    try {
      const formData = new FormData();
      formData.append('suit', suit);
      
      const response = await axios.post(`${PVE_SERVER_URL}/choose_trump`, formData);
      
      if (response.data.status === 0) {
        // Store the complete server response
        setLastServerResponse(response.data);
        
        updateGameState(response.data);
        setMessage(`Trump suit chosen: ${suitNames[suit]}. Your turn!`);
      } else {
        setMessage('Error choosing trump: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error choosing trump:', error);
      setMessage('Error connecting to server.');
    }
  };
  
  // Play a card
  const playCard = async (card) => {
    if (currentPlayer !== 0) {
      setMessage("It's not your turn!");
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append('card', card);
      
      const response = await axios.post(`${PVE_SERVER_URL}/play_card`, formData);
      
      if (response.data.status === 0) {
        // Store the complete server response
        setLastServerResponse(response.data);
        
        updateGameState(response.data);
        setMessage(`You played ${card}. ${response.data.message}`);
      } else {
        setMessage('Error playing card: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error playing card:', error);
      setMessage('Error connecting to server.');
    }
  };
  
  // Update the game state from server response
  const updateGameState = (data) => {
    setPlayerHand(data.player_hand || []);
    setCurrentPlayer(data.current_player);
    setTrumpSuit(data.trump_suit);
    
    // Store game history if available
    if (data.game_history) {
      setGameHistory(data.game_history);
    }
    
    // Check if we need to convert the trick data format
    let formattedCurrentTrick = data.current_trick;
    if (data.current_trick && data.current_trick.length > 0) {
      // Check if data is already in the expected format with player_id
      const hasCorrectFormat = data.current_trick[0].hasOwnProperty('player_id');
      
      if (!hasCorrectFormat) {
        // Format conversion needed - might need to adapt this based on actual format
        formattedCurrentTrick = data.current_trick.map((card, index) => {
          // Try to determine the player who played this card
          // This is a simplification - the actual player might be different
          const potentialPlayer = (data.current_player - data.current_trick.length + index + 4) % 4;
          return {
            card: card,
            player_id: potentialPlayer
          };
        });
      }
    }
    
    // Check if the tricks_won array has changed, indicating a player won a trick
    const tricksWonChanged = data.tricks_won && 
      JSON.stringify(tricksWon) !== JSON.stringify(data.tricks_won);
    
    // If tricks won changed, find out who won
    let winner = null;
    if (tricksWonChanged && data.tricks_won && tricksWon) {
      for (let i = 0; i < 4; i++) {
        if (data.tricks_won[i] > tricksWon[i]) {
          winner = i;
          break;
        }
      }
    }
    
    setCurrentTrick(formattedCurrentTrick || []);
    setTricksWon(data.tricks_won || [0, 0, 0, 0]);
    setTeamScores(data.team_scores || [0, 0]);
    setGameOver(data.game_over || false);
    
    if (data.game_over) {
      setShowGameOverDialog(true);
    }
  };
  
  // Render a card with the appropriate styling
  const renderCard = (card, playable = false, onClick = null, isSmall = false) => {
    if (!card) return null;
    
    const suit = card[0];
    const rank = card[1];
    const suitClass = getSuitClass(suit);
    
    const smallStyle = isSmall ? {
      minWidth: '30px',
      height: '45px',
      padding: '2px',
      margin: '2px',
      fontSize: '0.8rem'
    } : {};
    
    const cardElement = (
      <div 
        className={`${playable ? classes.playerCard : classes.playedCard} ${suitClass}`}
        onClick={playable ? () => onClick(card) : null}
        style={smallStyle}
      >
        <div>{rank}</div>
        <div>{suitSymbols[suit]}</div>
      </div>
    );
    
    return cardElement;
  };
  
  // new helper to render any trick
  const renderSingleTrick = (title, trick = [], winner = null) => (
    <Paper 
      className={classes.trickArea} 
      style={{ marginTop: title === 'Previous Trick' ? '16px' : undefined }}
    >
      <Typography variant="h6" gutterBottom>
        {title} {title === 'Previous Trick' ? `(${trick.length} cards)` : ''}
      </Typography>

      {trick.length === 0
        ? <Typography variant="body1">No cards played yet</Typography>
        : (
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
            {trick.map((play, i) => (
              <div 
                key={i} 
                style={{
                  margin: '10px',
                  padding: title === 'Previous Trick' ? '5px' : undefined,
                  border: title === 'Previous Trick' && play.player_id === winner
                    ? '2px solid #4caf50'
                    : 'none',
                  borderRadius: '4px',
                  background: title === 'Previous Trick' && play.player_id === winner
                    ? 'rgba(76,175,80,0.1)'
                    : 'transparent'
                }}
              >
                <Typography variant="body2" align="center">
                  Player {play.player_id}
                  {title === 'Previous Trick' && play.player_id === winner && (
                    <span style={{ color: '#4caf50', marginLeft: '5px' }}>👑</span>
                  )}
                </Typography>
                {renderCard(play.card)}
              </div>
            ))}
          </div>
        )
      }

      {title === 'Completed Trick' && lastTrickWinner !== null && (
        <Typography 
          variant="body1" 
          style={{ marginTop: '10px', fontWeight: 'bold', color: '#4caf50' }}
        >
          Player {lastTrickWinner} won this trick
        </Typography>
      )}
    </Paper>
  );

  const renderTrickArea = () => (
    <div>
      {renderSingleTrick('Current Trick', currentTrick, null)}
      {lastCompletedTrick && renderSingleTrick(
        'Previous Trick',
        lastCompletedTrick,
        lastTrickWinner
      )}
    </div>
  );

  // Render the trump selection UI
  const renderTrumpSelection = () => {
    if (trumpSuit !== null) return null;
    
    return (
      <div className={classes.trumpSelect}>
        <Typography variant="h6" gutterBottom>Choose Trump Suit:</Typography>
        <div>
          <Button 
            className={`${classes.trumpButton} ${classes.hearts}`}
            variant="outlined"
            onClick={() => chooseTrumpSuit('H')}
          >
            {suitSymbols['H']}
          </Button>
          <Button 
            className={`${classes.trumpButton} ${classes.diamonds}`}
            variant="outlined"
            onClick={() => chooseTrumpSuit('D')}
          >
            {suitSymbols['D']}
          </Button>
          <Button 
            className={`${classes.trumpButton} ${classes.spades}`}
            variant="outlined"
            onClick={() => chooseTrumpSuit('S')}
          >
            {suitSymbols['S']}
          </Button>
          <Button 
            className={`${classes.trumpButton} ${classes.clubs}`}
            variant="outlined"
            onClick={() => chooseTrumpSuit('C')}
          >
            {suitSymbols['C']}
          </Button>
        </div>
      </div>
    );
  };
  
  // Render the trump display
  const renderTrumpDisplay = () => {
    if (!trumpSuit) return null;
    
    const suitClass = getSuitClass(trumpSuit);
    
    return (
      <Paper className={classes.trumpDisplay}>
        <Typography variant="h6" gutterBottom>Trump Suit</Typography>
        <Typography variant="h4" className={suitClass}>
          {suitSymbols[trumpSuit]} {suitNames[trumpSuit]}
        </Typography>
      </Paper>
    );
  };
  
  // Toggle server response display
  const toggleServerResponse = () => {
    setShowServerResponse(!showServerResponse);
  };
  
  // Toggle game history display
  const toggleGameHistory = () => {
    setShowGameHistory(!showGameHistory);
  };
  
  // Render server response
  const renderServerResponse = () => {
    if (!showServerResponse || !lastServerResponse) return null;
    
    return (
      <Paper style={{ padding: '16px', marginTop: '16px', backgroundColor: '#f5f5f5' }}>
        <Typography variant="h6" gutterBottom>
          Last Server Response
          <Button 
            size="small" 
            style={{ marginLeft: '16px' }}
            onClick={() => {
              // Copy to clipboard
              navigator.clipboard.writeText(JSON.stringify(lastServerResponse, null, 2))
                .then(() => setMessage("Response copied to clipboard"))
                .catch(err => console.error('Failed to copy: ', err));
            }}
          >
            Copy
          </Button>
        </Typography>
        <pre style={{ 
          overflowX: 'auto', 
          backgroundColor: '#2b2b2b',
          color: '#e6e6e6',
          padding: '12px',
          borderRadius: '4px',
          fontSize: '12px',
          maxHeight: '400px',
          overflowY: 'auto'
        }}>
          {JSON.stringify(lastServerResponse, null, 2)}
        </pre>
      </Paper>
    );
  };
  
  // Render game history
  const renderGameHistory = () => {
    if (!showGameHistory || !gameHistory || gameHistory.length === 0) return null;
    
    // Group play actions into tricks (groups of 4 cards)
    const tricks = [];
    let currentTrick = [];
    let trickWinners = [];
    
    // First pass: collect all play actions into tricks
    gameHistory.forEach((event, index) => {
      if (event.action === 'play') {
        currentTrick.push(event);
        
        // When we have 4 cards, that's a complete trick
        if (currentTrick.length === 4) {
          tricks.push([...currentTrick]);
          currentTrick = [];
          
          // The next player must be the winner of this trick
          // We'll find this in the second pass
        }
      }
    });
    
    // If there's an incomplete trick at the end, add it too
    if (currentTrick.length > 0) {
      tricks.push([...currentTrick]);
    }
    
    // Second pass: determine trick winners by finding the player who plays next
    for (let i = 0; i < tricks.length; i++) {
      const trick = tricks[i];
      if (trick.length === 4 && i < tricks.length - 1) {
        // The player who starts the next trick is the winner of this trick
        const nextTrickStarter = (i + 1 < tricks.length && tricks[i + 1].length > 0) 
          ? tricks[i + 1][0].player_id 
          : null;
        trickWinners[i] = nextTrickStarter;
      }
    }
    
    // Find trump suit events
    const trumpEvents = gameHistory.filter(event => event.action === 'choose_trump');
    const trumpSuit = trumpEvents.length > 0 ? trumpEvents[0].suit : null;
    
    return (
      <Paper style={{ padding: '16px', marginTop: '16px', backgroundColor: '#f0f7ff' }}>
        <Typography variant="h6" gutterBottom>
          Game History
          {trumpSuit && (
            <span style={{ marginLeft: '16px', fontSize: '0.9rem' }}>
              Trump: <span className={classes[trumpSuit.toLowerCase() === 'h' || trumpSuit.toLowerCase() === 'd' ? 'hearts' : 'spades']}>
                {trumpSuit === 'H' ? '♥' : trumpSuit === 'S' ? '♠' : trumpSuit === 'D' ? '♦' : '♣'}
              </span>
            </span>
          )}
        </Typography>
        
        <div style={{ 
          maxHeight: '400px', 
          overflowY: 'auto',
          backgroundColor: '#fff',
          padding: '12px',
          borderRadius: '4px'
        }}>
          {/* Trump suit selection */}
          {trumpEvents.length > 0 && (
            <div style={{ 
              marginBottom: '16px', 
              padding: '8px', 
              backgroundColor: '#f8f8f8',
              borderRadius: '4px',
              borderLeft: '4px solid #2196f3'
            }}>
              <Typography variant="body2" style={{ fontWeight: 'bold' }}>
                {trumpEvents[0].player_id === 0 ? 'You' : `Player ${trumpEvents[0].player_id}`} chose trump suit: 
                <span className={classes[trumpEvents[0].suit.toLowerCase() === 'h' || trumpEvents[0].suit.toLowerCase() === 'd' ? 'hearts' : 'spades']} style={{ marginLeft: '8px', fontWeight: 'bold' }}>
                  {trumpEvents[0].suit === 'H' ? '♥' : trumpEvents[0].suit === 'S' ? '♠' : trumpEvents[0].suit === 'D' ? '♦' : '♣'}
                </span>
              </Typography>
            </div>
          )}
          
          {/* Render tricks */}
          {tricks.map((trick, trickIndex) => (
            <div 
              key={trickIndex} 
              style={{ 
                marginBottom: '16px',
                padding: '8px',
                backgroundColor: '#f9f9f9',
                borderRadius: '4px',
                border: '1px solid #e0e0e0'
              }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px'
              }}>
                <Typography variant="subtitle2">
                  Trick {trickIndex + 1}
                </Typography>
                {trickWinners[trickIndex] !== undefined && (
                  <Typography variant="body2" style={{ 
                    backgroundColor: '#e8f5e9',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    color: '#2e7d32'
                  }}>
                    Winner: {trickWinners[trickIndex] === 0 ? 'You' : `Player ${trickWinners[trickIndex]}`}
                  </Typography>
                )}
              </div>
              
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap',
                justifyContent: 'space-around'
              }}>
                {trick.map((play, cardIndex) => (
                  <div 
                    key={cardIndex} 
                    style={{ 
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      margin: '4px',
                      padding: '4px',
                      width: '70px',
                      backgroundColor: play.player_id === 0 ? '#f5f5f5' : 'transparent',
                      borderRadius: '4px',
                      border: play.player_id === 0 ? '1px solid #e0e0e0' : 'none'
                    }}
                  >
                    {renderCard(play.card, false, null, true)}
                    <Typography variant="caption" style={{ 
                      marginTop: '4px',
                      fontWeight: play.player_id === 0 ? 'bold' : 'normal'
                    }}>
                      {play.player_id === 0 ? 'You' : `P${play.player_id}`}
                    </Typography>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          {/* Game over message */}
          {gameHistory.some(event => event.action === 'game_over') && (
            <div style={{ 
              marginTop: '16px', 
              padding: '8px', 
              backgroundColor: '#fff9c4',
              borderRadius: '4px',
              textAlign: 'center'
            }}>
              <Typography variant="body1" style={{ fontWeight: 'bold' }}>
                Game Over!
              </Typography>
              <Typography variant="body2">
                {teamScores[0] > teamScores[1] 
                  ? 'Team 1 (You & Player 2) wins!' 
                  : teamScores[0] < teamScores[1] 
                    ? 'Team 2 (Player 1 & 3) wins!' 
                    : 'Game ended in a tie!'}
              </Typography>
              <Typography variant="body2">
                Final Score: Team 1: {teamScores[0]} - Team 2: {teamScores[1]}
              </Typography>
            </div>
          )}
        </div>
      </Paper>
    );
  };
  
  // Show a game over dialog
  const renderGameOverDialog = () => {
    if (!showGameOverDialog) return null;
    
    const winner = teamScores[0] > teamScores[1] ? 'Team 1 (You and Player 2)' : 'Team 2 (Player 1 and 3)';
    
    return (
      <Dialog
        open={showGameOverDialog}
        onClose={() => setShowGameOverDialog(false)}
      >
        <DialogTitle>Game Over</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Game has ended! Final scores:<br />
            Team 1 (You and Player 2): {teamScores[0]} tricks<br />
            Team 2 (Player 1 and 3): {teamScores[1]} tricks<br /><br />
            {winner} wins!
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowGameOverDialog(false)} color="primary">
            Close
          </Button>
          <Button onClick={startGame} color="primary" autoFocus>
            New Game
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
  
  return (
    <Container className={classes.root} maxWidth="lg">
      <Typography variant="h4" gutterBottom>Hokm PvE Demo</Typography>
      
      {!gameStarted ? (
        <Card className={classes.card}>
          <CardHeader title="Welcome to Hokm!" className={classes.cardHeader} />
          <CardContent>
            <Typography variant="body1" paragraph>
              Hokm is a popular Persian trick-taking card game played with a standard 52-card deck.
              It's a team game where players sitting across from each other form teams.
            </Typography>
            <Typography variant="body1" paragraph>
              Rules:
            </Typography>
            <Typography variant="body1" component="ul">
              <li>You are Player 0 and your partner is Player 2</li>
              <li>First player chooses the trump suit</li>
              <li>Players must follow suit if possible</li>
              <li>Highest card of the led suit wins, unless a trump is played</li>
              <li>Highest trump wins if multiple trumps are played</li>
              <li>Winner of a trick leads the next trick</li>
              <li>Each team tries to win the most tricks</li>
            </Typography>
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={startGame}
              >
                Start Game
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div>
          {/* Game information */}
          <Paper className={classes.gameInfo}>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography variant="body1">
                  <strong>Team 1 (You & Player 2):</strong> {teamScores[0]} tricks
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body1" align="center">
                  <strong>Current Player:</strong> {currentPlayer === 0 ? "Your Turn!" : `Player ${currentPlayer}`}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body1" align="right">
                  <strong>Team 2 (Player 1 & 3):</strong> {teamScores[1]} tricks
                </Typography>
              </Grid>
            </Grid>
          </Paper>
          
          {/* Trump selection or display */}
          {trumpSuit === null ? renderTrumpSelection() : renderTrumpDisplay()}
          
          {/* Trick area */}
          {renderTrickArea()}
          
          {/* Player's hand */}
          <Card className={classes.card}>
            <CardHeader 
              title="Your Hand" 
              className={classes.cardHeader} 
            />
            <CardContent>
              <div style={{ textAlign: 'center' }}>
                {playerHand.sort().map((card, index) => (
                  <React.Fragment key={index}>
                    {renderCard(card, trumpSuit !== null && currentPlayer === 0, playCard)}
                  </React.Fragment>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Game status message */}
          {message && (
            <Typography variant="body1" align="center" style={{ marginTop: '10px', fontWeight: 'bold' }}>
              {message}
            </Typography>
          )}
          
          {/* Game controls */}
          <div className={classes.gameControls}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={startGame}
              style={{ marginRight: '10px' }}
            >
              New Game
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={toggleServerResponse}
              style={{ marginRight: '10px' }}
            >
              {showServerResponse ? 'Hide' : 'Show'} Server Response
            </Button>
            <Button
              variant="outlined"
              color="primary"
              onClick={toggleGameHistory}
            >
              {showGameHistory ? 'Hide' : 'Show'} Game History
            </Button>
          </div>
          
          {/* Server response display */}
          {renderServerResponse()}
          
          {/* Game history display */}
          {renderGameHistory()}
          
          {/* Game over dialog */}
          {renderGameOverDialog()}
        </div>
      )}
    </Container>
  );
}

export default PvEHokmDemoView;