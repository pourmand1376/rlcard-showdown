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
  const [showingCompletedTrick, setShowingCompletedTrick] = useState(false);
  const [completedTricks, setCompletedTricks] = useState([]);
  const [tricksWon, setTricksWon] = useState([0, 0, 0, 0]);
  const [teamScores, setTeamScores] = useState([0, 0]);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState('');
  const [showGameOverDialog, setShowGameOverDialog] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [previousPlayer, setPreviousPlayer] = useState(null);
  const [debugTrickCaptures, setDebugTrickCaptures] = useState([]);
  
  // Monitor currentTrick changes
  useEffect(() => {
    console.log("Current trick updated:", currentTrick);
    // If we see 4 cards in the current trick, make a note of it
    if (currentTrick.length === 4) {
      console.log("FULL TRICK DETECTED:", JSON.stringify(currentTrick));
      // Backup safety - whenever we see 4 cards, save this as a potential completed trick
      setDebugTrickCaptures(prev => [...prev, [...currentTrick]]);
    }
  }, [currentTrick]);
  
  // Monitor player changes - this can help detect trick completion
  useEffect(() => {
    console.log(`Player changed from ${previousPlayer} to ${currentPlayer}`);
    
    // If we have 4 cards and the player changes, this likely means a trick was completed
    if (currentTrick.length === 4 && previousPlayer !== null) {
      console.log("TRICK COMPLETION DETECTED via player change");
      
      // Save this completed trick
      const completedTrick = [...currentTrick];
      
      // The previous player is likely the winner
      setLastCompletedTrick(completedTrick);
      setLastTrickWinner(previousPlayer);
      
      // Add to debug captures
      setDebugTrickCaptures(prev => [...prev, completedTrick]);
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
        setPlayerHand(response.data.player_hand);
        setCurrentPlayer(response.data.current_player);
        setTrumpSuit(response.data.trump_suit);
        setGameStarted(true);
        setCurrentTrick([]);
        setLastCompletedTrick(null);
        setLastTrickWinner(null);
        setShowingCompletedTrick(false);
        setCompletedTricks([]);
        setTricksWon([0, 0, 0, 0]);
        setTeamScores([0, 0]);
        setGameOver(false);
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
    
    // Log current state for debugging
    console.log('Current trick length:', currentTrick.length);
    console.log('Current trick data:', JSON.stringify(currentTrick));
    console.log('Incoming trick:', JSON.stringify(data.current_trick));
    console.log('Current tricks won:', tricksWon);
    console.log('Incoming tricks won:', data.tricks_won);
    
    // Check if the tricks_won array has changed, indicating a player won a trick
    const tricksWonChanged = data.tricks_won && 
      JSON.stringify(tricksWon) !== JSON.stringify(data.tricks_won);
    
    console.log('Tricks won changed:', tricksWonChanged);
    
    // If tricks won changed, find out who won
    let winner = null;
    if (tricksWonChanged && data.tricks_won && tricksWon) {
      for (let i = 0; i < 4; i++) {
        if (data.tricks_won[i] > tricksWon[i]) {
          winner = i;
          break;
        }
      }
      console.log('Detected winner:', winner);
    }
    
    // Better detection for completed tricks
    // A trick is completed when:
    // 1. We had exactly 4 cards in the current trick (a complete trick), and
    // 2. The incoming data has an empty trick array, or
    // 3. The tricks won counter has changed
    // 4. And the game isn't over yet
    const trickJustCompleted = 
      currentTrick.length === 4 && 
      ((!data.current_trick || data.current_trick.length === 0) || tricksWonChanged) &&
      !gameOver;
    
    console.log('Trick just completed:', trickJustCompleted);
    
    // CRITICAL FIX: Store the current trick BEFORE updating state
    // This is needed because state updates are asynchronous
    const completedTrick = trickJustCompleted ? [...currentTrick] : null;
    
    if (trickJustCompleted) {
      console.log('Trick completed!', JSON.stringify(completedTrick));
      
      // Set last completed trick directly with the local copy, not from state
      setLastCompletedTrick(completedTrick);
      setLastTrickWinner(winner);
      setShowingCompletedTrick(true);
      
      // Check if we saved it correctly
      setTimeout(() => {
        console.log('Did we save the completed trick?', lastCompletedTrick);
      }, 100);
      
      // Set a timeout to clear the completed trick after 2 seconds
      setTimeout(() => {
        console.log('Clearing completed trick display');
        setShowingCompletedTrick(false);
        setCurrentTrick(data.current_trick || []);
      }, 2000);
    } else {
      // No trick completion, just update normally
      setCurrentTrick(data.current_trick || []);
    }
    
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
  
  // Render the trick area
  const renderTrickArea = () => {
    // Determine which trick to show - the current one or the last completed one during the delay
    const trickToShow = showingCompletedTrick ? lastCompletedTrick : currentTrick;
    const prevTrick = lastCompletedTrick || [];
    
    console.log("Rendering trick area. Current trick:", currentTrick);
    console.log("Last completed trick:", lastCompletedTrick);
    
    return (
      <div>
        <Paper className={classes.trickArea}>
          <Typography variant="h6" gutterBottom>
            {showingCompletedTrick ? "Completed Trick" : "Current Trick"}
          </Typography>
          <div>
            {(!trickToShow || trickToShow.length === 0) ? (
              <Typography variant="body1">No cards played yet</Typography>
            ) : (
              trickToShow.map((play, index) => (
                <div key={index} style={{ display: 'inline-block', margin: '10px' }}>
                  <Typography variant="body2">Player {play.player_id}</Typography>
                  {renderCard(play.card)}
                </div>
              ))
            )}
          </div>
          {showingCompletedTrick && lastTrickWinner !== null && (
            <Typography variant="body1" style={{ marginTop: '10px', fontWeight: 'bold', color: '#4caf50' }}>
              Player {lastTrickWinner} won this trick
            </Typography>
          )}
        </Paper>
        
        {/* Previous trick display */}
        {lastCompletedTrick && !showingCompletedTrick && (
          <Paper className={classes.trickArea} style={{ marginTop: '16px' }}>
            <Typography variant="h6" gutterBottom>
              Previous Trick ({prevTrick.length} cards)
            </Typography>
            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
              {prevTrick.map((play, index) => (
                <div key={index} style={{ 
                  margin: '10px',
                  padding: '5px',
                  border: lastTrickWinner === play.player_id ? '2px solid #4caf50' : 'none',
                  borderRadius: '4px',
                  background: lastTrickWinner === play.player_id ? 'rgba(76, 175, 80, 0.1)' : 'transparent'
                }}>
                  <Typography variant="body2" align="center">
                    Player {play.player_id} 
                    {lastTrickWinner === play.player_id && (
                      <span style={{ color: '#4caf50', marginLeft: '5px' }}>👑</span>
                    )}
                  </Typography>
                  {renderCard(play.card)}
                </div>
              ))}
            </div>
            {prevTrick.length < 4 && (
              <Typography variant="body2" color="error" style={{ marginTop: '10px', textAlign: 'center' }}>
                Note: Only {prevTrick.length} cards were recorded for this trick.
              </Typography>
            )}
          </Paper>
        )}
      </div>
    );
  };
  
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
  
  // Render a debug panel
  const renderDebugPanel = () => {
    if (!showDebug) return null;
    
    return (
      <Paper style={{ padding: '10px', marginTop: '20px', background: '#f5f5f5' }}>
        <Typography variant="h6">Debug Information</Typography>
        <pre style={{ fontSize: '12px', overflowX: 'auto' }}>
          {JSON.stringify({
            currentTrick: currentTrick,
            lastCompletedTrick: lastCompletedTrick,
            tricksWon: tricksWon,
            currentPlayer: currentPlayer,
            previousPlayer: previousPlayer,
            lastTrickWinner: lastTrickWinner
          }, null, 2)}
        </pre>
        <Typography variant="subtitle2" style={{ marginTop: '10px' }}>Debug Trick Captures:</Typography>
        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
          {debugTrickCaptures.map((trick, index) => (
            <div key={index} style={{ borderBottom: '1px solid #ddd', paddingBottom: '5px', marginBottom: '5px' }}>
              <Typography variant="caption">Capture {index + 1}:</Typography>
              <pre style={{ fontSize: '11px' }}>{JSON.stringify(trick, null, 1)}</pre>
              <Button 
                variant="outlined" 
                size="small" 
                color="secondary"
                onClick={() => {
                  setLastCompletedTrick(trick);
                  setLastTrickWinner(trick[trick.length - 1].player_id); // Just guess the last player
                  setShowingCompletedTrick(false);
                }}
              >
                Restore
              </Button>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '10px' }}>
          <Button 
            variant="outlined" 
            size="small" 
            onClick={() => {
              // Save the current trick as lastCompletedTrick
              if (currentTrick.length > 0) {
                setLastCompletedTrick([...currentTrick]);
                setLastTrickWinner(0);
                setShowingCompletedTrick(false);
              }
            }}
            style={{ marginRight: '8px' }}
          >
            Save Current as Last
          </Button>
          <Button 
            variant="outlined" 
            size="small" 
            onClick={() => {
              // Log the last API response
              console.log("Current state:", {
                currentTrick,
                lastCompletedTrick,
                tricksWon,
                currentPlayer
              });
            }}
            style={{ marginRight: '8px' }}
          >
            Log State
          </Button>
          <Button 
            variant="outlined" 
            size="small" 
            color="secondary"
            onClick={() => {
              setDebugTrickCaptures([]);
            }}
          >
            Clear Captures
          </Button>
        </div>
      </Paper>
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
            
            {/* Debug button - only visible during development */}
            {process.env.NODE_ENV !== 'production' && (
              <>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => {
                    // Create a test completed trick with 4 cards
                    const testTrick = [
                      { player_id: 0, card: 'H4' },
                      { player_id: 1, card: 'HQ' },
                      { player_id: 2, card: 'HA' },
                      { player_id: 3, card: 'HK' }
                    ];
                    
                    // Set this as the last completed trick
                    setLastCompletedTrick(testTrick);
                    setLastTrickWinner(2); // Player 2 won with the Ace
                    setShowingCompletedTrick(false); // Show it as a previous trick, not current
                    
                    console.log('Added test trick to lastCompletedTrick:', testTrick);
                  }}
                  style={{ marginRight: '10px' }}
                >
                  Show Test Trick
                </Button>
                <Button
                  variant="outlined"
                  color="default"
                  onClick={() => setShowDebug(!showDebug)}
                >
                  {showDebug ? 'Hide Debug' : 'Show Debug'}
                </Button>
              </>
            )}
          </div>
          
          {/* Debug panel */}
          {renderDebugPanel()}
          
          {/* Game over dialog */}
          {renderGameOverDialog()}
        </div>
      )}
    </Container>
  );
}

export default PvEHokmDemoView; 