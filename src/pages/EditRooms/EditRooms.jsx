import React from 'react';

import {CollectionsProvider} from 'hooks/rooms';
import PageTransition from 'components/PageTransition';
import {
  ContentContainer,
  PageContainer,
  SidebarContainer,
} from 'components/Containers';
import Room from './components/Room';
import Sidebar from './components/Sidebar';

export default function EditRooms() {
  return (
    <PageTransition>
      <PageContainer>
        <CollectionsProvider>
          <SidebarContainer>
            <Sidebar />
          </SidebarContainer>
          <ContentContainer>
            <Room />
          </ContentContainer>
        </CollectionsProvider>
      </PageContainer>
    </PageTransition>
  );
}
