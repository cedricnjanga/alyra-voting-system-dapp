import { isNull } from 'lodash';

import { workflowStatuses } from './helpers';

export const initialState = {
  owner: null,
  voters: new Map(),
  proposals: new Map(),
  workflowStatus: null,
  currentUser: {
    address: null,
    isAdmin: null,
    isVoter: null,
    hasVoted: false,
  },
  contract: null,
  provider: null,
  isLoading: true,
}

export const reducer = (state, action) => {
  let newVoters, proposalId, voterAddress;

  switch(action.type) {
    case 'SET_CONTRACT':
      return {
        ...state,
        contract: action.contract
      }
    case 'SET_PROVIDER':
      return {
        ...state,
        provider: action.provider
      }
    case 'SET_CURRENT_USER':
      const userAddress = action.address.toLocaleLowerCase();
      const isVoter = state.voters.has(userAddress);
      const hasVoted = isVoter && !isNull(state.voters.get(userAddress));

      return {
        ...state,
        currentUser: {
          address: userAddress,
          isAdmin: state.owner === userAddress,
          isVoter,
          hasVoted
        }
      }
    case 'RESET_CURRENT_USER':
      return {
        ...state,
        currentUser: {
          address: null,
          isAdmin: null,
          isVoter: null,
          hasVoted: false,
        }
      }
    case 'SET_IS_LOADING':
      return {
        ...state,
        isLoading: action.bool
      }
    case 'CHANGE_STATUS':
      return {
        ...state,
        workflowStatus: workflowStatuses[action.index]
      }
    case 'ADD_VOTER':
      newVoters = new Map([...state.voters, [action.address.toLocaleLowerCase(), null]]);

      return {
        ...state,
        voters: newVoters,
        currentUser: {
          ...state.currentUser,
          isVoter: newVoters.has(state.currentUser.address)
        }
      }
    case 'ADD_PROPOSAL':
      return {
        ...state,
        proposals: new Map([
          ...state.proposals,
          [action.proposalId.toNumber(), 0]
        ])
      }
    case 'VOTE_FOR_PROPOSAL':
      proposalId = action.proposalId.toNumber();
      voterAddress = action.voterAddress.toLocaleLowerCase();

      return {
        ...state,
        currentUser: {
          ...state.currentUser,
          hasVoted: true
        },
        voters: new Map([
          ...state.voters,
          [voterAddress, proposalId]
        ]),
        proposals: new Map([
          ...state.proposals,
          [proposalId, state.proposals.get(proposalId) + 1]
        ])
      }

    default:
      return state;
  }
}

export const buildActionCreator = dispatch => ({
  setContract(contract) {
    dispatch({ type: 'SET_CONTRACT', contract })
  },
  setProvider(provider) {
    dispatch({ type: 'SET_PROVIDER', provider })
  },
  setCurrentUser(address) {
    dispatch({ type: 'SET_CURRENT_USER', address })
  },
  resetCurrentUser() {
    dispatch({ type: 'RESET_CURRENT_USER' })
  },
  setIsLoading(bool) {
    dispatch({ type: 'SET_IS_LOADING', bool })
  },
  onVoterAdded(address) {
    dispatch({ type: 'ADD_VOTER', address })
  },
  onProposalAdded(proposalId) {
    dispatch({ type: 'ADD_PROPOSAL', proposalId })
  },
  onVote(voterAddress, proposalId) {
    dispatch({ type: 'VOTE_FOR_PROPOSAL', voterAddress, proposalId })
  },
  onStatusChange(index) {
    dispatch({ type: 'CHANGE_STATUS', index: index })
  }
})