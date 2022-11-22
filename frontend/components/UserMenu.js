import React, { useContext, useRef, useState } from "react";

import { isEmpty } from "lodash";

import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

import { WalletContext } from '../src/walletContext';

export default function UserMenu() {
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const btnRef = useRef(null);

  const menuAnchor = () => menuIsOpen ? btnRef.current : null;
  const { addFlashMessage, handleAccountChange, isLoggedIn, currentUser } = useContext(WalletContext);

  const toggleMenuIsOpen = () => {
    setMenuIsOpen(!menuIsOpen);
  }

  const onConnectButtonClick = async () => {
    if (isLoggedIn()) {
      return toggleMenuIsOpen();
    };

    try {
      await ethereum
      .request({ method: 'eth_requestAccounts' })
      .then(accounts => {
        handleAccountChange(accounts);
        addFlashMessage({ severity: 'success', message: 'Successfully logged in' });
      })
    } catch(e){
      console.warn(e);
      addFlashMessage({ severity: 'error', message: 'Could not log in' });
    } finally {
      toggleMenuIsOpen();
    }
  }

  const btnContent = () => {
    if (isLoggedIn()) {
      return "Connected";
    } else {
      return "Connect Wallet";
    }
  }

  const rolesContent = () => {
    const roles = [];

    currentUser.isAdmin && roles.push('Admin');
    currentUser.isVoter && roles.push('Voter');

    if (isEmpty(roles)) {
      return 'Unauthorized Wallet';
    }
  
    return `Roles: ${roles.join(', ')}`;
  }

  return (
    <div>
      <Button
        onClick={onConnectButtonClick}
        ref={btnRef}
      >
        <div className="text-white">{btnContent()}</div>
        <Menu
          id="user-menu"
          open={menuIsOpen}
          anchorEl={menuAnchor()}
        >
          <MenuItem>Address: {currentUser.address}</MenuItem>
          <MenuItem>{rolesContent()}</MenuItem>
        </Menu>
      </Button>
    </div>
  )
}