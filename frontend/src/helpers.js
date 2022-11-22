import { lowerCase } from 'lodash';

export const workflowStatuses = [
  'RegisteringVoters',
  'ProposalsRegistrationStarted',
  'ProposalsRegistrationEnded',
  'VotingSessionStarted',
  'VotingSessionEnded',
  'VotesTallied'
];

export const contractCall = async callback => {
  try {
    const transaction = await callback();
    await transaction.wait();
  } catch (e) {
    const match = e.reason.match(/'(.*)'/)
  
    if (!match) {
      throw new Error('Something went wrong');
    }

    throw(new Error(match[1]));
  }
}

export const getContractState = async (contract) => {
  const owner = await contract.owner();
  const workflowStatusIndex = await contract.workflowStatus();

  const voters = {}; // [address, votedProposalId]
  const proposals = {}; // [proposalId, voteCount]

  for (const event of await contract.queryFilter('VoterRegistered')) {
    const [address] = event.args
    voters[address.toLocaleLowerCase()] = null;
  }

  for (const event of await contract.queryFilter('ProposalRegistered')) {
    const [proposalId] = event.args
    proposals[proposalId.toNumber()] = 0;
  }

  for (const event of await contract.queryFilter('Voted')) {
    let [voterAddress, proposalId] = event.args;

    voterAddress = voterAddress.toLocaleLowerCase();
    proposalId = proposalId.toNumber();

    // Update voters votedProposalId
    voters[voterAddress] = proposalId;

    // Increment proposal vote count
    proposals[proposalId] += 1;
  }
    
  return {
    owner: owner.toLocaleLowerCase(),
    workflowStatus: workflowStatuses[workflowStatusIndex],
    voters,
    proposals
  }
}