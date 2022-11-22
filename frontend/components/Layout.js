import React, { useContext } from "react";

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import UserMenu from "./UserMenu";
import FlashMessage from './FlashMessage';

import { WalletContext } from '../src/walletContext';

export default function Layout({ children }) {
  const { currentUser, flashMessages, isLoading } = useContext(WalletContext);

  const renderContent = () => {
    if (isLoading) {
      return <CircularProgress />
    }

    if (!currentUser.address) {
      return (
        <div className="bg-sky-800	text-sky-50 h-24 rounded p-5">
          <p>You need to connect your wallet to interact with Voting app</p>
        </div>
      )
    }

    if (!currentUser.isAdmin && !currentUser.isVoter) {
      return (
        <div className="bg-sky-800	text-sky-50 h-24 rounded p-5">
          <p>You don't have permission to interact with Voting app</p>
        </div>
      )
    }

    return children;
  }

  return (
    <div>
      <Box>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Voting System
            </Typography>
            <UserMenu />
          </Toolbar>
        </AppBar>
      </Box>
      <div className="grid grid-cols-6">
        <div className="col-start-2 col-span-4 flex justify-center">
          {Array.from(flashMessages).map((flash, i) => (
            <FlashMessage key={i} {...flash} />
          ))}
        </div>
      <div className="col-start-2 col-span-4 flex justify-center w-full p-5">
        {renderContent()}
      </div>
      </div>
    </div>
  )
}