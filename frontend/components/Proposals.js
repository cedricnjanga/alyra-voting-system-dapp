import React, { useContext, useState } from 'react';
import { isEmpty } from 'lodash';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';

import TextField from '@mui/material/TextField';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import { WalletContext } from '../src/walletContext';

export default function Proposals() {
  const [open, setOpen] = useState(false);
  const [voteDialogOpen, setVoteDialogOpen] = useState(false);
  const [proposal, setProposal] = useState('');
  const { callContract, currentUser, proposals, workflowStatus } = useContext(WalletContext);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const proposalsArray = Array.from(proposals);

  const renderTable = () => (
    <TableContainer component={Paper}>
      <Table stickyHeader aria-label="sticky table">
        <TableHead>
          <TableRow>
            <TableCell
                key='proposalId'
                align='center'
              >
                proposalId
              </TableCell>
            <TableCell
                key='voteCount'
                align='center'
              >
                Vote Count
              </TableCell>
              {currentUser.isVoter && (
                <TableCell
                  key='vote'
                  align='center'
                >
              </TableCell>
              )}
          </TableRow>
        </TableHead>
        <TableBody>
          {proposalsArray.map(([proposalId, voteCount]) => (
            <TableRow key={proposalId}>
              <TableCell key='proposalId' align='center'>{proposalId}</TableCell>
              <TableCell key='voteCount' align='center'>{voteCount}</TableCell>
              {currentUser.isVoter && (
                <TableCell
                  key='cote'
                  align='center'
                >
                <Button
                  disabled={!canVote()}
                  onClick={() => setVoteDialogOpen(true)}
                >
                  Vote
                </Button>
                <Dialog
                  open={voteDialogOpen}
                  onClose={() => setVoteDialogOpen(false)}
                  PaperComponent={Paper}
                >
                  <DialogContent>Are you sure you want to vote for this proposal ?</DialogContent>
                  <DialogActions>
                    <Button autoFocus onClick={() => setVoteDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => voteForProposal(proposalId)}>Confirm</Button>
                  </DialogActions>
                </Dialog>
              </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )

  const renderEmptyMessage = () => (
    <div className='bg-amber-200 text-amber-900 rounded h-12 w-2/3 mx-auto'>
      <p>Proposals list is empty</p>
    </div>
  )

  const renderActions = () => (
    <div>
      <Button
        onClick={handleOpen}
        className="bg-blue-800 text-white hover:bg-sky-700 mt-4"
      >
        <AddIcon />
        Add proposal
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        PaperComponent={Paper}
      >
        <DialogTitle>Add Proposal</DialogTitle>
        <DialogContent>
          <TextField
            onChange={e => setProposal(e.target.value)}
            value={proposal}
          />
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={submitProposal}>Submit</Button>
        </DialogActions>
      </Dialog>
    </div>
  )

  const submitProposal = async () => {
    await callContract(contract => contract.addProposal(proposal));
    setProposal('');
    handleClose();
  }

  const voteForProposal = async proposalId => {
    await callContract(contract => contract.setVote(proposalId));
    setVoteDialogOpen(false);
  }

  const canVote = () => {
    if (workflowStatus !== 'VotingSessionStarted') return false;
    return currentUser.isVoter && !currentUser.hasVoted
  }

  const canRegisterProposal = () => (
    workflowStatus === 'ProposalsRegistrationStarted' &&
    currentUser.isVoter
  )

  return (
    <div className='flex flex-col items-center w-full'>
      <p className='font-bold text-black text-2xl mb-4'>Proposals</p>
      {isEmpty(proposalsArray) && renderEmptyMessage()}
      {!isEmpty(proposalsArray) && renderTable()}
      {canRegisterProposal() && renderActions()}
    </div>
  )
}