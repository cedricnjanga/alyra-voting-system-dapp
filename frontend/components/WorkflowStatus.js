import React, { useContext, useEffect, useRef, useState } from "react";

import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';

import { WalletContext } from '../src/walletContext';

export default function WorkflowStatus() {
  const { addFlashMessage, currentUser, callContract, proposals, workflowStatus, voters } = useContext(WalletContext);

  const handleClick = () => {
    switch(true) {
      case workflowStatus === 'RegisteringVoters' && voters.size === 0:
        return addFlashMessage({ severity: 'error', message: 'Please add at least one voter' });
      case workflowStatus === 'ProposalsRegistrationStarted' && proposals.size === 0:
        return addFlashMessage({ severity: 'error', message: 'Please add at least one proposal' });
      case workflowStatus === 'VotingSessionStarted':
        let totalVoteCount;

        for (const [_, voteCount] of proposals) {
          totalVoteCount += voteCount;
        }

        if (totalVoteCount === 0) {
          return addFlashMessage({ severity: 'error', message: 'You should let voters vote before ending voting session' }); 
        }    
    }

    goToNextStatus();
  }

  const goToNextStatus = async () => {
    const statusMap = {
      RegisteringVoters: 'startProposalsRegistering',
      ProposalsRegistrationStarted: 'endProposalsRegistering',
      ProposalsRegistrationEnded: 'startVotingSession',
      VotingSessionStarted: 'endVotingSession',
      VotingSessionEnded: 'tallyVotes',
      VotesTallied: null
    }

    const funcName = statusMap[workflowStatus];

    await callContract(contract => contract[funcName]());
  }

  const renderActions = () => (
    <CardActions className="flex justify-center">
      <Button
        size="small"
        disabled={workflowStatus === 'VotesTallied'}
        onClick={handleClick}
      >
        Go To Next Status
      </Button>
    </CardActions>
  )

  return (
    <Card className="mx-auto">
      <CardContent className="flex flex-col items-center">
        <div className="text-lg	font-bold">Workflow Status</div>
        <div className="font-light">{workflowStatus}</div>
      </CardContent>
      {currentUser.isAdmin && renderActions()}
    </Card>
  )
}