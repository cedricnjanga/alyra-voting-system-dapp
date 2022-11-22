import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';

import Divider from '@mui/material/Divider';

import WorkflowStatus from '../components/WorkflowStatus';
import WinningProposalId from '../components/WinningProposald';
import Proposals from '../components/Proposals';
import Voters from '../components/Voters';

export default function Home() {
 return (
  <List className='w-full flex flex-col'>
    <ListItem className='mb-4 flex justify-between'>
      <WorkflowStatus />
      <WinningProposalId />
    </ListItem>
    <Divider />
    <ListItem className='my-4'>
      <Voters />
    </ListItem>
    <Divider />
    <ListItem className='my-4'>
      <Proposals />
    </ListItem>
  </List>
 )
};