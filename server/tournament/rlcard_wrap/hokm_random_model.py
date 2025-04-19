import rlcard
from rlcard.agents import RandomAgent
from rlcard.models.model import Model


class HokmRandomModelSpec(object):
    def __init__(self):
        self.model_id = 'hokm-random'

    def load(self):
        return HokmRandomModel()


class HokmRandomModel(Model):
    ''' A random model for Hokm
    '''

    def __init__(self):
        ''' Load random model
        '''
        env = rlcard.make('hokm')
        self.agent = RandomAgent(num_actions=env.num_actions)
        self.num_players = env.num_players

    @property
    def agents(self):
        ''' Get a list of agents for each position in a the game

        Returns:
            agents (list): A list of agents

        Note: Each agent should be just like RL agent with step and eval_step
              functioning well.
        '''
        return [self.agent for _ in range(self.num_players)]

    @property
    def use_raw(self):
        ''' Indicate whether use raw state and action

        Returns:
            use_raw (boolean): True if using raw state and action
        '''
        return False 