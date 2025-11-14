import React from 'react';
import { useNavigation } from '../context/NavigationContext.tsx';

// Import all screen components
import ChatListScreen from '../screens/Chat/ChatListScreen.tsx';
import SettingsScreen from '../screens/Settings/SettingsScreen.tsx';
import SearchScreen from '../screens/Misc/SearchScreen.tsx';
import WorkInProgressScreen from '../screens/Misc/WorkInProgressScreen.tsx';
import PrivacyAndSecurityScreen from '../screens/Settings/PrivacyAndSecurityScreen.tsx';
import BlockedUsersScreen from '../screens/Settings/BlockedUsersScreen.tsx';
import BlockUserSelectionScreen from '../screens/Settings/BlockUserSelectionScreen.tsx';
import ChatSettingsScreen from '../screens/Settings/ChatSettingsScreen.tsx';
import AutoDeleteMessagesScreen from '../screens/Settings/AutoDeleteMessagesScreen.tsx';
import EnterNewEmailScreen from '../screens/Settings/EnterNewEmailScreen.tsx';
import LastSeenOnlineScreen from '../screens/Settings/LastSeenOnlineScreen.tsx';
import PrivacyOptionScreen from '../screens/Settings/PrivacyOptionScreen.tsx';
import NotificationsAndSoundsScreen from '../screens/Settings/NotificationsAndSoundsScreen.tsx';
import NotificationSoundScreen from '../screens/Settings/NotificationSoundScreen.tsx';
import ChangeNumberScreen from '../screens/Profile/ChangeNumberScreen.tsx';
import UsernameScreen from '../screens/Profile/UsernameScreen.tsx';
import ProfileInfoScreen from '../screens/Profile/ProfileInfoScreen.tsx';
import CameraScreen from '../screens/Misc/CameraScreen.tsx';
import NewGroupScreen from '../screens/Group/NewGroupScreen.tsx';
import GroupInfoScreen from '../screens/Group/GroupInfoScreen.tsx';
import ChatScreen from '../screens/Chat/ChatScreen.tsx';
import GroupDetailsScreen from '../screens/Group/GroupDetailsScreen.tsx';
import EditGroupScreen from '../screens/Group/EditGroupScreen.tsx';
import GroupAutoDeleteScreen from '../screens/Group/GroupAutoDeleteScreen.tsx';
import ChatAutoDeleteScreen from '../screens/Chat/ChatAutoDeleteScreen.tsx';
import ChatSearchScreen from '../screens/Chat/ChatSearchScreen.tsx';
import GroupMembersScreen from '../screens/Group/GroupMembersScreen.tsx';
import AddMembersScreen from '../screens/Group/AddMembersScreen.tsx';
import UserProfileScreen from '../screens/Profile/UserProfileScreen.tsx';
import CallsScreen from '../screens/Call/CallsScreen.tsx';
import NewCallContactsScreen from '../screens/Call/NewCallContactsScreen.tsx';
import SavedMessagesScreen from '../screens/Misc/SavedMessagesScreen.tsx';
import ContactsScreen from '../screens/Contacts/ContactsScreen.tsx';
import FeaturesScreen from '../screens/Misc/FeaturesScreen.tsx';
import ContactSearchScreen from '../screens/Contacts/ContactSearchScreen.tsx';
import ForwardMessageScreen from '../screens/Misc/ForwardMessageScreen.tsx';
import SharedMediaScreen from '../screens/Misc/SharedMediaScreen.tsx';
import ActiveCallScreen from '../screens/Call/ActiveCallScreen.tsx';
import IncomingCallScreen from '../screens/Call/IncomingCallScreen.tsx';


const MainRouter: React.FC = () => {
    const { screen, screenOptions } = useNavigation();
    
    // Switch statement ini memetakan state `screen` ke komponen yang sesuai.
    // Opsi khusus layar diteruskan sebagai props jika diperlukan.
    switch (screen) {
        case 'settings': return <SettingsScreen />;
        case 'search': return <SearchScreen />;
        case 'privacyAndSecurity': return <PrivacyAndSecurityScreen />;
        case 'blockedUsers': return <BlockedUsersScreen />;
        case 'blockUserSelection': return <BlockUserSelectionScreen />;
        case 'chatSettings': return <ChatSettingsScreen />;
        case 'autoDeleteMessages': return <AutoDeleteMessagesScreen />;
        case 'enterNewEmail': return <EnterNewEmailScreen />;
        case 'lastSeenOnline': return <LastSeenOnlineScreen />;
        case 'phoneNumber': return <PrivacyOptionScreen title="Nomor Telepon" description="Siapa yang dapat melihat nomor telepon saya" settingKey="phoneNumberPrivacy" />;
        case 'profilePhotos': return <PrivacyOptionScreen title="Foto Profil" description="Siapa yang dapat melihat foto profil saya" settingKey="profilePhotoPrivacy" />;
        case 'forwardedMessages': return <PrivacyOptionScreen title="Pesan yang Diteruskan" description="Siapa yang dapat menambahkan tautan ke akun saya saat meneruskan pesan saya" settingKey="forwardedMessagesPrivacy" />;
        case 'callsPrivacy': return <PrivacyOptionScreen title="Panggilan" description="Siapa yang dapat menelepon saya" settingKey="callsPrivacy" />;
        case 'notificationsAndSounds': return <NotificationsAndSoundsScreen />;
        case 'notificationSound': return <NotificationSoundScreen type={screenOptions.type} title={screenOptions.title} />;
        case 'changeNumber': return <ChangeNumberScreen />;
        case 'username': return <UsernameScreen />;
        case 'profileInfo': return <ProfileInfoScreen />;
        case 'camera': return <CameraScreen />;
        case 'newGroup': return <NewGroupScreen />;
        case 'groupInfo': return <GroupInfoScreen />;
        case 'chat': return <ChatScreen />;
        case 'groupDetails': return <GroupDetailsScreen />;
        case 'editGroup': return <EditGroupScreen />;
        case 'groupAutoDelete': return <GroupAutoDeleteScreen />;
        case 'chatAutoDelete': return <ChatAutoDeleteScreen />;
        case 'chatSearch': return <ChatSearchScreen />;
        case 'groupMembers': return <GroupMembersScreen />;
        case 'addMembers': return <AddMembersScreen />;
        case 'userProfile': return <UserProfileScreen />;
        case 'calls': return <CallsScreen />;
        case 'newCallContacts': return <NewCallContactsScreen />;
        case 'savedMessages': return <SavedMessagesScreen />;
        case 'contacts': return <ContactsScreen />;
        case 'features': return <FeaturesScreen />;
        case 'contactSearch': return <ContactSearchScreen />;
        case 'forwardMessage': return <ForwardMessageScreen messageToForward={screenOptions.messageToForward} />;
        case 'sharedMedia': return <SharedMediaScreen chat={screenOptions.chat} />;
        case 'activeCall': return <ActiveCallScreen />;
        case 'incomingCall': return <IncomingCallScreen />;
        case 'wip': return <WorkInProgressScreen title={screenOptions.title || "Segera Hadir"} />;
        default: return <ChatListScreen />;
    }
};

export default MainRouter;
