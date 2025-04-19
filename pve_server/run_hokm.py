import itertools
import random
import numpy as np

from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Card suit and rank mapping
suits = ['H', 'S', 'D', 'C']  # Hearts, Spades, Diamonds, Clubs
ranks = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A']

# Generate all possible cards
all_cards = [suit + rank for suit in suits for rank in ranks]

# Card values for ranking (2 is lowest, Ace is highest)
card_values = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, 
    '9': 9, 'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
}

class HokmGame:
    def __init__(self):
        self.reset_game()
    
    def reset_game(self):
        # Shuffle and deal cards
        cards = all_cards.copy()
        random.shuffle(cards)
        
        # Deal 13 cards to each player
        self.player_hands = [cards[i:i+13] for i in range(0, 52, 13)]
        
        # Player 0 is human, 1-3 are AI
        self.current_player = 0
        
        # Set initial game state
        self.trump_suit = None
        self.current_trick = []
        self.tricks_won = [0, 0, 0, 0]  # Tricks won by each player
        self.team_scores = [0, 0]  # Team 1 (player 0, 2), Team 2 (player 1, 3)
        self.game_history = []
        self.game_over = False
    
    def choose_trump_suit(self, suit):
        if suit in ['H', 'S', 'D', 'C']:
            self.trump_suit = suit
            self.current_player = 0  # Player who chose trump starts
            
            # Add to game history
            self.game_history.append({
                'action': 'choose_trump',
                'player_id': 0,  # Always the human player who chooses trump in this game
                'suit': suit
            })
            
            return True
        return False
    
    def play_card(self, player_id, card):
        # Check if it's the player's turn
        if player_id != self.current_player:
            return False, "Not your turn"
        
        # Check if player has the card
        if card not in self.player_hands[player_id]:
            return False, "You don't have this card"
        
        # Check if the play follows suit
        if len(self.current_trick) > 0:
            led_suit = self.current_trick[0]['card'][0]  # First card's suit
            player_has_suit = any(c[0] == led_suit for c in self.player_hands[player_id])
            
            if player_has_suit and card[0] != led_suit:
                return False, "You must follow suit"
        
        # Remove card from player's hand
        self.player_hands[player_id].remove(card)
        
        # Add to current trick
        self.current_trick.append({
            'player_id': player_id,
            'card': card
        })
        
        # Add to game history
        self.game_history.append({
            'action': 'play',
            'player_id': player_id,
            'card': card
        })
        
        # If trick is complete (all 4 players played)
        if len(self.current_trick) == 4:
            winner = self._evaluate_trick()
            self.tricks_won[winner] += 1
            
            # Update team scores
            team_id = 0 if winner in [0, 2] else 1
            self.team_scores[team_id] += 1
            
            # Winner leads next trick
            self.current_player = winner
            self.current_trick = []
            
            # Check if game is over (all cards played)
            if all(len(hand) == 0 for hand in self.player_hands):
                self.game_over = True
                self.game_history.append({
                    'action': 'game_over',
                    'scores': self.team_scores
                })
        else:
            # Next player's turn
            self.current_player = (self.current_player + 1) % 4
        
        return True, "Card played successfully"
    
    def _evaluate_trick(self):
        # First card leads
        led_suit = self.current_trick[0]['card'][0]
        
        highest_value = -1
        winner = -1
        
        for play in self.current_trick:
            card = play['card']
            player = play['player_id']
            
            # Get the value of the card
            value = card_values[card[1]]
            
            # Trump suit beats all other suits
            if card[0] == self.trump_suit:
                if highest_value < value or winner == -1 or self.current_trick[winner]['card'][0] != self.trump_suit:
                    highest_value = value
                    winner = player
            # Following led suit
            elif card[0] == led_suit:
                if highest_value < value or winner == -1 or (self.current_trick[winner]['card'][0] != self.trump_suit 
                                                         and self.current_trick[winner]['card'][0] != led_suit):
                    highest_value = value
                    winner = player
        
        return winner
    
    def ai_play(self):
        # Simple AI strategy
        if not self.trump_suit:
            # Choose a random trump suit if AI is the first player
            self.trump_suit = random.choice(suits)
            self.game_history.append({
                'action': 'choose_trump',
                'player_id': self.current_player,
                'suit': self.trump_suit
            })
            return {'action': 'choose_trump', 'suit': self.trump_suit}
        
        player_id = self.current_player
        hand = self.player_hands[player_id]
        
        # If starting a trick, play highest trump or highest card
        if len(self.current_trick) == 0:
            # Try to play highest trump
            trump_cards = [card for card in hand if card[0] == self.trump_suit]
            if trump_cards:
                best_card = max(trump_cards, key=lambda c: card_values[c[1]])
            else:
                # Play highest card
                best_card = max(hand, key=lambda c: card_values[c[1]])
            
            success, msg = self.play_card(player_id, best_card)
            return {'action': 'play', 'card': best_card, 'success': success}
        
        # Follow suit if possible
        led_suit = self.current_trick[0]['card'][0]
        matching_cards = [card for card in hand if card[0] == led_suit]
        
        if matching_cards:
            # Play highest card of the suit
            best_card = max(matching_cards, key=lambda c: card_values[c[1]])
        else:
            # Can't follow suit, try to play lowest trump
            trump_cards = [card for card in hand if card[0] == self.trump_suit]
            if trump_cards:
                best_card = min(trump_cards, key=lambda c: card_values[c[1]])
            else:
                # Play lowest card
                best_card = min(hand, key=lambda c: card_values[c[1]])
        
        success, msg = self.play_card(player_id, best_card)
        return {'action': 'play', 'card': best_card, 'success': success}

