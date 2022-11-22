import { createContext, use, useCallback, useEffect, useReducer, useRef } from "react";
import { ethers } from "ethers";
import detectEthereumProvider from '@metamask/detect-provider';
import { isNull } from 'lodash'
import contractABI from './voting.json'
import { initialState, reducer, buildActionCreator } from "./state";
import { usePrevious } from "./hooks";

export const WalletContext = createContext(initialState);

const { Provider } = WalletContext;

export const WalletProvider = ({
  contractState,
  flashMessages,
  addFlashMessage,
  children,
}) => {
  const [state, dispatch] = useReducer(reducer, {...initialState, ...contractState});

  const {
    contract,
    currentUser,
    provider
  } = state;

  const actionCreator = buildActionCreator(dispatch);

  const {
    onProposalAdded,
    onStatusChange,
    onVote,
    onVoterAdded,
    setContract,
    resetCurrentUser,
    setCurrentUser,
    setIsLoading,
    setProvider
  } = actionCreator;

  // Refs
  const previousCurrentUser = usePrevious(currentUser);
  const previousContract = usePrevious(contract);
  const previousProvider = usePrevious(provider);
  
  const isLoggedIn = () => Boolean(currentUser.address);

  const getContract = () => contract.connect(provider.getSigner());

  const callContract = async callback => {
    setIsLoading(true);
  
    try {
      const transaction = await callback(getContract());
      await transaction.wait();
    } catch (e) {
      let message;
      try {
        const match = e.reason.match(/Error: VM Exception while processing transaction: reverted with reason string '(.*)'/);
        message = match[1];
      } catch (e) {
        message =  'Something went wrong';
      }

      addFlashMessage({ severity: 'error', message });
    }
  }

  const handleAccountChange = ([account]) => {
    console.log(account)
    Boolean(account) ? logIn(account) : resetCurrentUser();
  }

  const logIn = account => {
    if (account === state.currentUser.address) return;

    setCurrentUser(account);
  }

  const init = useCallback(async () => {
    const metamaskProvider = await detectEthereumProvider();

    const provider = new ethers.providers.Web3Provider(metamaskProvider);
    const contract = new ethers.Contract('0x5FbDB2315678afecb367f032d93F642f64180aa3', contractABI, provider);

    setContract(contract)
    setProvider(provider)

    metamaskProvider.on('accountsChanged', handleAccountChange);

    setIsLoading(true);
    await metamaskProvider.request({ method: 'eth_accounts'}).then(handleAccountChange);
    setIsLoading(false);
  });

  useEffect(() => {
    init();

    return () => {
      contract?.off('WorkflowStatusChange');
      contract?.off('VoterRegistered');
      contract?.off('ProposalRegistered');
      contract?.off('Voted');
    }
  }, []);

  useEffect(() => {
    const isInitPhase = (
      isNull(previousContract) &&
      !isNull(contract) &&
      isNull(previousProvider) &&
      !isNull(provider)
    );

    if (isInitPhase) {
      provider.once("block", () => {
        contract.on('WorkflowStatusChange', (_prevIndex, index) => {
          onStatusChange(index);
          addFlashMessage({ severity: 'success', message: 'WorkflowStatusChange' });
          setIsLoading(false);
        });
    
        contract.on('VoterRegistered', address => {
          onVoterAdded(address);
          addFlashMessage({ severity: 'success', message: 'VoterRegistered' });
          setIsLoading(false);
        });

        contract.on('ProposalRegistered', proposalId => {
          onProposalAdded(proposalId);
          addFlashMessage({ severity: 'success', message: 'ProposalRegistered' });
          setIsLoading(false);
        });

        contract.on('Voted', (voterAddress, proposalId) => {
          onVote(voterAddress, proposalId);
          addFlashMessage({ severity: 'success', message: `${voterAddress} voted for ${proposalId}` });
          setIsLoading(false);
        });
      });

      setIsLoading(false);
    }
  }, [contract, provider]);

  useEffect(() => {
    if (!previousCurrentUser.address && currentUser.address) {
      contract && provider &&  setIsLoading(false);
      return addFlashMessage({ severity: 'success', message: `Successfully logged in` });
    }

    if (previousCurrentUser.address !== currentUser.address) {
      return addFlashMessage({ severity: 'success', message: `Account successfully changed` });
    }
  }, [currentUser])

  return (
    <Provider
      value={{
        ...state,
        isLoggedIn,
        handleAccountChange,
        flashMessages,
        addFlashMessage,
        getContract,
        callContract,
        ...actionCreator
      }}
    >
      {children}
    </Provider>
  )
}
