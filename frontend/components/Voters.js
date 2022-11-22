import React, { useContext, useState } from 'react';
import { isEmpty } from 'lodash';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';

import { WalletContext } from '../src/walletContext';

export default function Voters() {
  const [voterAddress, setVoterAddress] = useState('');
  const { callContract, currentUser, voters, workflowStatus } = useContext(WalletContext);

  const votersArray = Array.from(voters);

  const renderTable = () => (
    <TableContainer component={Paper} className='mb-4'>
      <Table stickyHeader aria-label="sticky table">
        <TableHead>
          <TableRow>
            <TableCell
                key='address'
                align='center'
              >
                Address
              </TableCell>
            <TableCell
                key='votedProposalId'
                align='center'
              >
                Voted Proposal Id
              </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
        {votersArray.map(([address, votedProposalId]) => (
          <TableRow key={address}>
            <TableCell key='address' align='center'>{address}</TableCell>
            <TableCell key='votedProposalId' align='center'>{votedProposalId || '-'}</TableCell>
          </TableRow>
        ))}
        </TableBody>
      </Table>
    </TableContainer>
  )

  const renderEmptyMessage = () => (
    <div className='bg-amber-200 text-amber-900 rounded h-12 w-2/3 mx-auto p-auto mb-4'>
      <p>Voters list is empty</p>
    </div>
  )

  const renderActions = () => (
    <div className='flex w-full bg-white'>
      <TextField
        className='grow bg-white'
        onChange={e => setVoterAddress(e.target.value)}
        value={voterAddress}
      />
      <Button
        className="bg-blue-800 text-white"
        onClick={submitVoter}
      >
        <AddIcon />
        Add Voter
      </Button>
    </div>
  )

  const submitVoter = async () => {
    await callContract(contract => contract.addVoter(voterAddress));
    setVoterAddress('');
  }

  return (
    <div className='flex flex-col items-center w-full'>
      <p className='font-bold text-2xl text-black mb-4'>Voters</p>
      {isEmpty(votersArray) && renderEmptyMessage()}
      {!isEmpty(votersArray) && renderTable()}
      {(currentUser.isAdmin && workflowStatus === 'RegisteringVoters') && renderActions()}
    </div>
  )
}