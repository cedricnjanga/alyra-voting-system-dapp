import React, { useContext, useEffect, useRef, useState } from "react";

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

import { WalletContext } from '../src/walletContext';

export default function WorkflowStatus() {
  const { workflowStatus, proposals } = useContext(WalletContext);

   for (const [proposalId, voteCount] of proposals) {
      console.log({ proposalId, voteCount })
    }

  const isActive = workflowStatus === 'VotesTallied';

  const getWinningProposalId = () => {
    let winningProposal = { voteCount: 0 };

    if (!isActive) return '-'

    for (const [proposalId, voteCount] of proposals) {
      if (voteCount > winningProposal.voteCount) {
        winningProposal.id = proposalId;
      }
    }

    return winningProposal.id 
  }

  const cardOpacity = isActive ? 'opacity-100' : 'opacity-30'

  return (
    <Card className="mx-auto">
      <CardContent className={`flex flex-col items-center ${cardOpacity}`}>
        <div className="text-lg	font-bold">Winning Proposal Id</div>
        <div className="font-light">{getWinningProposalId()}</div>
      </CardContent>
    </Card>
  )
}