# Create a global game instance
hokm_game = HokmGame()

@app.route('/start_game', methods=['POST'])
def start_game():
    hokm_game.reset_game()
    
    # Return initial game state
    return jsonify({
        'status': 0,
        'message': 'Game started',
        'player_hand': hokm_game.player_hands[0],
        'current_player': hokm_game.current_player,
        'trump_suit': hokm_game.trump_suit,
        'game_history': hokm_game.game_history
    })

@app.route('/choose_trump', methods=['POST'])
def choose_trump():
    if request.method == 'POST':
        try:
            suit = request.form.get('suit')
            if hokm_game.choose_trump_suit(suit):
                # AI players take their turns
                while hokm_game.current_player != 0 and not hokm_game.game_over:
                    hokm_game.ai_play()
                
                return jsonify({
                    'status': 0,
                    'message': 'Trump suit chosen',
                    'player_hand': hokm_game.player_hands[0],
                    'current_player': hokm_game.current_player,
                    'trump_suit': hokm_game.trump_suit,
                    'current_trick': hokm_game.current_trick,
                    'tricks_won': hokm_game.tricks_won,
                    'team_scores': hokm_game.team_scores,
                    'game_over': hokm_game.game_over,
                    'game_history': hokm_game.game_history
                })
            else:
                return jsonify({'status': 1, 'message': 'Invalid trump suit'})
        except Exception as e:
            return jsonify({'status': -1, 'message': str(e)})

@app.route('/play_card', methods=['POST'])
def play_card():
    if request.method == 'POST':
        try:
            card = request.form.get('card')
            success, msg = hokm_game.play_card(0, card)  # Player 0 is human
            
            if success:
                # AI players take their turns
                while hokm_game.current_player != 0 and not hokm_game.game_over:
                    hokm_game.ai_play()
                
                return jsonify({
                    'status': 0,
                    'message': msg,
                    'player_hand': hokm_game.player_hands[0],
                    'current_player': hokm_game.current_player,
                    'current_trick': hokm_game.current_trick,
                    'tricks_won': hokm_game.tricks_won,
                    'team_scores': hokm_game.team_scores,
                    'game_over': hokm_game.game_over,
                    'game_history': hokm_game.game_history
                })
            else:
                return jsonify({'status': 1, 'message': msg})
        except Exception as e:
            return jsonify({'status': -1, 'message': str(e)})

@app.route('/game_state', methods=['GET'])
def game_state():
    return jsonify({
        'status': 0,
        'player_hand': hokm_game.player_hands[0],
        'current_player': hokm_game.current_player,
        'trump_suit': hokm_game.trump_suit,
        'current_trick': hokm_game.current_trick,
        'tricks_won': hokm_game.tricks_won,
        'team_scores': hokm_game.team_scores,
        'game_over': hokm_game.game_over,
        'game_history': hokm_game.game_history
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True) 